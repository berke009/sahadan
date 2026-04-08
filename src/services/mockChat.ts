import { WidgetPayload, WidgetType } from '../types';

interface MockResponse {
  content: string;
  widget_type?: WidgetType;
  widget_payload?: WidgetPayload;
}

const MOCK_MATCHES = [
  { id: 'match_1', home_team: 'Galatasaray', away_team: 'Fenerbahce', league: 'Super Lig', kickoff: new Date(Date.now() + 3 * 3600000).toISOString(), status: 'upcoming' as const },
  { id: 'match_2', home_team: 'Besiktas', away_team: 'Trabzonspor', league: 'Super Lig', kickoff: new Date(Date.now() + 5 * 3600000).toISOString(), status: 'upcoming' as const },
  { id: 'match_3', home_team: 'Basaksehir', away_team: 'Antalyaspor', league: 'Super Lig', kickoff: new Date(Date.now() + 2 * 3600000).toISOString(), status: 'upcoming' as const },
  { id: 'match_4', home_team: 'Adana Demirspor', away_team: 'Konyaspor', league: 'Super Lig', kickoff: new Date(Date.now() + 4 * 3600000).toISOString(), status: 'upcoming' as const },
  { id: 'match_5', home_team: 'Sivasspor', away_team: 'Kasimpasa', league: 'Super Lig', kickoff: new Date(Date.now() + 6 * 3600000).toISOString(), status: 'upcoming' as const },
];

export function getMockResponse(message: string): MockResponse {
  const msg = message.toLowerCase();

  // Hot matches
  if (msg.includes('mac') || msg.includes('bugun') || msg.includes('fixture') || msg.includes('aksam')) {
    return {
      content: 'Bugunku Super Lig maclari! Bir maca tiklayarak detaylari gorebilirsin.',
      widget_type: 'hot_matches',
      widget_payload: { type: 'hot_matches', matches: MOCK_MATCHES },
    };
  }

  // Match probability / analysis
  if (msg.includes('oran') || msg.includes('olasilik') || msg.includes('analiz et')) {
    const match = MOCK_MATCHES.find((m) =>
      msg.includes(m.home_team.toLowerCase()) || msg.includes(m.away_team.toLowerCase())
    ) || MOCK_MATCHES[0];
    return {
      content: `${match.home_team} vs ${match.away_team} AI olasilik analizi:`,
      widget_type: 'match_probability',
      widget_payload: {
        type: 'match_probability',
        data: {
          match,
          markets: [
            { market: 'MS', label: 'Mac Sonucu', options: [
              { id: 'ms_1', label: '1', value: 1.85 },
              { id: 'ms_x', label: 'X', value: 3.40 },
              { id: 'ms_2', label: '2', value: 4.20 },
            ]},
            { market: 'KG', label: 'Karsilikli Gol', options: [
              { id: 'kg_var', label: 'Var', value: 1.72 },
              { id: 'kg_yok', label: 'Yok', value: 2.05 },
            ]},
            { market: 'ALT_UST', label: 'Alt/Ust 2.5', options: [
              { id: 'au_alt', label: 'Alt', value: 2.10 },
              { id: 'au_ust', label: 'Ust', value: 1.70 },
            ]},
            { market: 'IY', label: 'Ilk Yari', options: [
              { id: 'iy_1', label: '1', value: 2.40 },
              { id: 'iy_x', label: 'X', value: 2.15 },
              { id: 'iy_2', label: '2', value: 4.80 },
            ]},
          ],
        },
      },
    };
  }

  // Player analysis
  if (msg.includes('icardi') || msg.includes('oyuncu') || msg.includes('analiz')) {
    return {
      content: 'Icardi bu sezon muhtesem bir performans sergiliyor!',
      widget_type: 'player_analysis',
      widget_payload: {
        type: 'player_analysis',
        player: {
          id: 'p1', name: 'Mauro Icardi', team: 'Galatasaray', position: 'Forvet',
          nationality: 'Arjantin', age: 31, injured: false,
          stats: { matches: 28, goals: 22, assists: 6, rating: 7.8, minutes: 2340, yellow_cards: 3, red_cards: 0, shots_on_target: 45, pass_accuracy: 78 },
          form: ['W', 'W', 'D', 'W', 'L'],
        },
      },
    };
  }

  // League standings
  if (msg.includes('puan') || msg.includes('siralama') || msg.includes('tablo') || msg.includes('standing')) {
    return {
      content: 'Super Lig puan durumu:',
      widget_type: 'league_standings',
      widget_payload: {
        type: 'league_standings',
        standings: [
          { rank: 1, team: 'Galatasaray', played: 32, won: 25, drawn: 4, lost: 3, goals_for: 72, goals_against: 25, goal_difference: 47, points: 79, form: ['W', 'W', 'D', 'W', 'W'] },
          { rank: 2, team: 'Fenerbahce', played: 32, won: 24, drawn: 5, lost: 3, goals_for: 68, goals_against: 22, goal_difference: 46, points: 77, form: ['W', 'D', 'W', 'W', 'L'] },
          { rank: 3, team: 'Besiktas', played: 32, won: 18, drawn: 7, lost: 7, goals_for: 55, goals_against: 35, goal_difference: 20, points: 61, form: ['D', 'W', 'L', 'W', 'D'] },
          { rank: 4, team: 'Trabzonspor', played: 32, won: 16, drawn: 8, lost: 8, goals_for: 48, goals_against: 32, goal_difference: 16, points: 56, form: ['W', 'L', 'W', 'D', 'W'] },
          { rank: 5, team: 'Basaksehir', played: 32, won: 15, drawn: 8, lost: 9, goals_for: 44, goals_against: 35, goal_difference: 9, points: 53, form: ['L', 'W', 'W', 'D', 'L'] },
        ],
      },
    };
  }

  // Head to head
  if (msg.includes('karsilastir') || msg.includes('h2h') || msg.includes('vs')) {
    return {
      content: 'Iste iki takim arasindaki karsilastirma:',
      widget_type: 'head_to_head',
      widget_payload: {
        type: 'head_to_head',
        data: {
          team_a: 'Galatasaray', team_b: 'Fenerbahce',
          total_matches: 52, team_a_wins: 22, team_b_wins: 18, draws: 12,
          team_a_goals: 68, team_b_goals: 55,
          recent_matches: [
            { date: '2024-12-22', home_team: 'Galatasaray', away_team: 'Fenerbahce', home_score: 3, away_score: 1 },
            { date: '2024-04-14', home_team: 'Fenerbahce', away_team: 'Galatasaray', home_score: 0, away_score: 1 },
          ],
        },
      },
    };
  }

  // Team form
  if (msg.includes('form') || msg.includes('son mac')) {
    return {
      content: 'Takim son form durumu:',
      widget_type: 'team_form',
      widget_payload: {
        type: 'team_form',
        data: {
          team: 'Galatasaray', results: ['W', 'W', 'D', 'W', 'W'],
          win_percentage: 78.1, goals_scored: 72, goals_conceded: 25, clean_sheets: 14,
          recent_matches: [
            { date: '2024-12-22', home_team: 'Galatasaray', away_team: 'Fenerbahce', home_score: 3, away_score: 1 },
            { date: '2024-12-15', home_team: 'Besiktas', away_team: 'Galatasaray', home_score: 1, away_score: 1 },
          ],
        },
      },
    };
  }

  // Goal distribution
  if (msg.includes('gol dagilim')) {
    return {
      content: 'Gol dagilimi grafigi:',
      widget_type: 'goal_distribution',
      widget_payload: {
        type: 'goal_distribution',
        data: {
          team: 'Galatasaray',
          intervals: [
            { label: '0-15', scored: 8, conceded: 3 },
            { label: '16-30', scored: 12, conceded: 5 },
            { label: '31-45', scored: 10, conceded: 4 },
            { label: '46-60', scored: 15, conceded: 6 },
            { label: '61-75', scored: 14, conceded: 4 },
            { label: '76-90+', scored: 13, conceded: 3 },
          ],
        },
      },
    };
  }

  // Top scorers
  if (msg.includes('gol kralligi') || msg.includes('golcu') || msg.includes('scorer')) {
    return {
      content: 'Super Lig gol kralligi:',
      widget_type: 'top_scorers',
      widget_payload: {
        type: 'top_scorers',
        scorers: [
          { rank: 1, player_id: 'p1', name: 'Mauro Icardi', team: 'Galatasaray', goals: 22, assists: 6, matches: 28 },
          { rank: 2, player_id: 'p2', name: 'Edin Dzeko', team: 'Fenerbahce', goals: 15, assists: 8, matches: 30 },
          { rank: 3, player_id: 'p3', name: 'V. Aboubakar', team: 'Besiktas', goals: 14, assists: 4, matches: 26 },
          { rank: 4, player_id: 'p4', name: 'C. Bakambu', team: 'Trabzonspor', goals: 12, assists: 3, matches: 29 },
          { rank: 5, player_id: 'p5', name: 'B. Gomis', team: 'Galatasaray', goals: 11, assists: 2, matches: 25 },
        ],
      },
    };
  }

  // Live scores
  if (msg.includes('canli') || msg.includes('live') || msg.includes('skor')) {
    return {
      content: 'Su an devam eden maclar:',
      widget_type: 'live_score',
      widget_payload: {
        type: 'live_score',
        matches: [
          {
            id: 'live_1', home_team: 'Galatasaray', away_team: 'Fenerbahce', league: 'Super Lig',
            kickoff: new Date(Date.now() - 3600000).toISOString(), status: 'live' as const,
            home_score: 2, away_score: 1, elapsed: 67,
            events: [
              { minute: 12, type: 'goal' as const, team: 'Galatasaray', player: 'Icardi', assist: 'Mertens' },
              { minute: 58, type: 'goal' as const, team: 'Galatasaray', player: 'Mertens' },
            ],
          },
        ],
      },
    };
  }

  // Trending predictions
  if (msg.includes('populer') || msg.includes('popular') || msg.includes('trend')) {
    return {
      content: 'Toplulukta en cok paylasilan tahminler:',
      widget_type: 'trending_predictions',
      widget_payload: {
        type: 'trending_predictions',
        predictions: [
          { id: 'tp1', match_label: 'GS vs FB', market: 'MS', selection: '1', probability: 0.54, pick_percentage: 62.3, total_picks: 1547 },
          { id: 'tp2', match_label: 'GS vs FB', market: 'KG', selection: 'Var', probability: 0.58, pick_percentage: 78.1, total_picks: 2103 },
          { id: 'tp3', match_label: 'BJK vs TS', market: 'ALT_UST', selection: 'Ust', probability: 0.54, pick_percentage: 55.8, total_picks: 892 },
        ],
      },
    };
  }

  // Prediction
  if (msg.includes('tahmin')) {
    return {
      content: 'Tahminini yap ve toplulugun ne dusundugunu gor:',
      widget_type: 'match_prediction',
      widget_payload: {
        type: 'match_prediction',
        poll: {
          match_id: 'match_1', match_label: 'Galatasaray vs Fenerbahce',
          home_percentage: 58.3, draw_percentage: 22.1, away_percentage: 19.6, total_votes: 3842,
        },
      },
    };
  }

  // Prediction history
  if (msg.includes('gecmis') || msg.includes('history') || msg.includes('tahminlerim')) {
    return {
      content: 'Tahmin gecmisin:',
      widget_type: 'prediction_history',
      widget_payload: {
        type: 'prediction_history',
        history: [
          {
            id: 'ph1', user_id: 'u1', status: 'correct' as const,
            selections: [
              { match_id: 'm1', match_label: 'GS vs FB', market: 'MS', selection: 'MS 1', probability: 0.54 },
              { match_id: 'm2', match_label: 'BJK vs TS', market: 'KG', selection: 'KG Var', probability: 0.53 },
            ],
            created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          },
          {
            id: 'ph2', user_id: 'u1', status: 'incorrect' as const,
            selections: [
              { match_id: 'm3', match_label: 'Basaksehir vs Antalya', market: 'MS', selection: 'MS 2', probability: 0.31 },
            ],
            created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
          },
        ],
      },
    };
  }

  // Accuracy tracking
  if (msg.includes('dogruluk') || msg.includes('basari') || msg.includes('accuracy') || msg.includes('istatistik')) {
    return {
      content: 'Tahmin dogruluk performansin:',
      widget_type: 'accuracy_tracking',
      widget_payload: {
        type: 'accuracy_tracking',
        data: {
          period: 'month',
          total_predictions: 42,
          correct_predictions: 26,
          accuracy_rate: 61.9,
          data_points: Array.from({ length: 14 }, (_, i) => ({
            date: new Date(Date.now() - (13 - i) * 86400000).toISOString(),
            accuracy: 40 + Math.sin(i * 0.5) * 20 + i * 1.5,
          })),
        },
      },
    };
  }

  // Analyst profile
  if (msg.includes('profil') || msg.includes('seviye') || msg.includes('xp') || msg.includes('hesap')) {
    return {
      content: 'Analist profilin:',
      widget_type: 'analyst_profile',
      widget_payload: {
        type: 'analyst_profile',
        profile: {
          total_predictions: 42,
          correct_predictions: 26,
          incorrect_predictions: 16,
          accuracy_rate: 61.9,
          streak: 4,
          best_streak: 8,
          xp: 2450,
          level: 'UZMAN ANALiST',
        },
      },
    };
  }

  // Default
  return {
    content: 'Merhaba! Ben SOCCERA AI asistaniyim. Futbol hakkinda her seyi sorabilirsin:\n\n' +
      '⚽ "Bugun hangi maclar var?" — Gunun maclari\n' +
      '📊 "GS vs FB olasiliklari" — AI mac analizi\n' +
      '🏟 "Puan durumu" — Lig tablosu\n' +
      '🔴 "Canli skorlar" — Devam eden maclar\n' +
      '⭐ "Icardi analizi" — Oyuncu istatistikleri\n' +
      '🔥 "Trend tahminler" — Topluluk tahminleri\n' +
      '🎯 "Tahmin yap" — Mac tahmini\n' +
      '📈 "Dogruluk oranim" — Performans grafigi\n' +
      '👤 "Profilim" — Analist profili\n' +
      '🏆 "Gol kralligi" — En golcu oyuncular\n' +
      '⚔ "GS vs FB karsilastir" — Takim karsilastirmasi\n\n' +
      'Ne merak ediyorsun?',
  };
}
