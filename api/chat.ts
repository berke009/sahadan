import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createGateway } from '@ai-sdk/gateway';
import { generateText, jsonSchema } from 'ai';

// Server env var: AI_GATEWAY_KEY (set in Vercel Dashboard)
// The AI SDK handles the gateway wire protocol internally.

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const aiKey = process.env.AI_GATEWAY_KEY || '';
  if (!aiKey) {
    return res.status(500).json({ error: 'AI_GATEWAY_KEY not configured on server' });
  }

  try {
    const { model, messages, tools, max_tokens } = req.body;
    const gateway = createGateway({ apiKey: aiKey });

    // Gateway model IDs need provider prefix: "openai/gpt-4o-mini"
    const gatewayModel = model?.includes('/')
      ? model
      : `openai/${model || 'gpt-4o'}`;

    // Convert OpenAI-format tools → AI SDK tools (without execute, so
    // generateText returns tool calls for the client to handle)
    const sdkTools: Record<string, { description?: string; inputSchema: any }> = {};
    if (tools) {
      for (const t of tools) {
        sdkTools[t.function.name] = {
          description: t.function.description,
          inputSchema: jsonSchema(
            t.function.parameters || { type: 'object' as const, properties: {} },
          ),
        };
      }
    }

    // Build tool_call_id → toolName map (needed for tool result messages)
    const toolNameMap: Record<string, string> = {};
    for (const m of messages) {
      if (m.role === 'assistant' && m.tool_calls) {
        for (const tc of m.tool_calls) {
          toolNameMap[tc.id] = tc.function.name;
        }
      }
    }

    // Convert OpenAI-format messages → AI SDK messages
    const sdkMessages = messages.map((m: any) => {
      if (m.role === 'system') {
        return { role: 'system' as const, content: m.content };
      }
      if (m.role === 'user') {
        return { role: 'user' as const, content: m.content };
      }
      if (m.role === 'assistant') {
        if (m.tool_calls?.length) {
          const parts: any[] = [];
          if (m.content) parts.push({ type: 'text', text: m.content });
          for (const tc of m.tool_calls) {
            let input = {};
            try { input = JSON.parse(tc.function.arguments || '{}'); } catch {}
            parts.push({
              type: 'tool-call',
              toolCallId: tc.id,
              toolName: tc.function.name,
              input,
            });
          }
          return { role: 'assistant' as const, content: parts };
        }
        return { role: 'assistant' as const, content: m.content || '' };
      }
      if (m.role === 'tool') {
        return {
          role: 'tool' as const,
          content: [{
            type: 'tool-result' as const,
            toolCallId: m.tool_call_id,
            toolName: toolNameMap[m.tool_call_id] || 'unknown',
            output: { type: 'text' as const, value: m.content },
          }],
        };
      }
      return m;
    });

    const result = await generateText({
      model: gateway(gatewayModel),
      messages: sdkMessages,
      tools: Object.keys(sdkTools).length > 0 ? sdkTools : undefined,
      maxOutputTokens: max_tokens || 1024,
    });

    // Convert AI SDK result → OpenAI format for the client
    const toolCalls = result.toolCalls?.length
      ? result.toolCalls.map((tc) => ({
          id: tc.toolCallId,
          type: 'function' as const,
          function: {
            name: tc.toolName,
            arguments: JSON.stringify(tc.input),
          },
        }))
      : undefined;

    const openaiResponse = {
      choices: [{
        message: {
          role: 'assistant',
          content: result.text || null,
          ...(toolCalls ? { tool_calls: toolCalls } : {}),
        },
        finish_reason: result.finishReason === 'tool-calls' ? 'tool_calls' : 'stop',
      }],
    };

    return res.status(200).json(openaiResponse);
  } catch (err: any) {
    console.error('[api/chat] Error:', err?.message);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
