import type { VercelRequest, VercelResponse } from '@vercel/node';

// Thin proxy — forwards the frontend's OpenAI-format request to the AI provider.
// API key stays server-side. No SDK, no schema conversion.

const AI_KEY = process.env.AI_GATEWAY_API_KEY || '';
const AI_URL = 'https://ai-gateway.vercel.sh/v3/ai/language-model';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!AI_KEY) {
    return res.status(500).json({ error: 'AI_GATEWAY_API_KEY not configured on server' });
  }

  try {
    // Forward the request body as-is (messages, tools, model, etc.)
    const response = await fetch(AI_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();

    if (!response.ok) {
      console.error('[api/chat] AI error:', response.status, text);
      return res.status(response.status).json({ error: text });
    }

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(text);
  } catch (err: any) {
    console.error('[api/chat] Fetch error:', err?.message);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
