import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateText } from 'ai';
import { gateway } from '@ai-sdk/gateway';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages, tools } = req.body;

    // Extract system message and user/assistant messages
    const systemMsg = messages.find((m: any) => m.role === 'system')?.content ?? '';
    const chatMessages = messages.filter((m: any) => m.role !== 'system');

    const result = await generateText({
      model: gateway('openai/gpt-4o-mini'),
      system: systemMsg,
      messages: chatMessages,
      tools: tools
        ? Object.fromEntries(
            tools.map((t: any) => [
              t.function.name,
              {
                description: t.function.description,
                parameters: t.function.parameters,
              },
            ])
          )
        : undefined,
      maxTokens: 1024,
    });

    // Return OpenAI-compatible response shape the frontend expects
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
                      arguments: JSON.stringify(toolCall.args),
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
