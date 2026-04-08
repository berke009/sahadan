import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateText } from 'ai';
import { gateway } from '@ai-sdk/gateway';
import { z } from 'zod';

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

    // Convert raw JSON schema tools to AI SDK zod tools
    const sdkTools: Record<string, any> = {};
    if (rawTools) {
      for (const t of rawTools) {
        const fn = t.function;
        // Build a zod object from JSON schema properties
        const props = fn.parameters?.properties ?? {};
        const required: string[] = fn.parameters?.required ?? [];
        const shape: Record<string, z.ZodTypeAny> = {};
        for (const [key, val] of Object.entries(props as Record<string, any>)) {
          let field: z.ZodTypeAny =
            val.type === 'number' ? z.number() : z.string();
          if (!required.includes(key)) field = field.optional();
          shape[key] = field;
        }
        sdkTools[fn.name] = {
          description: fn.description,
          parameters: z.object(shape),
        };
      }
    }

    const result = await (generateText as any)({
      model: gateway('openai/gpt-4o-mini'),
      system: systemMsg,
      messages: chatMessages,
      tools: Object.keys(sdkTools).length ? sdkTools : undefined,
      toolChoice: 'auto',
      maxTokens: 1024,
    });

    // Return OpenAI-compatible shape so frontend works unchanged
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
                      arguments: JSON.stringify(toolCall.args ?? toolCall.input ?? {}),
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
    console.error('[api/chat] Error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
