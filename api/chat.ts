import type { VercelRequest, VercelResponse } from '@vercel/node';

const AI_GATEWAY_KEY = process.env.EXPO_PUBLIC_AI_GATEWAY_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, tools, tool_choice } = req.body;

    const response = await fetch('https://gateway.vercel.ai/openai/v1/chat/completions', {
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
        tool_choice: tool_choice ?? 'auto',
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return res.status(response.status).json({ error: `AI Gateway error ${response.status}: ${errText}` });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err: any) {
    console.error('[api/chat] Error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
