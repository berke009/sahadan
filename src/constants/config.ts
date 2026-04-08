export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://kcsyalgzdzkzozhojxet.supabase.co';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjc3lhbGd6ZHprem96aG9qeGV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1ODMyNTksImV4cCI6MjA5MTE1OTI1OX0.wdlRmzdfSpi5wLO_yV4sq0IIPQ0i07N3biFDBTPPnJ8';

// ── Real data API keys ──────────────────────────────────────
// Get from: https://rapidapi.com/api-sports/api/api-football
export const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY || 'YOUR_RAPIDAPI_KEY';

// Get from: Vercel Dashboard → AI → Gateway
export const AI_GATEWAY_KEY = process.env.EXPO_PUBLIC_AI_GATEWAY_KEY || 'YOUR_AI_GATEWAY_KEY';

export const IS_OFFLINE = !SUPABASE_ANON_KEY;

if (__DEV__) {
  console.log('[config] AI_GATEWAY_KEY loaded:', AI_GATEWAY_KEY !== 'YOUR_AI_GATEWAY_KEY' ? 'YES' : 'NO (placeholder)');
  console.log('[config] RAPIDAPI_KEY loaded:', RAPIDAPI_KEY !== 'YOUR_RAPIDAPI_KEY' ? 'YES' : 'NO (placeholder)');
}
