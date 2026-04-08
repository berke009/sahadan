/**
 * AI Chat Service — Sahadan
 * Calls /api/chat proxy which uses AI SDK server-side.
 * Client sends OpenAI-format requests; server handles gateway protocol.
 */

import { AI_GATEWAY_KEY, RAPIDAPI_KEY, API_URL, AI_MODEL } from '../constants/config';
import {
  getTodayFixtures,
  getLiveFixtures,
  getStandings,
  getTopScorers,
  getHeadToHead,
  getTeamStats,
  searchTeam,
  LEAGUES,
  ApiFixture,
  ApiStanding,
  ApiScorer,
  ApiTeam,
} from './footballApi';
import {
  WidgetPayload,
  Match,
  StandingEntry,
  TopScorer,
  RecentMatch,
  MatchEvent,
  LiveMatch,
} from '../types';

// ── Type helpers ─────────────────────────────────────────────

function fixtureStatus(short: string): 'upcoming' | 'live' | 'finished' {
  if (['1H', '2H', 'HT', 'ET', 'BT', 'P', 'LIVE'].includes(short)) return 'live';
  if (['FT', 'AET', 'PEN'].includes(short)) return 'finished';
  return 'upcoming';
}

function apiFixtureToMatch(f: ApiFixture): Match {
  return {
    id: String(f.fixture.id),
    home_team: f.teams.home.name,
    away_team: f.teams.away.name,
    home_logo: f.teams.home.logo,
    away_logo: f.teams.away.logo,
    league: f.league.name,
    kickoff: f.fixture.date,
    status: fixtureStatus(f.fixture.status.short),
    home_score: f.goals.home ?? undefined,
    away_score: f.goals.away ?? undefined,
    elapsed: f.fixture.status.elapsed ?? undefined,
  };
}

function apiFixtureToLiveMatch(f: ApiFixture): LiveMatch {
  const events: MatchEvent[] = (f.events ?? []).map((e) => ({
    minute: e.time.elapsed,
    type: e.type === 'Goal' ? 'goal'
      : e.type === 'Card' && e.detail.includes('Yellow') ? 'yellow_card'
      : e.type === 'Card' ? 'red_card'
      : e.type === 'subst' ? 'substitution'
      : 'var',
    team: e.team.name,
    player: e.player.name,
    assist: e.assist?.name ?? undefined,
    detail: e.detail,
  }));
  return {
    ...apiFixtureToMatch(f),
    status: 'live',
    elapsed: f.fixture.status.elapsed ?? 0,
    events,
  };
}

function standingToEntry(s: ApiStanding): StandingEntry {
  const form = (s.form ?? '')
    .split('')
    .slice(-5)
    .map((c) => (c === 'W' ? 'W' : c === 'D' ? 'D' : 'L')) as StandingEntry['form'];
  return {
    rank: s.rank,
    team: s.team.name,
    team_logo: s.team.logo,
    played: s.all.played,
    won: s.all.win,
    drawn: s.all.draw,
    lost: s.all.lose,
    goals_for: s.all.goals.for,
    goals_against: s.all.goals.against,
    goal_difference: s.goalsDiff,
    points: s.points,
    form,
  };
}

function scorerToTopScorer(s: ApiScorer, rank: number): TopScorer {
  const stat = s.statistics[0];
  return {
    rank,
    player_id: String(s.player.id),
    name: s.player.name,
    team: stat.team.name,
    photo: s.player.photo,
    goals: stat.goals.total ?? 0,
    assists: stat.goals.assists ?? 0,
    matches: stat.games.appearences ?? 0,
  };
}

// ── League detection ─────────────────────────────────────────

function detectLeague(msg: string): number {
  const m = msg.toLowerCase();
  if (m.includes('premier') || m.includes('epl') || m.includes('england') || m.includes('ingiltere')) return LEAGUES.premierLeague;
  if (m.includes('laliga') || m.includes('la liga') || m.includes('spain') || m.includes('ispanya')) return LEAGUES.laLiga;
  if (m.includes('serie a') || m.includes('italy') || m.includes('italya')) return LEAGUES.serieA;
  if (m.includes('bundesliga') || m.includes('germany') || m.includes('almanya')) return LEAGUES.bundesliga;
  if (m.includes('champions') || m.includes('ucl') || m.includes('sampiyonlar ligı') || m.includes('şampiyonlar')) return LEAGUES.championsLeague;
  if (m.includes('europa') || m.includes('uel') || m.includes('avrupa ligi')) return LEAGUES.europaLeague;
  return LEAGUES.superLig;
}

// ── Master System Prompt ─────────────────────────────────────

const SYSTEM_PROMPT = `Sen SAHADAN — Türkiye'nin futbol analiz uygulamasının AI asistanı.

## KİMLİK
- Uzmanlık: Türk futbolu, Süper Lig, Avrupa ligleri, canlı skor, maç analizi
- Dil: Kullanıcı Türkçe yazarsa Türkçe, İngilizce yazarsa İngilizce yanıt ver
- Karakter: Samimi, bilgili futbol analisti

## KRİTİK KURAL — TOOL KULLANIMI
Futbol verisi gerektiren HER soruya MUTLAKA uygun tool'u çağır.
Asla futbol verisini tool çağırmadan kendin uydurma veya tahmin etme.
Lig belirtilmezse Süper Lig (203) varsay.

Kısaltmalar: GS=Galatasaray, FB=Fenerbahçe, BJK=Beşiktaş, TS=Trabzonspor

## YANIT KURALLARI
1. Tool sonucu geldikten sonra verileri TEKRAR SAYMA — widget zaten gösteriyor
2. Bunun yerine 2-3 cümlelik kısa ANALİZ yaz: trend, form değerlendirmesi, dikkat çekici istatistik
3. Bahis tavsiyesi VERME — analiz sun, kararı kullanıcıya bırak
4. Belirsiz soruyu en mantıklı şekilde yorumla ve tool çağır, onay bekleme
5. "Selam", "nasılsın" gibi genel sorulara kısa samimi cevap ver — tool çağırma`;

// ── Tool Definitions (OpenAI format — server converts to AI SDK) ─

const TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'get_today_fixtures',
      description: `Bugünkü futbol maçlarını getirir. Kullanım: "bugün maç var mı", "akşam maçları", "fikstür", "program", "hangi maçlar var", "today's matches", "fixtures", "schedule". Canlı olmayan ama günün maçlarını gösterir.`,
      parameters: {
        type: 'object',
        properties: {
          league_id: {
            type: 'number',
            description: 'Lig ID: 203=Süper Lig (varsayılan), 39=Premier League, 140=La Liga, 135=Serie A, 78=Bundesliga, 2=Şampiyonlar Ligi, 3=Avrupa Ligi',
          },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_live_scores',
      description: `Şu an oynanan canlı maçları skorlarıyla birlikte getirir. Kullanım: "canlı", "canlı skor", "şu an oynuyor mu", "kaç kaç", "live", "live scores", "ongoing matches", "ne durumda", "maç bitti mi".`,
      parameters: {
        type: 'object',
        properties: {
          league_id: {
            type: 'number',
            description: 'Opsiyonel lig filtresi. Belirtilmezse tüm liglerdeki canlı maçlar gelir.',
          },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_standings',
      description: `Lig puan durumu tablosunu getirir. Kullanım: "puan durumu", "tablo", "sıralama", "kaçıncı sırada", "lider kim", "şampiyon kim olur", "standings", "league table", "puan tablosu", "kaç puanları var".`,
      parameters: {
        type: 'object',
        properties: {
          league_id: {
            type: 'number',
            description: 'Lig ID: 203=Süper Lig (varsayılan), 39=Premier League, 140=La Liga, 135=Serie A, 78=Bundesliga, 2=Şampiyonlar Ligi',
          },
        },
        required: ['league_id'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_top_scorers',
      description: `Ligin gol krallığı listesini getirir. Kullanım: "gol krallığı", "en çok gol atan", "golcüler", "bomber", "top scorers", "kaç gol attı", "gol listesi", "skorerler", "golden boot".`,
      parameters: {
        type: 'object',
        properties: {
          league_id: {
            type: 'number',
            description: 'Lig ID: 203=Süper Lig (varsayılan), 39=Premier League, 140=La Liga, 135=Serie A, 78=Bundesliga, 2=Şampiyonlar Ligi',
          },
        },
        required: ['league_id'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_team_form',
      description: `Bir takımın son maç formunu, istatistiklerini ve performans verilerini getirir. Kullanım: "[takım adı] formu", "son maçları", "nasıl oynuyor", "galibiyet serisi", "istatistik", "performans", "[team] form", "recent results", "team stats". Takım adını team_name parametresine yaz.`,
      parameters: {
        type: 'object',
        properties: {
          team_name: {
            type: 'string',
            description: 'Aranacak takım adı. Örnekler: "Galatasaray", "Fenerbahçe", "Beşiktaş", "Trabzonspor", "Arsenal", "Barcelona"',
          },
          league_id: {
            type: 'number',
            description: 'Opsiyonel lig ID. Belirtilmezse Süper Lig (203) varsayılır.',
          },
        },
        required: ['team_name'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_head_to_head',
      description: `İki takım arasındaki geçmiş maç istatistiklerini ve karşılaşma geçmişini getirir. Kullanım: "[takım1] vs [takım2]", "karşılaştır", "h2h", "derbisi", "aralarındaki maçlar", "geçmiş maçlar", "head to head", "kim önde". Her iki takım adını parametrelere yaz.`,
      parameters: {
        type: 'object',
        properties: {
          team1_name: {
            type: 'string',
            description: 'Birinci takım adı. Örnek: "Galatasaray"',
          },
          team2_name: {
            type: 'string',
            description: 'İkinci takım adı. Örnek: "Fenerbahçe"',
          },
        },
        required: ['team1_name', 'team2_name'],
      },
    },
  },
];

// ── Tool execution ───────────────────────────────────────────

interface ToolResult {
  widget: WidgetPayload | null;
  text: string;
  richText: string;
}

async function executeTool(name: string, input: Record<string, unknown>): Promise<ToolResult> {
  switch (name) {
    case 'get_today_fixtures': {
      const leagueId = (input.league_id as number | undefined);
      const fixtures = await getTodayFixtures(leagueId);
      if (fixtures.length === 0) {
        return { widget: null, text: 'Bugün bu ligde maç bulunmuyor.', richText: '{"matches":[]}' };
      }
      const matches = fixtures.map(apiFixtureToMatch);
      const richText = JSON.stringify({
        matches: matches.slice(0, 12).map(m => ({
          home: m.home_team, away: m.away_team, league: m.league,
          kickoff: m.kickoff, status: m.status,
          score: m.home_score != null ? `${m.home_score}-${m.away_score}` : null,
        })),
      });
      return {
        widget: { type: 'hot_matches', matches },
        text: `Bugün ${matches.length} maç var.`,
        richText,
      };
    }

    case 'get_live_scores': {
      const leagueId = (input.league_id as number | undefined);
      const fixtures = await getLiveFixtures(leagueId);
      if (fixtures.length === 0) {
        return { widget: null, text: 'Şu an oynanan maç yok.', richText: '{"matches":[]}' };
      }
      const liveMatches = fixtures.map(apiFixtureToLiveMatch);
      const richText = JSON.stringify({
        matches: liveMatches.slice(0, 10).map(m => ({
          home: m.home_team, away: m.away_team, league: m.league,
          score: `${m.home_score}-${m.away_score}`, elapsed: m.elapsed,
          events: (m.events ?? []).slice(-5).map(e => `${e.minute}' ${e.type} ${e.player}`),
        })),
      });
      return {
        widget: { type: 'live_score', matches: liveMatches },
        text: `${liveMatches.length} maç şu an canlı!`,
        richText,
      };
    }

    case 'get_standings': {
      const leagueId = (input.league_id as number) ?? LEAGUES.superLig;
      const standings = await getStandings(leagueId);
      if (standings.length === 0) {
        return { widget: null, text: 'Puan durumu alınamadı.', richText: '{}' };
      }
      const entries = standings.map(standingToEntry);
      const richText = JSON.stringify({
        standings: entries.slice(0, 10).map(e => ({
          rank: e.rank, team: e.team, pts: e.points, p: e.played,
          w: e.won, d: e.drawn, l: e.lost, gd: e.goal_difference,
          form: e.form.join(''),
        })),
      });
      return {
        widget: { type: 'league_standings', standings: entries },
        text: `Lider: ${entries[0]?.team ?? 'Bilinmiyor'} (${entries[0]?.points ?? 0} puan).`,
        richText,
      };
    }

    case 'get_top_scorers': {
      const leagueId = (input.league_id as number) ?? LEAGUES.superLig;
      const scorers = await getTopScorers(leagueId);
      if (scorers.length === 0) {
        return { widget: null, text: 'Gol krallığı verisi alınamadı.', richText: '{}' };
      }
      const topScorers = scorers.slice(0, 10).map((s, i) => scorerToTopScorer(s, i + 1));
      const richText = JSON.stringify({
        scorers: topScorers.map(s => ({
          rank: s.rank, name: s.name, team: s.team,
          goals: s.goals, assists: s.assists, matches: s.matches,
        })),
      });
      return {
        widget: { type: 'top_scorers', scorers: topScorers },
        text: `Gol kralı: ${topScorers[0].name} — ${topScorers[0].goals} gol.`,
        richText,
      };
    }

    case 'get_team_form': {
      const teamName = input.team_name as string;
      const leagueId = (input.league_id as number | undefined) ?? LEAGUES.superLig;
      const teams = await searchTeam(teamName);
      const team = teams[0] as ApiTeam | undefined;
      if (!team) {
        return { widget: null, text: `"${teamName}" takımı bulunamadı.`, richText: '{}' };
      }
      const stats = await getTeamStats(team.team.id, leagueId);
      if (!stats) {
        return { widget: null, text: `${teamName} istatistikleri alınamadı.`, richText: '{}' };
      }
      const formStr = stats.form ?? '';
      const results = formStr.split('').slice(-5).map((c) => (c === 'W' ? 'W' : c === 'D' ? 'D' : 'L')) as ('W' | 'D' | 'L')[];
      const winPct = stats.fixtures.played.total > 0
        ? Math.round((stats.fixtures.wins.total / stats.fixtures.played.total) * 100)
        : 0;
      const richText = JSON.stringify({
        team: stats.team.name, form: results.join(''),
        played: stats.fixtures.played.total, wins: stats.fixtures.wins.total,
        draws: stats.fixtures.draws.total, losses: stats.fixtures.loses.total,
        win_pct: winPct, goals_scored: stats.goals.for.total.total,
        goals_conceded: stats.goals.against.total.total,
        goals_avg: stats.goals.for.average.total,
        clean_sheets: stats.clean_sheet.total,
      });
      return {
        widget: {
          type: 'team_form',
          data: {
            team: stats.team.name,
            team_logo: stats.team.logo,
            results,
            win_percentage: winPct,
            goals_scored: stats.goals.for.total.total,
            goals_conceded: stats.goals.against.total.total,
            clean_sheets: stats.clean_sheet.total,
            recent_matches: [],
          },
        },
        text: `${stats.team.name} son 5 maç formu: ${results.join(' ')}.`,
        richText,
      };
    }

    case 'get_head_to_head': {
      const name1 = input.team1_name as string;
      const name2 = input.team2_name as string;
      const [teams1, teams2] = await Promise.all([searchTeam(name1), searchTeam(name2)]);
      const t1 = teams1[0] as ApiTeam | undefined;
      const t2 = teams2[0] as ApiTeam | undefined;
      if (!t1 || !t2) {
        return { widget: null, text: `Takımlar bulunamadı: ${name1} veya ${name2}`, richText: '{}' };
      }
      const fixtures = await getHeadToHead(t1.team.id, t2.team.id, 10);
      const finished = fixtures.filter((f) => f.fixture.status.short === 'FT');
      const t1Wins = finished.filter((f) => (f.teams.home.id === t1.team.id ? f.goals.home! > f.goals.away! : f.goals.away! > f.goals.home!)).length;
      const t2Wins = finished.filter((f) => (f.teams.home.id === t2.team.id ? f.goals.home! > f.goals.away! : f.goals.away! > f.goals.home!)).length;
      const draws = finished.length - t1Wins - t2Wins;
      const recent: RecentMatch[] = finished.slice(0, 5).map((f) => ({
        date: f.fixture.date.split('T')[0],
        home_team: f.teams.home.name,
        away_team: f.teams.away.name,
        home_score: f.goals.home ?? 0,
        away_score: f.goals.away ?? 0,
      }));
      const t1Goals = finished.reduce((s, f) => s + (f.teams.home.id === t1.team.id ? f.goals.home ?? 0 : f.goals.away ?? 0), 0);
      const t2Goals = finished.reduce((s, f) => s + (f.teams.home.id === t2.team.id ? f.goals.home ?? 0 : f.goals.away ?? 0), 0);
      const richText = JSON.stringify({
        team_a: t1.team.name, team_b: t2.team.name,
        total: finished.length, a_wins: t1Wins, b_wins: t2Wins, draws,
        a_goals: t1Goals, b_goals: t2Goals,
        recent: recent.map(r => `${r.date}: ${r.home_team} ${r.home_score}-${r.away_score} ${r.away_team}`),
      });
      return {
        widget: {
          type: 'head_to_head',
          data: {
            team_a: t1.team.name,
            team_b: t2.team.name,
            total_matches: finished.length,
            team_a_wins: t1Wins,
            team_b_wins: t2Wins,
            draws,
            team_a_goals: t1Goals,
            team_b_goals: t2Goals,
            recent_matches: recent,
          },
        },
        text: `${t1.team.name} ${t1Wins} galibiyet, ${draws} beraberlik, ${t2Wins} mağlubiyet (son ${finished.length} maç).`,
        richText,
      };
    }

    default:
      return { widget: null, text: '', richText: '{}' };
  }
}

// ── Client-side fallback: detect tool when model misses ──────

const TEAM_ALIASES: Record<string, string> = {
  gs: 'Galatasaray', galatasaray: 'Galatasaray', cimbom: 'Galatasaray',
  fb: 'Fenerbahçe', fenerbahçe: 'Fenerbahçe', fenerbahce: 'Fenerbahçe', fener: 'Fenerbahçe',
  bjk: 'Beşiktaş', beşiktaş: 'Beşiktaş', besiktas: 'Beşiktaş', kartal: 'Beşiktaş',
  ts: 'Trabzonspor', trabzonspor: 'Trabzonspor',
  adana: 'Adana Demirspor', sivas: 'Sivasspor', antalya: 'Antalyaspor',
  konya: 'Konyaspor', kasimpasa: 'Kasımpaşa', basaksehir: 'Başakşehir',
};

function detectFallbackTool(msg: string): { name: string; input: Record<string, unknown> } | null {
  const m = msg.toLowerCase();
  const leagueId = detectLeague(msg);

  if (/bugün|maç var|fikstür|program|akşam|today|fixture|schedule/i.test(m))
    return { name: 'get_today_fixtures', input: { league_id: leagueId } };
  if (/canlı|live|şu an|kaç kaç|oynuyor mu|ne durumda/i.test(m))
    return { name: 'get_live_scores', input: { league_id: leagueId } };
  if (/puan durumu|tablo|sıralama|kaçıncı|lider|standing|klasman/i.test(m))
    return { name: 'get_standings', input: { league_id: leagueId } };
  if (/gol kral|golcü|en çok gol|bomber|top scorer|golden boot/i.test(m))
    return { name: 'get_top_scorers', input: { league_id: leagueId } };

  // H2H detection (need two team names)
  if (/vs|karşılaştır|h2h|derbi|aralarındaki|karşı karşıya/i.test(m)) {
    const found = Object.keys(TEAM_ALIASES).filter(k => m.includes(k));
    const uniqueTeams = [...new Set(found.map(k => TEAM_ALIASES[k]))];
    if (uniqueTeams.length >= 2) {
      return { name: 'get_head_to_head', input: { team1_name: uniqueTeams[0], team2_name: uniqueTeams[1] } };
    }
  }

  // Team form detection
  if (/formu|son maç|nasıl oynuyor|performans|istatistik|galibiyet/i.test(m)) {
    const found = Object.keys(TEAM_ALIASES).find(k => m.includes(k));
    if (found) {
      return { name: 'get_team_form', input: { team_name: TEAM_ALIASES[found], league_id: leagueId } };
    }
  }

  return null;
}

// ── API call (raw fetch to /api/chat proxy) ─────────────────

interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: { id: string; type: 'function'; function: { name: string; arguments: string } }[];
  tool_call_id?: string;
}

// Always go through the /api/chat proxy.
// Web: relative URL (same-origin, no CORS).
// Native: absolute URL via EXPO_PUBLIC_API_URL.
const AI_ENDPOINT = API_URL ? `${API_URL}/api/chat` : '/api/chat';

async function callAI(messages: ChatMessage[]): Promise<unknown> {
  const res = await fetch(AI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: AI_MODEL,
      max_tokens: 1024,
      messages,
      tools: TOOLS,
      tool_choice: 'auto',
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`AI error ${res.status}: ${errText}`);
  }
  return res.json();
}

// ── Main export ──────────────────────────────────────────────

export interface AIChatResponse {
  content: string;
  widget_payload?: WidgetPayload;
}

export async function getAIResponse(
  userMessage: string,
  history?: Array<{ role: 'user' | 'assistant'; content: string }>,
): Promise<AIChatResponse> {
  const hasGatewayKey = AI_GATEWAY_KEY && AI_GATEWAY_KEY !== 'YOUR_AI_GATEWAY_KEY';
  const hasRapidKey = RAPIDAPI_KEY && RAPIDAPI_KEY !== 'YOUR_RAPIDAPI_KEY';

  if (!hasGatewayKey || !hasRapidKey) {
    const missing = [];
    if (!hasGatewayKey) missing.push('AI_GATEWAY_KEY');
    if (!hasRapidKey) missing.push('RAPIDAPI_KEY');
    throw new Error(`API anahtarları eksik: ${missing.join(', ')}. .env dosyasını kontrol edin ve "npx expo start --clear" çalıştırın.`);
  }

  try {
    const leagueId = detectLeague(userMessage);

    // Include recent conversation history for context
    const MAX_HISTORY = 10;
    const recentHistory = (history ?? []).slice(-MAX_HISTORY);

    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...recentHistory.map(h => ({
        role: h.role as ChatMessage['role'],
        content: h.content,
      })),
      { role: 'user', content: userMessage },
    ];

    // First call — model decides whether to call a tool
    const response = await callAI(messages) as {
      choices: [{
        message: {
          role: string;
          content: string | null;
          tool_calls?: { id: string; type: 'function'; function: { name: string; arguments: string } }[];
        };
        finish_reason: string;
      }];
    };

    const choice = response.choices[0];
    const assistantMsg = choice.message;

    // Tool call path
    if (assistantMsg.tool_calls && assistantMsg.tool_calls.length > 0) {
      const toolCall = assistantMsg.tool_calls[0];
      const toolName = toolCall.function.name;
      let toolInput: Record<string, unknown> = {};
      try {
        toolInput = JSON.parse(toolCall.function.arguments);
      } catch { /* empty args */ }

      // Inject detected league if model didn't specify one
      if (!toolInput.league_id && ['get_standings', 'get_top_scorers', 'get_today_fixtures', 'get_team_form'].includes(toolName)) {
        toolInput.league_id = leagueId;
      }

      const { widget, text: toolResultText, richText } = await executeTool(toolName, toolInput);

      // Second call: model generates natural language response using rich tool data
      const followUp: ChatMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...recentHistory.map(h => ({
          role: h.role as ChatMessage['role'],
          content: h.content,
        })),
        { role: 'user', content: userMessage },
        {
          role: 'assistant',
          content: assistantMsg.content,
          tool_calls: assistantMsg.tool_calls,
        },
        {
          role: 'tool',
          content: richText,
          tool_call_id: toolCall.id,
        },
      ];

      const finalResponse = await callAI(followUp) as {
        choices: [{ message: { content: string | null } }];
      };

      const responseText = finalResponse.choices[0]?.message?.content ?? toolResultText;
      return { content: responseText, widget_payload: widget ?? undefined };
    }

    // Fallback: if model gave text but message clearly needs a tool
    const fallbackTool = detectFallbackTool(userMessage);
    if (fallbackTool) {
      const { widget, text: fallbackText, richText: fallbackRich } = await executeTool(
        fallbackTool.name,
        fallbackTool.input,
      );
      if (widget) {
        const fallbackMessages: ChatMessage[] = [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
          {
            role: 'assistant',
            content: null,
            tool_calls: [{
              id: 'fallback_1',
              type: 'function',
              function: { name: fallbackTool.name, arguments: JSON.stringify(fallbackTool.input) },
            }],
          },
          { role: 'tool', content: fallbackRich, tool_call_id: 'fallback_1' },
        ];
        const fallbackResponse = await callAI(fallbackMessages) as {
          choices: [{ message: { content: string | null } }];
        };
        return {
          content: fallbackResponse.choices[0]?.message?.content ?? fallbackText,
          widget_payload: widget ?? undefined,
        };
      }
    }

    // Direct text response (general question, analysis, no widget needed)
    return { content: assistantMsg.content ?? 'Anlayamadım, tekrar dener misin?' };

  } catch (err) {
    console.error('[Sahadan AI] Error:', err);
    throw err;
  }
}
