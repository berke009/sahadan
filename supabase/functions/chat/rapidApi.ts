const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY') || '';
const BASE_URL = 'https://api-football-v1.p.rapidapi.com/v3';

const headers = {
  'X-RapidAPI-Key': RAPIDAPI_KEY,
  'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
};

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();

const TTL = {
  standings: 3600000,   // 1 hour
  fixtures: 300000,     // 5 minutes
  odds: 60000,          // 1 minute
  players: 3600000,     // 1 hour
  live: 30000,          // 30 seconds
  topscorers: 3600000,  // 1 hour
  h2h: 3600000,         // 1 hour
  events: 60000,        // 1 minute
};

async function cachedFetch(url: string, ttlKey: keyof typeof TTL): Promise<any> {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < TTL[ttlKey]) {
    return cached.data;
  }

  const response = await fetch(url, { headers });
  const data = await response.json();

  cache.set(url, { data, timestamp: Date.now() });
  return data;
}

// Turkish Super Lig league ID = 203, season = current
const LEAGUE_ID = 203;
const SEASON = new Date().getFullYear();

export async function fetchFixtures(date?: string): Promise<any> {
  const dateParam = date || new Date().toISOString().split('T')[0];
  const url = `${BASE_URL}/fixtures?league=${LEAGUE_ID}&season=${SEASON}&date=${dateParam}`;
  return cachedFetch(url, 'fixtures');
}

export async function fetchLiveFixtures(): Promise<any> {
  const url = `${BASE_URL}/fixtures?live=all&league=${LEAGUE_ID}`;
  return cachedFetch(url, 'live');
}

export async function fetchOdds(fixtureId: number): Promise<any> {
  const url = `${BASE_URL}/odds?fixture=${fixtureId}`;
  return cachedFetch(url, 'odds');
}

export async function fetchStandings(): Promise<any> {
  const url = `${BASE_URL}/standings?league=${LEAGUE_ID}&season=${SEASON}`;
  return cachedFetch(url, 'standings');
}

export async function fetchHeadToHead(teamId1: number, teamId2: number): Promise<any> {
  const url = `${BASE_URL}/fixtures/headtohead?h2h=${teamId1}-${teamId2}&last=10`;
  return cachedFetch(url, 'h2h');
}

export async function fetchPlayerStats(playerId: number): Promise<any> {
  const url = `${BASE_URL}/players?id=${playerId}&season=${SEASON}`;
  return cachedFetch(url, 'players');
}

export async function fetchTopScorers(): Promise<any> {
  const url = `${BASE_URL}/players/topscorers?league=${LEAGUE_ID}&season=${SEASON}`;
  return cachedFetch(url, 'topscorers');
}

export async function fetchFixtureEvents(fixtureId: number): Promise<any> {
  const url = `${BASE_URL}/fixtures/events?fixture=${fixtureId}`;
  return cachedFetch(url, 'events');
}
