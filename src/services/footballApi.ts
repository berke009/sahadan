import { RAPIDAPI_KEY } from '../constants/config';

const BASE_URL = 'https://api-football-v1.p.rapidapi.com/v3';

const HEADERS = {
  'X-RapidAPI-Key': RAPIDAPI_KEY,
  'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
};

async function apiFetch<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T | null> {
  if (!RAPIDAPI_KEY || RAPIDAPI_KEY === 'YOUR_RAPIDAPI_KEY') {
    console.warn('[footballApi] No RapidAPI key set — returning null');
    return null;
  }
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  try {
    const res = await fetch(url.toString(), { headers: HEADERS });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const json = await res.json();
    return json.response as T;
  } catch (e) {
    console.error('[footballApi]', e);
    return null;
  }
}

// ── League IDs ──────────────────────────────────────────────
export const LEAGUES = {
  superLig: 203,
  premierLeague: 39,
  laLiga: 140,
  serieA: 135,
  bundesliga: 78,
  championsLeague: 2,
  europaLeague: 3,
};

const SEASON = 2024;

// ── Fixtures ────────────────────────────────────────────────

export interface ApiFixture {
  fixture: { id: number; date: string; status: { short: string; elapsed: number | null } };
  league: { id: number; name: string; logo: string };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: { home: number | null; away: number | null };
  events?: ApiEvent[];
}

export interface ApiEvent {
  time: { elapsed: number };
  team: { name: string };
  player: { name: string };
  assist: { name: string | null };
  type: string;
  detail: string;
}

export async function getTodayFixtures(leagueId?: number): Promise<ApiFixture[]> {
  const today = new Date().toISOString().split('T')[0];
  const params: Record<string, string | number> = { date: today, season: SEASON };
  if (leagueId) params.league = leagueId;
  const data = await apiFetch<ApiFixture[]>('/fixtures', params);
  return data ?? [];
}

export async function getLiveFixtures(leagueId?: number): Promise<ApiFixture[]> {
  const params: Record<string, string | number> = { live: 'all' };
  if (leagueId) params.league = leagueId;
  const data = await apiFetch<ApiFixture[]>('/fixtures', params);
  return data ?? [];
}

export async function getFixtureById(fixtureId: number): Promise<ApiFixture | null> {
  const data = await apiFetch<ApiFixture[]>('/fixtures', { id: fixtureId });
  return data?.[0] ?? null;
}

export async function getUpcomingFixtures(leagueId: number, next = 10): Promise<ApiFixture[]> {
  const data = await apiFetch<ApiFixture[]>('/fixtures', { league: leagueId, season: SEASON, next });
  return data ?? [];
}

// ── Standings ────────────────────────────────────────────────

export interface ApiStanding {
  rank: number;
  team: { id: number; name: string; logo: string };
  points: number;
  goalsDiff: number;
  all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
  form: string;
}

export async function getStandings(leagueId: number): Promise<ApiStanding[]> {
  type Raw = [{ league: { standings: ApiStanding[][] } }];
  const data = await apiFetch<Raw>('/standings', { league: leagueId, season: SEASON });
  return data?.[0]?.league?.standings?.[0] ?? [];
}

// ── Top Scorers ─────────────────────────────────────────────

export interface ApiScorer {
  player: { id: number; name: string; photo: string };
  statistics: [{
    team: { name: string; logo: string };
    goals: { total: number; assists: number };
    games: { appearences: number };
  }];
}

export async function getTopScorers(leagueId: number): Promise<ApiScorer[]> {
  const data = await apiFetch<ApiScorer[]>('/players/topscorers', { league: leagueId, season: SEASON });
  return data ?? [];
}

// ── Head to Head ─────────────────────────────────────────────

export async function getHeadToHead(team1Id: number, team2Id: number, last = 10): Promise<ApiFixture[]> {
  const data = await apiFetch<ApiFixture[]>('/fixtures/headtohead', {
    h2h: `${team1Id}-${team2Id}`,
    last,
  });
  return data ?? [];
}

// ── Team Statistics ──────────────────────────────────────────

export interface ApiTeamStats {
  team: { id: number; name: string; logo: string };
  form: string;
  goals: {
    for: { total: { total: number }; average: { total: string } };
    against: { total: { total: number } };
  };
  clean_sheet: { total: number };
  fixtures: { wins: { total: number }; draws: { total: number }; loses: { total: number }; played: { total: number } };
  goals_distribution?: {
    for: { minute: Record<string, { total: number | null; percentage: string | null }> };
    against: { minute: Record<string, { total: number | null; percentage: string | null }> };
  };
}

export async function getTeamStats(teamId: number, leagueId: number): Promise<ApiTeamStats | null> {
  const data = await apiFetch<ApiTeamStats>('/teams/statistics', {
    team: teamId,
    league: leagueId,
    season: SEASON,
  });
  return data ?? null;
}

// ── Player Stats ─────────────────────────────────────────────

export interface ApiPlayer {
  player: { id: number; name: string; photo: string; nationality: string; age: number };
  statistics: [{
    team: { name: string };
    games: { appearences: number; minutes: number; rating: string | null };
    goals: { total: number | null; assists: number | null };
    cards: { yellow: number; red: number };
    shots: { on: number | null };
    passes: { accuracy: number | null };
  }];
}

export async function getPlayerStats(playerId: number): Promise<ApiPlayer | null> {
  const data = await apiFetch<ApiPlayer[]>('/players', { id: playerId, season: SEASON });
  return data?.[0] ?? null;
}

// ── Team Search ──────────────────────────────────────────────

export interface ApiTeam {
  team: { id: number; name: string; logo: string };
  venue: { name: string };
}

export async function searchTeam(name: string): Promise<ApiTeam[]> {
  const data = await apiFetch<ApiTeam[]>('/teams', { search: name });
  return data ?? [];
}
