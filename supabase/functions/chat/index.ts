import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { TOOL_DEFINITIONS } from './tools.ts';
import { executeTool } from './executor.ts';

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const SYSTEM_PROMPT = `Sen ChatBet uygulamasinin AI asistanisin. Turk spor bahis piyasasi konusunda uzman bir asistansin.

KURALLAR:
- Her zaman Turkce yanit ver
- Para birimi olarak TL kullan
- Turkiye Super Lig'e ve Turk bahis piyasasina oncelik ver
- Kullanici mac sordigunda get_hot_matches aracini kullan
- Kullanici oran sordigunda get_match_odds aracini kullan
- Kullanici oyuncu sordigunda get_player_analysis aracini kullan
- Kullanici kupon istediginde create_coupon aracini kullan
- Kullanici puan durumu sordigunda get_league_standings aracini kullan
- Kullanici iki takimi karsilastirmak istediginde get_head_to_head aracini kullan
- Kullanici takim formu sordigunda get_team_form aracini kullan
- Kullanici gol dagilimi istediginde get_goal_distribution aracini kullan
- Kullanici gol kralligi sordigunda get_top_scorers aracini kullan
- Kullanici canli skor sordigunda get_live_scores aracini kullan
- Kullanici oran degisimi sordigunda get_live_odds aracini kullan
- Kullanici mac olaylari sordigunda get_match_timeline aracini kullan
- Kullanici canli yorum istediginde get_live_commentary aracini kullan
- Kullanici populer bahisler sordigunda get_popular_bets aracini kullan
- Kullanici tahmin yapmak istediginde submit_prediction veya get_prediction_results aracini kullan
- Kullanici bahis gecmisi sordigunda get_bet_history aracini kullan
- Kullanici kar zarar sordigunda get_profit_loss aracini kullan
- Kullanici bakiye sordigunda get_balance_summary aracini kullan
- Samimi ve yardimci ol, bahis onerileri verirken dikkatli ol
- Widget gosterildikten sonra kisa bir aciklama yaz`;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Yetkilendirme gerekli' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Gecersiz token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { session_id, message } = await req.json();

    // Save user message
    await supabase.from('messages').insert({
      session_id,
      role: 'user',
      content: message,
    });

    // Load conversation history
    const { data: history } = await supabase
      .from('messages')
      .select('role, content, widget_type')
      .eq('session_id', session_id)
      .order('created_at', { ascending: true })
      .limit(20);

    const messages: any[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(history || []).map((m: any) => ({
        role: m.role,
        content: m.content || `[Widget: ${m.widget_type}]`,
      })),
    ];

    // Call OpenRouter with tool-calling loop
    let finalContent = '';
    let widgetType = '';
    let widgetPayload: any = null;
    let loopCount = 0;
    const MAX_LOOPS = 3;

    while (loopCount < MAX_LOOPS) {
      loopCount++;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://chatbet.app',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages,
          tools: TOOL_DEFINITIONS,
          tool_choice: 'auto',
          max_tokens: 1024,
        }),
      });

      const data = await response.json();
      const choice = data.choices?.[0];

      if (!choice) {
        finalContent = 'Bir hata olustu, lutfen tekrar deneyin.';
        break;
      }

      const assistantMessage = choice.message;

      // If the model wants to call tools
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        messages.push(assistantMessage);

        for (const toolCall of assistantMessage.tool_calls) {
          const toolName = toolCall.function.name;
          const toolArgs = JSON.parse(toolCall.function.arguments || '{}');

          const { result, widget_type } = executeTool(toolName, toolArgs);

          // Keep track of the last widget for the response
          if (widget_type) {
            widgetType = widget_type;
            widgetPayload = { type: widget_type, ...result };
          }

          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          });
        }
        // Continue the loop so the model can process tool results
        continue;
      }

      // Final text response
      finalContent = assistantMessage.content || '';
      break;
    }

    // Save assistant message with widget
    const { data: savedMsg } = await supabase
      .from('messages')
      .insert({
        session_id,
        role: 'assistant',
        content: finalContent,
        widget_type: widgetType || null,
        widget_payload: widgetPayload || null,
      })
      .select('id')
      .single();

    return new Response(
      JSON.stringify({
        id: savedMsg?.id,
        content: finalContent,
        widget_type: widgetType || null,
        widget_payload: widgetPayload || null,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Chat function error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Sunucu hatasi' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
