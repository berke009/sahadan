import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateText, tool } from 'ai';
import { createGateway } from '@ai-sdk/gateway';
import { z } from 'zod';

const gatewayProvider = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY,
});

// Static tool definitions using tool() helper — works with both OpenAI and Anthropic
const TOOLS = {
  get_today_fixtures: tool({
    description: "Bugünkü futbol maçlarını getirir. Kullanım: 'bugün maç var mı', 'akşam maçları', 'fikstür', 'today matches', 'fixtures'",
    inputSchema: z.object({
      league_id: z.number().optional().describe('Lig ID: 203=Süper Lig (varsayılan), 39=Premier League, 140=La Liga, 135=Serie A, 78=Bundesliga, 2=Şampiyonlar Ligi'),
    }),
  }),
  get_live_scores: tool({
    description: "Şu an oynanan canlı maçları getirir. Kullanım: 'canlı', 'canlı skor', 'live', 'kaç kaç', 'şu an oynuyor mu'",
    inputSchema: z.object({
      league_id: z.number().optional().describe('Opsiyonel lig filtresi'),
    }),
  }),
  get_standings: tool({
    description: "Lig puan durumu tablosunu getirir. Kullanım: 'puan durumu', 'tablo', 'sıralama', 'standings', 'league table'",
    inputSchema: z.object({
      league_id: z.number().describe('Lig ID: 203=Süper Lig, 39=Premier League, 140=La Liga, 135=Serie A, 78=Bundesliga, 2=Şampiyonlar Ligi'),
    }),
  }),
  get_top_scorers: tool({
    description: "Ligin gol krallığı listesini getirir. Kullanım: 'gol krallığı', 'en çok gol atan', 'golcüler', 'top scorers', 'golden boot'",
    inputSchema: z.object({
      league_id: z.number().describe('Lig ID: 203=Süper Lig, 39=Premier League, 140=La Liga, 135=Serie A, 78=Bundesliga'),
    }),
  }),
  get_team_form: tool({
    description: "Bir takımın son maç formunu ve istatistiklerini getirir. Kullanım: '[takım] formu', 'nasıl oynuyor', 'son maçları', 'team form', 'recent results'",
    inputSchema: z.object({
      team_name: z.string().describe('Takım adı. Örnek: Galatasaray, Fenerbahçe, Arsenal, Barcelona'),
      league_id: z.number().optional().describe('Opsiyonel lig ID'),
    }),
  }),
  get_head_to_head: tool({
    description: "İki takım arasındaki geçmiş maç istatistiklerini getirir. Kullanım: '[takım1] vs [takım2]', 'karşılaştır', 'h2h', 'derbisi', 'head to head'",
    inputSchema: z.object({
      team1_name: z.string().describe('Birinci takım adı'),
      team2_name: z.string().describe('İkinci takım adı'),
    }),
  }),
};

const SYSTEM_PROMPT = `Sen SAHADAN — Türkiye'nin en iyi futbol analiz uygulamasının AI asistanısın.

DILLER: Kullanıcı Türkçe yazarsa Türkçe, İngilizce yazarsa İngilizce yanıt ver.

WIDGET SİSTEMİ — KRİTİK KURALLAR:
Kullanıcı futbolla ilgili herhangi bir şey sorduğunda MUTLAKA ilgili tool'u çağır.

Tool → Widget Eşleştirmesi:
- Maç/fikstür sorusu → get_today_fixtures
- Canlı skor → get_live_scores
- Puan durumu/tablo → get_standings
- Gol krallığı → get_top_scorers
- Takım formu/istatistik → get_team_form
- İki takım karşılaştırma/h2h → get_head_to_head

LİG KİMLİKLERİ:
- 203 = Türkiye Süper Lig (varsayılan)
- 39  = Premier League
- 140 = La Liga
- 135 = Serie A
- 78  = Bundesliga
- 2   = UEFA Şampiyonlar Ligi

KURALLAR:
- Widget sonrası maksimum 2 kısa cümle yaz
- Lig belirtilmezse Süper Lig (203) kullan
- Bahis tavsiyesi verme`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages } = req.body;

    // Filter out system messages from frontend — we use our own
    const chatMessages = (messages as any[]).filter((m) => m.role !== 'system');

    const result = await generateText({
      model: gatewayProvider('openai/gpt-4o-mini'),
      system: SYSTEM_PROMPT,
      messages: chatMessages,
      tools: TOOLS,
      toolChoice: 'auto',
      maxTokens: 1024,
    });

    const toolCall = result.toolCalls?.[0];

    return res.status(200).json({
      choices: [
        {
          message: {
            role: 'assistant',
            content: result.text || null,
            tool_calls: toolCall
              ? [
                  {
                    id: toolCall.toolCallId,
                    type: 'function',
                    function: {
                      name: toolCall.toolName,
                      arguments: JSON.stringify((toolCall as any).input ?? (toolCall as any).args ?? {}),
                    },
                  },
                ]
              : undefined,
          },
          finish_reason: toolCall ? 'tool_calls' : 'stop',
        },
      ],
    });
  } catch (err: any) {
    console.error('[api/chat] Error:', err?.message ?? err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
