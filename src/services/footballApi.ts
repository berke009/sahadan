/**
 * Football data service — powered by ESPN's public API (no key required).
 * ESPN API: https://site.api.espn.com/apis/site/v2/sports/soccer/{slug}/...
 *
 * All functions maintain the same signatures as before so aiChat.ts is unchanged.
 */

const ESPN_SITE = 'https://site.api.espn.com/apis/site/v2/sports/soccer';
const ESPN_V2   = 'https://site.api.espn.com/apis/v2/sports/soccer';

export class FootballApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'FootballApiError';
  }
}

// ── League mappings ────────────────────────────────────────────

export const LEAGUES = {
  superLig:       203,
  premierLeague:  39,
  laLiga:         140,
  serieA:         135,
  bundesliga:     78,
  championsLeague: 2,
  europaLeague:   3,
};

const SLUG_MAP: Record<number, string> = {
  203: 'tur.1',
  39:  'eng.1',
  140: 'esp.1',
  135: 'ita.1',
  78:  'ger.1',
  2:   'uefa.champions',
  3:   'uefa.europa',
};

function getSlug(leagueId: number): string {
  return SLUG_MAP[leagueId] ?? 'tur.1';
}

// ── Data helpers ───────────────────────────────────────────────

function getLogo(team: Record<string, unknown>): string {
  if (typeof team.logo === 'string') return team.logo;
  const logos = team.logos as { href: string }[] | undefined;
  if (logos?.length) return logos[0].href;
  return `https://a.espncdn.com/i/teamlogos/soccer/500/${team.id}.png`;
}

function getScore(score: unknown): number | null {
  if (score === null || score === undefined) return null;
  if (typeof score === 'number') return Math.round(score);
  if (typeof score === 'string') { const n = parseInt(score); return isNaN(n) ? null : n; }
  if (typeof score === 'object' && score !== null) {
    const s = score as Record<string, unknown>;
    if ('displayValue' in s) return parseInt(s.displayValue as string) || 0;
    if ('value' in s) return Math.round(s.value as number);
  }
  return null;
}

function getStat(stats: { name: string; value: number }[], name: string): number {
  return stats?.find(s => s.name === name)?.value ?? 0;
}

function getCatStat(cats: { name: string; stats: { name: string; value: number }[] }[], catName: string, statName: string): number {
  const cat = cats?.find(c => c.name === catName);
  return cat?.stats?.find(s => s.name === statName)?.value ?? 0;
}

function mapStatus(espnStatus: string, clockDisplay?: string): { short: string; elapsed: number | null } {
  const min = clockDisplay ? parseInt(clockDisplay.split(':')[0]) : null;
  switch (espnStatus) {
    case 'STATUS_SCHEDULED':    return { short: 'NS',  elapsed: null };
    case 'STATUS_IN_PROGRESS':  return { short: min !== null && min > 45 ? '2H' : '1H', elapsed: min };
    case 'STATUS_HALFTIME':     return { short: 'HT',  elapsed: 45 };
    case 'STATUS_FULL_TIME':    return { short: 'FT',  elapsed: 90 };
    case 'STATUS_END_PERIOD':   return { short: 'FT',  elapsed: 90 };
    case 'STATUS_EXTRA_TIME':   return { short: 'ET',  elapsed: 90 };
    case 'STATUS_POSTPONED':    return { short: 'PST', elapsed: null };
    case 'STATUS_CANCELED':     return { short: 'CANC', elapsed: null };
    default:                    return { short: 'NS',  elapsed: null };
  }
}

// ── Interfaces (identical to before — aiChat.ts unchanged) ─────

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

export interface ApiStanding {
  rank: number;
  team: { id: number; name: string; logo: string };
  points: number;
  goalsDiff: number;
  all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
  form: string;
}

export interface ApiScorer {
  player: { id: number; name: string; photo: string };
  statistics: [{
    team: { name: string; logo: string };
    goals: { total: number; assists: number };
    games: { appearences: number };
  }];
}

export interface ApiTeamStats {
  team: { id: number; name: string; logo: string };
  form: string;
  goals: {
    for: { total: { total: number }; average: { total: string } };
    against: { total: { total: number } };
  };
  clean_sheet: { total: number };
  fixtures: { wins: { total: number }; draws: { total: number }; loses: { total: number }; played: { total: number } };
  recent_fixtures?: ApiFixture[];
}

export interface ApiTeam {
  team: { id: number; name: string; logo: string };
  venue: { name: string };
}

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

// ── Internal fetch helper ─────────────────────────────────────

async function espnFetch(url: string): Promise<unknown> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`[footballApi] ESPN ${url} → ${res.status}`);
      return null;
    }
    return res.json();
  } catch (e) {
    console.error('[footballApi] fetch error:', e);
    return null;
  }
}

// ── Transform ESPN scoreboard event → ApiFixture ──────────────

function eventToFixture(event: Record<string, unknown>, leagueId: number, leagueName: string, leagueLogo: string): ApiFixture | null {
  const competitions = event.competitions as Record<string, unknown>[] | undefined;
  const comp = competitions?.[0];
  if (!comp) return null;

  const competitors = comp.competitors as Record<string, unknown>[] | undefined;
  const homeComp = competitors?.find(c => c.homeAway === 'home');
  const awayComp = competitors?.find(c => c.homeAway === 'away');
  if (!homeComp || !awayComp) return null;

  const statusType = (comp.status as Record<string, unknown>)?.type as Record<string, unknown> | undefined;
  const statusName = statusType?.name as string ?? 'STATUS_SCHEDULED';
  const clockDisplay = ((comp.status as Record<string, unknown>)?.displayClock as string | undefined);
  const statusInfo = mapStatus(statusName, clockDisplay);

  const isScheduled = statusName === 'STATUS_SCHEDULED';

  return {
    fixture: {
      id: parseInt(event.id as string),
      date: (comp.startDate ?? event.date) as string,
      status: statusInfo,
    },
    league: { id: leagueId, name: leagueName, logo: leagueLogo },
    teams: {
      home: {
        id: parseInt((homeComp.team as Record<string, unknown>).id as string),
        name: (homeComp.team as Record<string, unknown>).displayName as string,
        logo: getLogo(homeComp.team as Record<string, unknown>),
      },
      away: {
        id: parseInt((awayComp.team as Record<string, unknown>).id as string),
        name: (awayComp.team as Record<string, unknown>).displayName as string,
        logo: getLogo(awayComp.team as Record<string, unknown>),
      },
    },
    goals: {
      home: isScheduled ? null : getScore(homeComp.score),
      away: isScheduled ? null : getScore(awayComp.score),
    },
  };
}

// ── Today's fixtures ──────────────────────────────────────────

export async function getTodayFixtures(leagueId?: number): Promise<ApiFixture[]> {
  const slug = getSlug(leagueId ?? LEAGUES.superLig);
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const data = await espnFetch(`${ESPN_SITE}/${slug}/scoreboard?dates=${today}`) as Record<string, unknown> | null;
  if (!data) return [];

  const leagues = data.leagues as Record<string, unknown>[] | undefined;
  const leagueName = leagues?.[0]?.name as string ?? 'Football';
  const leagueLogo = getLogo((leagues?.[0] ?? {}) as Record<string, unknown>);

  const events = data.events as Record<string, unknown>[] ?? [];
  return events
    .map(e => eventToFixture(e, leagueId ?? LEAGUES.superLig, leagueName, leagueLogo))
    .filter((f): f is ApiFixture => f !== null);
}

// ── Live fixtures ─────────────────────────────────────────────

export async function getLiveFixtures(leagueId?: number): Promise<ApiFixture[]> {
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const slugs = leagueId ? [getSlug(leagueId)] : Object.values(SLUG_MAP);
  const idBySlug = Object.fromEntries(Object.entries(SLUG_MAP).map(([id, slug]) => [slug, parseInt(id)]));

  const results = await Promise.all(
    slugs.map(async (slug) => {
      const lId = leagueId ?? idBySlug[slug] ?? LEAGUES.superLig;
      const data = await espnFetch(`${ESPN_SITE}/${slug}/scoreboard?dates=${today}`) as Record<string, unknown> | null;
      if (!data) return [];

      const leagues = data.leagues as Record<string, unknown>[] | undefined;
      const leagueName = leagues?.[0]?.name as string ?? 'Football';
      const leagueLogo = getLogo((leagues?.[0] ?? {}) as Record<string, unknown>);

      const events = data.events as Record<string, unknown>[] ?? [];
      return events
        .filter(e => {
          const comp = (e.competitions as Record<string, unknown>[])?.[0];
          const statusName = ((comp?.status as Record<string, unknown>)?.type as Record<string, unknown>)?.name as string;
          return statusName === 'STATUS_IN_PROGRESS' || statusName === 'STATUS_HALFTIME';
        })
        .map(e => eventToFixture(e, lId, leagueName, leagueLogo))
        .filter((f): f is ApiFixture => f !== null);
    }),
  );

  return results.flat();
}

// ── Not used in aiChat but kept for API compatibility ─────────

export async function getFixtureById(fixtureId: number): Promise<ApiFixture | null> {
  // ESPN doesn't have a direct fixture-by-id without league context
  void fixtureId;
  return null;
}

export async function getUpcomingFixtures(leagueId: number, next = 10): Promise<ApiFixture[]> {
  const slug = getSlug(leagueId);
  // Get next N days of fixtures
  const dates: string[] = [];
  for (let i = 1; i <= 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split('T')[0].replace(/-/g, ''));
  }

  const allFixtures: ApiFixture[] = [];
  for (const date of dates) {
    if (allFixtures.length >= next) break;
    const data = await espnFetch(`${ESPN_SITE}/${slug}/scoreboard?dates=${date}`) as Record<string, unknown> | null;
    if (!data) continue;
    const leagues = data.leagues as Record<string, unknown>[] | undefined;
    const leagueName = leagues?.[0]?.name as string ?? 'Football';
    const leagueLogo = getLogo((leagues?.[0] ?? {}) as Record<string, unknown>);
    const events = data.events as Record<string, unknown>[] ?? [];
    events.forEach(e => {
      const f = eventToFixture(e, leagueId, leagueName, leagueLogo);
      if (f) allFixtures.push(f);
    });
  }
  return allFixtures.slice(0, next);
}

// ── Standings ─────────────────────────────────────────────────

export async function getStandings(leagueId: number): Promise<ApiStanding[]> {
  const slug = getSlug(leagueId);
  const data = await espnFetch(`${ESPN_V2}/${slug}/standings`) as Record<string, unknown> | null;
  if (!data) return [];

  const children = data.children as Record<string, unknown>[] | undefined;
  const entries = (children?.[0] as Record<string, unknown>)?.standings as Record<string, unknown> | undefined;
  const standingsEntries = (entries?.entries as Record<string, unknown>[]) ?? [];

  return standingsEntries.map((entry, index): ApiStanding => {
    const team = entry.team as Record<string, unknown>;
    const stats = entry.stats as { name: string; value: number }[] ?? [];

    return {
      rank: index + 1,
      team: {
        id: parseInt(team.id as string),
        name: team.displayName as string,
        logo: getLogo(team),
      },
      points: getStat(stats, 'points'),
      goalsDiff: getStat(stats, 'pointDifferential'),
      all: {
        played: getStat(stats, 'gamesPlayed'),
        win:    getStat(stats, 'wins'),
        draw:   getStat(stats, 'ties'),
        lose:   getStat(stats, 'losses'),
        goals: {
          for:     getStat(stats, 'pointsFor'),
          against: getStat(stats, 'pointsAgainst'),
        },
      },
      form: '',
    };
  });
}

// ── Top Scorers ───────────────────────────────────────────────

export async function getTopScorers(leagueId: number): Promise<ApiScorer[]> {
  const slug = getSlug(leagueId);

  // Get all teams first
  const teamsData = await espnFetch(`${ESPN_SITE}/${slug}/teams`) as Record<string, unknown> | null;
  if (!teamsData) return [];

  const sports = teamsData.sports as Record<string, unknown>[] | undefined;
  const teamsRaw = (sports?.[0] as Record<string, unknown>)?.leagues as Record<string, unknown>[] | undefined;
  const teamsList = (teamsRaw?.[0] as Record<string, unknown>)?.teams as { team: Record<string, unknown> }[] | undefined ?? [];

  // Fetch all team rosters in parallel
  const rosterResults = await Promise.all(
    teamsList.map(async ({ team }) => {
      const teamId = team.id as string;
      const teamName = team.displayName as string;
      const teamLogo = getLogo(team);

      const rosterData = await espnFetch(`${ESPN_SITE}/${slug}/teams/${teamId}/roster`) as Record<string, unknown> | null;
      if (!rosterData) return [];

      const athletes = rosterData.athletes as Record<string, unknown>[] ?? [];
      return athletes
        .map((athlete): ApiScorer | null => {
          const stats = (athlete.statistics as Record<string, unknown>)?.splits as Record<string, unknown> | undefined;
          const cats = (stats?.categories as { name: string; stats: { name: string; value: number }[] }[]) ?? [];

          const goals     = getCatStat(cats, 'offensive', 'totalGoals');
          const assists   = getCatStat(cats, 'offensive', 'goalAssists');
          const appearances = getCatStat(cats, 'general', 'appearances');

          if (goals <= 0) return null;

          return {
            player: {
              id: parseInt(athlete.id as string),
              name: athlete.displayName as string,
              photo: `https://a.espncdn.com/i/headshots/soccer/players/full/${athlete.id}.png`,
            },
            statistics: [{
              team: { name: teamName, logo: teamLogo },
              goals: { total: goals, assists },
              games: { appearences: appearances },
            }],
          };
        })
        .filter((s): s is ApiScorer => s !== null);
    }),
  );

  return rosterResults
    .flat()
    .sort((a, b) => b.statistics[0].goals.total - a.statistics[0].goals.total)
    .slice(0, 15);
}

// ── Head to Head ──────────────────────────────────────────────

export async function getHeadToHead(team1Id: number, team2Id: number, _last = 10): Promise<ApiFixture[]> {
  // Use team1's schedule and filter for matches against team2
  // We don't know the league here, so try Süper Lig first then others
  const slugsToTry = ['tur.1', 'eng.1', 'esp.1', 'ita.1', 'ger.1', 'uefa.champions'];

  for (const slug of slugsToTry) {
    const data = await espnFetch(`${ESPN_SITE}/${slug}/teams/${team1Id}/schedule`) as Record<string, unknown> | null;
    if (!data) continue;

    const events = data.events as Record<string, unknown>[] ?? [];
    if (events.length === 0) continue;

    const leagueId = Object.entries(SLUG_MAP).find(([, s]) => s === slug)?.[0];
    const lId = leagueId ? parseInt(leagueId) : LEAGUES.superLig;

    const h2hEvents = events.filter(e => {
      const comp = (e.competitions as Record<string, unknown>[])?.[0];
      const competitors = comp?.competitors as Record<string, unknown>[] | undefined;
      return competitors?.some(c => (c.team as Record<string, unknown>)?.id === String(team2Id));
    });

    if (h2hEvents.length > 0) {
      return h2hEvents
        .map(e => {
          const comp = (e.competitions as Record<string, unknown>[])?.[0];
          const homeComp = (comp?.competitors as Record<string, unknown>[])?.find(c => c.homeAway === 'home');
          const awayComp = (comp?.competitors as Record<string, unknown>[])?.find(c => c.homeAway === 'away');
          const statusType = ((comp?.status as Record<string, unknown>)?.type as Record<string, unknown>);
          const statusName = statusType?.name as string ?? 'STATUS_SCHEDULED';
          const isCompleted = statusType?.completed as boolean ?? false;

          if (!homeComp || !awayComp) return null;
          return {
            fixture: {
              id: parseInt(e.id as string),
              date: (comp?.startDate ?? e.date) as string,
              status: mapStatus(statusName),
            },
            league: { id: lId, name: 'Football', logo: '' },
            teams: {
              home: {
                id: parseInt((homeComp.team as Record<string, unknown>).id as string),
                name: (homeComp.team as Record<string, unknown>).displayName as string,
                logo: getLogo(homeComp.team as Record<string, unknown>),
              },
              away: {
                id: parseInt((awayComp.team as Record<string, unknown>).id as string),
                name: (awayComp.team as Record<string, unknown>).displayName as string,
                logo: getLogo(awayComp.team as Record<string, unknown>),
              },
            },
            goals: {
              home: isCompleted ? getScore(homeComp.score) : null,
              away: isCompleted ? getScore(awayComp.score) : null,
            },
          } as ApiFixture;
        })
        .filter((f): f is ApiFixture => f !== null);
    }
  }

  return [];
}

// ── Team Statistics ───────────────────────────────────────────

export async function getTeamStats(teamId: number, leagueId: number): Promise<ApiTeamStats | null> {
  const slug = getSlug(leagueId);
  const [scheduleData, teamDetailData] = await Promise.all([
    espnFetch(`${ESPN_SITE}/${slug}/teams/${teamId}/schedule`) as Promise<Record<string, unknown> | null>,
    espnFetch(`${ESPN_SITE}/${slug}/teams/${teamId}`) as Promise<Record<string, unknown> | null>,
  ]);

  if (!teamDetailData) return null;
  const team = teamDetailData.team as Record<string, unknown>;

  const events = (scheduleData?.events as Record<string, unknown>[]) ?? [];
  const completed = events.filter(e => {
    const comp = (e.competitions as Record<string, unknown>[])?.[0];
    const statusType = (comp?.status as Record<string, unknown>)?.type as Record<string, unknown> | undefined;
    return statusType?.completed === true;
  });

  let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0, cleanSheets = 0;
  const teamIdStr = String(teamId);

  const recentFixtures: ApiFixture[] = [];
  const leagueName = 'Football';

  for (const e of completed) {
    const comp = (e.competitions as Record<string, unknown>[])?.[0];
    const competitors = comp?.competitors as Record<string, unknown>[] | undefined;
    const myComp = competitors?.find(c => (c.team as Record<string, unknown>)?.id === teamIdStr);
    const oppComp = competitors?.find(c => (c.team as Record<string, unknown>)?.id !== teamIdStr);
    if (!myComp || !oppComp) continue;

    const myScore  = getScore(myComp.score) ?? 0;
    const oppScore = getScore(oppComp.score) ?? 0;
    goalsFor     += myScore;
    goalsAgainst += oppScore;
    if (myScore > oppScore) wins++;
    else if (myScore === oppScore) draws++;
    else losses++;
    if (oppScore === 0) cleanSheets++;

    // Build recent fixture
    const homeComp = competitors!.find(c => c.homeAway === 'home');
    const awayComp = competitors!.find(c => c.homeAway === 'away');
    if (homeComp && awayComp) {
      recentFixtures.push({
        fixture: {
          id: parseInt(e.id as string),
          date: (comp?.startDate ?? e.date) as string,
          status: { short: 'FT', elapsed: 90 },
        },
        league: { id: leagueId, name: leagueName, logo: '' },
        teams: {
          home: {
            id: parseInt((homeComp.team as Record<string, unknown>).id as string),
            name: (homeComp.team as Record<string, unknown>).displayName as string,
            logo: getLogo(homeComp.team as Record<string, unknown>),
          },
          away: {
            id: parseInt((awayComp.team as Record<string, unknown>).id as string),
            name: (awayComp.team as Record<string, unknown>).displayName as string,
            logo: getLogo(awayComp.team as Record<string, unknown>),
          },
        },
        goals: {
          home: getScore(homeComp.score),
          away: getScore(awayComp.score),
        },
      });
    }
  }

  const played = completed.length;
  const formStr = completed.slice(-5).map(e => {
    const comp = (e.competitions as Record<string, unknown>[])?.[0];
    const competitors = comp?.competitors as Record<string, unknown>[] | undefined;
    const myComp  = competitors?.find(c => (c.team as Record<string, unknown>)?.id === teamIdStr);
    const oppComp = competitors?.find(c => (c.team as Record<string, unknown>)?.id !== teamIdStr);
    if (!myComp || !oppComp) return 'D';
    const myScore  = getScore(myComp.score) ?? 0;
    const oppScore = getScore(oppComp.score) ?? 0;
    return myScore > oppScore ? 'W' : myScore === oppScore ? 'D' : 'L';
  }).join('');

  return {
    team: {
      id: teamId,
      name: team.displayName as string,
      logo: getLogo(team),
    },
    form: formStr,
    goals: {
      for: {
        total:   { total: goalsFor },
        average: { total: played > 0 ? (goalsFor / played).toFixed(2) : '0' },
      },
      against: { total: { total: goalsAgainst } },
    },
    clean_sheet: { total: cleanSheets },
    fixtures: {
      wins:   { total: wins },
      draws:  { total: draws },
      loses:  { total: losses },
      played: { total: played },
    },
    recent_fixtures: recentFixtures.slice(-5),
  };
}

// ── Player Stats (not used in aiChat, kept for compat) ─────────

export async function getPlayerStats(_playerId: number): Promise<ApiPlayer | null> {
  return null;
}

// ── Team Search ───────────────────────────────────────────────

export async function searchTeam(name: string, leagueId?: number): Promise<ApiTeam[]> {
  const query = name.toLowerCase().trim();
  const slugsToSearch = leagueId ? [getSlug(leagueId)] : Object.values(SLUG_MAP);

  for (const slug of slugsToSearch) {
    const data = await espnFetch(`${ESPN_V2}/${slug}/standings`) as Record<string, unknown> | null;
    if (!data) continue;

    const children = data.children as Record<string, unknown>[] | undefined;
    const standings = (children?.[0] as Record<string, unknown>)?.standings as Record<string, unknown> | undefined;
    const entries = (standings?.entries as Record<string, unknown>[]) ?? [];

    const matched = entries.filter(e => {
      const team = e.team as Record<string, unknown>;
      const dn = (team.displayName as string ?? '').toLowerCase();
      const loc = (team.location as string ?? '').toLowerCase();
      const nm  = (team.name as string ?? '').toLowerCase();
      return dn.includes(query) || loc.includes(query) || nm.includes(query);
    });

    if (matched.length > 0) {
      return matched.map(e => {
        const team = e.team as Record<string, unknown>;
        return {
          team: {
            id:   parseInt(team.id as string),
            name: team.displayName as string,
            logo: getLogo(team),
          },
          venue: { name: '' },
        };
      });
    }
  }

  return [];
}
