import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateText, jsonSchema } from 'ai';
import { createGateway } from '@ai-sdk/gateway';

const gatewayProvider = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages, tools: rawTools } = req.body;

    const systemMsg = messages.find((m: any) => m.role === 'system')?.content ?? '';
    const chatMessages = messages.filter((m: any) => m.role !== 'system');

    // Build tools using jsonSchema — preserves exact JSON Schema structure
    const sdkTools: Record<string, any> = {};
    if (rawTools) {
      for (const t of rawTools) {
        const fn = t.function;
        sdkTools[fn.name] = {
          description: fn.description,
          parameters: jsonSchema({
            type: 'object' as const,
            properties: fn.parameters?.properties ?? {},
            ...(fn.parameters?.required?.length ? { required: fn.parameters.required } : {}),
          }),
        };
      }
    }

    const result = await generateText({
      model: gatewayProvider('openai/gpt-4o-mini'),
      system: systemMsg,
      messages: chatMessages,
      tools: Object.keys(sdkTools).length ? sdkTools : undefined,
      toolChoice: 'auto',
      maxTokens: 1024,
    } as any);

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
                      arguments: JSON.stringify((toolCall as any).args ?? {}),
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
