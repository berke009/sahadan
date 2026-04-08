import type { VercelRequest, VercelResponse } from '@vercel/node';

const AI_GATEWAY_KEY = process.env.AI_GATEWAY_API_KEY || '';
// Vercel AI Gateway base URL
const GATEWAY_URL = 'https://gateway.ai.vercel.app/openai/v1/chat/completions';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages, tools } = req.body;

    // Forward raw OpenAI-format request — no schema conversion
    const response = await fetch(GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_GATEWAY_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 1024,
        messages,
        tools,
        tool_choice: 'auto',
      }),
    });

    const text = await response.text();

    if (!response.ok) {
      console.error('[api/chat] Gateway error:', response.status, text);
      return res.status(response.status).json({ error: `AI Gateway error ${response.status}: ${text}` });
    }

    return res.status(200).send(text);
  } catch (err: any) {
    console.error('[api/chat] Error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
