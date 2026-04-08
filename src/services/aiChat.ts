/**
 * AI Chat Service — Sahadan | Vercel AI Gateway (GPT-4o-mini)
 * Full Turkish football analysis with real-time data and widget rendering.
 */

import { AI_GATEWAY_KEY, RAPIDAPI_KEY } from '../constants/config';
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

const SYSTEM_PROMPT = `Sen SAHADAN — Türkiye'nin en iyi futbol analiz uygulamasının AI asistanısın.

## KİMLİĞİN
- Adın: Sahadan AI
- Uzmanlık: Türk futbolu, Süper Lig, Avrupa ligleri, canlı skor takibi, maç analizi
- Dil: Kullanıcı Türkçe yazarsa Türkçe, İngilizce yazarsa İngilizce yanıt ver
- Karakter: Samimi, bilgili, futbol tutkunu bir analist gibi konuş

## WIDGET SİSTEMİ — KRİTİK KURALLAR
Kullanıcı futbolla ilgili herhangi bir şey sorduğunda MUTLAKA ilgili tool'u çağırarak gerçek veri getir ve widget göster.
Hiçbir zaman widget gerektiren bir soruya sade metin yanıtı verme.

### Tool → Widget Eşleştirmesi:
| Kullanıcı Ne İsterse | Tool | Widget |
|---|---|---|
| "bugün maçlar", "maç var mı", "fikstür", "program", "akşam maçları" | get_today_fixtures | hot_matches |
| "canlı", "canlı skor", "şu an", "kaç kaç", "oynuyor mu" | get_live_scores | live_score |
| "puan durumu", "tablo", "sıralama", "kaçıncı", "lider kim" | get_standings | league_standings |
| "gol krallığı", "en çok gol", "golcüler", "bomber" | get_top_scorers | top_scorers |
| "form", "son maçlar", "nasıl oynuyor", "performans", "istatistik", "kaç galibiyet" | get_team_form | team_form |
| "karşılaştır", "h2h", "derbisi", "vs", "aralarındaki", "geçmiş maçlar" | get_head_to_head | head_to_head |

## LİG KİMLİKLERİ — DAIMA DOĞRU KULLAN
- 203 = Türkiye Süper Lig (varsayılan — kullanıcı lig belirtmezse bunu kullan)
- 39  = Premier League (İngiltere)
- 140 = La Liga (İspanya)
- 135 = Serie A (İtalya)
- 78  = Bundesliga (Almanya)
- 2   = UEFA Şampiyonlar Ligi
- 3   = UEFA Avrupa Ligi

## FUTBOL BİLGİSİ
Sen deneyimli bir futbol analistisin. Şunlarda derinlemesine bilgin var:
- Türk futbolu: Süper Lig tarihi, Galatasaray, Fenerbahçe, Beşiktaş, Trabzonspor ve diğer tüm kulüpler
- Taktik & formasyon analizi: 4-3-3, 4-2-3-1, pressing, gegenpress, pozisyon oyunu vb.
- Oyuncu değerlendirme: teknik özellikler, fiziksel nitelikler, istatistik yorumlama
- Avrupa futbolu: Premier League, La Liga, Serie A, Bundesliga, Ligue 1
- Uluslararası futbol: EURO, Dünya Kupası, Milli Takım analizleri
- Bahis piyasası: MS 1-X-2, Karşılıklı Gol, Alt/Üst, İlk Yarı, Handikap oranları

## YANIT KURALLARI
1. Widget gösterildikten sonra maksimum 2 kısa cümle yaz — verileri tekrar sayma
2. Analiz sorusunda (widget gerekmiyorsa) akıcı, bilgili Türkçe yaz
3. Bahis tavsiyesi VERME — analiz sun, kararı kullanıcıya bırak
4. Takım adlarını doğru yaz: "Galatasaray", "Fenerbahçe", "Beşiktaş", "Trabzonspor"
5. Soru belirsizse en mantıklı yorumu yap ve tool çağır, onay bekleme
6. Kullanıcı "selam", "nasılsın" gibi genel sorular sorarsa kısa ve samimi cevap ver

## ÖRNEK DAVRANIŞLAR
- "GS nasıl oynuyor?" → get_team_form(team_name="Galatasaray")
- "Bugün ne var?" → get_today_fixtures(league_id=203)
- "Premier League tablosu" → get_standings(league_id=39)
- "GS FB derbisi" → get_head_to_head(team1_name="Galatasaray", team2_name="Fenerbahçe")
- "Süper Lig gol krallığı" → get_top_scorers(league_id=203)
- "Şu an canlı maç var mı?" → get_live_scores()`;

// ── Tool Definitions ─────────────────────────────────────────

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

async function executeTool(name: string, input: Record<string, unknown>): Promise<{ widget: WidgetPayload | null; text: string }> {
  switch (name) {
    case 'get_today_fixtures': {
      const leagueId = (input.league_id as number | undefined);
      const fixtures = await getTodayFixtures(leagueId);
      if (fixtures.length === 0) {
        return { widget: null, text: 'Bugün bu ligde maç bulunmuyor.' };
      }
      const matches = fixtures.map(apiFixtureToMatch);
      return {
        widget: { type: 'hot_matches', matches },
        text: `Bugün ${matches.length} maç var.`,
      };
    }

    case 'get_live_scores': {
      const leagueId = (input.league_id as number | undefined);
      const fixtures = await getLiveFixtures(leagueId);
      if (fixtures.length === 0) {
        return { widget: null, text: 'Şu an oynanan maç yok.' };
      }
      const liveMatches = fixtures.map(apiFixtureToLiveMatch);
      return {
        widget: { type: 'live_score', matches: liveMatches },
        text: `${liveMatches.length} maç şu an canlı!`,
      };
    }

    case 'get_standings': {
      const leagueId = (input.league_id as number) ?? LEAGUES.superLig;
      const standings = await getStandings(leagueId);
      if (standings.length === 0) {
        return { widget: null, text: 'Puan durumu alınamadı.' };
      }
      const entries = standings.map(standingToEntry);
      return {
        widget: { type: 'league_standings', standings: entries },
        text: `Lider: ${entries[0]?.team ?? 'Bilinmiyor'} (${entries[0]?.points ?? 0} puan).`,
      };
    }

    case 'get_top_scorers': {
      const leagueId = (input.league_id as number) ?? LEAGUES.superLig;
      const scorers = await getTopScorers(leagueId);
      if (scorers.length === 0) {
        return { widget: null, text: 'Gol krallığı verisi alınamadı.' };
      }
      const topScorers = scorers.slice(0, 10).map((s, i) => scorerToTopScorer(s, i + 1));
      return {
        widget: { type: 'top_scorers', scorers: topScorers },
        text: `Gol kralı: ${topScorers[0].name} — ${topScorers[0].goals} gol.`,
      };
    }

    case 'get_team_form': {
      const teamName = input.team_name as string;
      const leagueId = (input.league_id as number | undefined) ?? LEAGUES.superLig;
      const teams = await searchTeam(teamName);
      const team = teams[0] as ApiTeam | undefined;
      if (!team) {
        return { widget: null, text: `"${teamName}" takımı bulunamadı.` };
      }
      const stats = await getTeamStats(team.team.id, leagueId);
      if (!stats) {
        return { widget: null, text: `${teamName} istatistikleri alınamadı.` };
      }
      const formStr = stats.form ?? '';
      const results = formStr.split('').slice(-5).map((c) => (c === 'W' ? 'W' : c === 'D' ? 'D' : 'L')) as ('W' | 'D' | 'L')[];
      return {
        widget: {
          type: 'team_form',
          data: {
            team: stats.team.name,
            team_logo: stats.team.logo,
            results,
            win_percentage: stats.fixtures.played.total > 0
              ? Math.round((stats.fixtures.wins.total / stats.fixtures.played.total) * 100)
              : 0,
            goals_scored: stats.goals.for.total.total,
            goals_conceded: stats.goals.against.total.total,
            clean_sheets: stats.clean_sheet.total,
            recent_matches: [],
          },
        },
        text: `${stats.team.name} son 5 maç formu: ${results.join(' ')}.`,
      };
    }

    case 'get_head_to_head': {
      const name1 = input.team1_name as string;
      const name2 = input.team2_name as string;
      const [teams1, teams2] = await Promise.all([searchTeam(name1), searchTeam(name2)]);
      const t1 = teams1[0] as ApiTeam | undefined;
      const t2 = teams2[0] as ApiTeam | undefined;
      if (!t1 || !t2) {
        return { widget: null, text: `Takımlar bulunamadı: ${name1} veya ${name2}` };
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
            team_a_goals: finished.reduce((s, f) => s + (f.teams.home.id === t1.team.id ? f.goals.home ?? 0 : f.goals.away ?? 0), 0),
            team_b_goals: finished.reduce((s, f) => s + (f.teams.home.id === t2.team.id ? f.goals.home ?? 0 : f.goals.away ?? 0), 0),
            recent_matches: recent,
          },
        },
        text: `${t1.team.name} ${t1Wins} galibiyet, ${draws} beraberlik, ${t2Wins} mağlubiyet (son ${finished.length} maç).`,
      };
    }

    default:
      return { widget: null, text: '' };
  }
}

// ── API call ─────────────────────────────────────────────────

interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: { id: string; type: 'function'; function: { name: string; arguments: string } }[];
  tool_call_id?: string;
}

// On web (Vercel), call the serverless proxy to avoid CORS and keep key server-side.
// On native mobile, call the gateway directly.
const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';
const AI_ENDPOINT = isWeb
  ? '/api/chat'
  : 'https://gateway.vercel.ai/openai/v1/chat/completions';

async function callAI(messages: ChatMessage[]): Promise<unknown> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  // Native only — web uses the serverless proxy which adds auth server-side
  if (!isWeb) {
    headers['Authorization'] = `Bearer ${AI_GATEWAY_KEY}`;
  }

  const res = await fetch(AI_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: 'gpt-4o-mini',
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

export async function getAIResponse(userMessage: string): Promise<AIChatResponse> {
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
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
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

      const { widget, text: toolResultText } = await executeTool(toolName, toolInput);

      // Second call: model generates natural language response using tool result
      const followUp: ChatMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
        {
          role: 'assistant',
          content: assistantMsg.content,
          tool_calls: assistantMsg.tool_calls,
        },
        {
          role: 'tool',
          content: toolResultText,
          tool_call_id: toolCall.id,
        },
      ];

      const finalResponse = await callAI(followUp) as {
        choices: [{ message: { content: string | null } }];
      };

      const responseText = finalResponse.choices[0]?.message?.content ?? toolResultText;
      return { content: responseText, widget_payload: widget ?? undefined };
    }

    // Direct text response (general question, analysis, no widget needed)
    return { content: assistantMsg.content ?? 'Anlayamadım, tekrar dener misin?' };

  } catch (err) {
    console.error('[Sahadan AI] Error:', err);
    throw err;
  }
}
