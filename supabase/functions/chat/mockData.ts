// Mock data for Turkish Super Lig - used during development

export const MOCK_MATCHES = [
  {
    id: 'match_1',
    home_team: 'Galatasaray',
    away_team: 'Fenerbahce',
    league: 'Super Lig',
    kickoff: new Date(Date.now() + 3 * 3600000).toISOString(),
    status: 'upcoming',
    venue: 'Rams Park',
  },
  {
    id: 'match_2',
    home_team: 'Besiktas',
    away_team: 'Trabzonspor',
    league: 'Super Lig',
    kickoff: new Date(Date.now() + 5 * 3600000).toISOString(),
    status: 'upcoming',
    venue: 'Tupras Stadyumu',
  },
  {
    id: 'match_3',
    home_team: 'Basaksehir',
    away_team: 'Antalyaspor',
    league: 'Super Lig',
    kickoff: new Date(Date.now() + 2 * 3600000).toISOString(),
    status: 'upcoming',
    venue: 'Fatih Terim Stadyumu',
  },
  {
    id: 'match_4',
    home_team: 'Adana Demirspor',
    away_team: 'Konyaspor',
    league: 'Super Lig',
    kickoff: new Date(Date.now() + 4 * 3600000).toISOString(),
    status: 'upcoming',
  },
  {
    id: 'match_5',
    home_team: 'Sivasspor',
    away_team: 'Kasimpasa',
    league: 'Super Lig',
    kickoff: new Date(Date.now() + 6 * 3600000).toISOString(),
    status: 'upcoming',
  },
];

export const MOCK_LIVE_MATCHES = [
  {
    id: 'live_1',
    home_team: 'Galatasaray',
    away_team: 'Fenerbahce',
    league: 'Super Lig',
    kickoff: new Date(Date.now() - 3600000).toISOString(),
    status: 'live',
    home_score: 2,
    away_score: 1,
    elapsed: 67,
    events: [
      { minute: 12, type: 'goal', team: 'Galatasaray', player: 'Icardi', assist: 'Mertens', detail: 'Sol ayak' },
      { minute: 34, type: 'goal', team: 'Fenerbahce', player: 'Dzeko', detail: 'Kafa' },
      { minute: 45, type: 'yellow_card', team: 'Fenerbahce', player: 'Szymanski' },
      { minute: 58, type: 'goal', team: 'Galatasaray', player: 'Mertens', assist: 'Icardi', detail: 'Serbest vurus' },
    ],
  },
  {
    id: 'live_2',
    home_team: 'Besiktas',
    away_team: 'Trabzonspor',
    league: 'Super Lig',
    kickoff: new Date(Date.now() - 2400000).toISOString(),
    status: 'live',
    home_score: 0,
    away_score: 0,
    elapsed: 38,
    events: [
      { minute: 22, type: 'yellow_card', team: 'Besiktas', player: 'Gedson Fernandes' },
    ],
  },
];

export function getMockOdds(matchId: string) {
  const oddsMap: Record<string, any> = {
    match_1: {
      match: MOCK_MATCHES[0],
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
    match_2: {
      match: MOCK_MATCHES[1],
      markets: [
        { market: 'MS', label: 'Mac Sonucu', options: [
          { id: 'ms_1', label: '1', value: 2.10 },
          { id: 'ms_x', label: 'X', value: 3.25 },
          { id: 'ms_2', label: '2', value: 3.50 },
        ]},
        { market: 'KG', label: 'Karsilikli Gol', options: [
          { id: 'kg_var', label: 'Var', value: 1.80 },
          { id: 'kg_yok', label: 'Yok', value: 1.95 },
        ]},
        { market: 'ALT_UST', label: 'Alt/Ust 2.5', options: [
          { id: 'au_alt', label: 'Alt', value: 1.90 },
          { id: 'au_ust', label: 'Ust', value: 1.85 },
        ]},
        { market: 'IY', label: 'Ilk Yari', options: [
          { id: 'iy_1', label: '1', value: 2.65 },
          { id: 'iy_x', label: 'X', value: 2.10 },
          { id: 'iy_2', label: '2', value: 4.00 },
        ]},
      ],
    },
  };

  // Default odds for unknown matches
  return oddsMap[matchId] || {
    match: { id: matchId, home_team: 'Ev Sahibi', away_team: 'Deplasman', league: 'Super Lig', kickoff: new Date().toISOString(), status: 'upcoming' },
    markets: [
      { market: 'MS', label: 'Mac Sonucu', options: [
        { id: 'ms_1', label: '1', value: 2.00 },
        { id: 'ms_x', label: 'X', value: 3.30 },
        { id: 'ms_2', label: '2', value: 3.60 },
      ]},
      { market: 'KG', label: 'Karsilikli Gol', options: [
        { id: 'kg_var', label: 'Var', value: 1.75 },
        { id: 'kg_yok', label: 'Yok', value: 2.00 },
      ]},
      { market: 'ALT_UST', label: 'Alt/Ust 2.5', options: [
        { id: 'au_alt', label: 'Alt', value: 2.00 },
        { id: 'au_ust', label: 'Ust', value: 1.78 },
      ]},
    ],
  };
}

export const MOCK_PLAYERS: Record<string, any> = {
  icardi: {
    id: 'player_1', name: 'Mauro Icardi', team: 'Galatasaray', position: 'Forvet',
    nationality: 'Arjantin', age: 31, injured: false,
    stats: { matches: 28, goals: 22, assists: 6, rating: 7.8, minutes: 2340, yellow_cards: 3, red_cards: 0, shots_on_target: 45, pass_accuracy: 78 },
    form: ['W', 'W', 'D', 'W', 'L'],
  },
  dzeko: {
    id: 'player_2', name: 'Edin Dzeko', team: 'Fenerbahce', position: 'Forvet',
    nationality: 'Bosna Hersek', age: 38, injured: false,
    stats: { matches: 30, goals: 15, assists: 8, rating: 7.2, minutes: 2100, yellow_cards: 4, red_cards: 0, shots_on_target: 32, pass_accuracy: 75 },
    form: ['D', 'W', 'W', 'L', 'W'],
  },
  tadic: {
    id: 'player_3', name: 'Dusan Tadic', team: 'Fenerbahce', position: 'Orta Saha',
    nationality: 'Sirbistan', age: 35, injured: false,
    stats: { matches: 32, goals: 8, assists: 14, rating: 7.5, minutes: 2700, yellow_cards: 5, red_cards: 0, shots_on_target: 20, pass_accuracy: 86 },
    form: ['W', 'W', 'D', 'W', 'W'],
  },
  rashica: {
    id: 'player_4', name: 'Milot Rashica', team: 'Besiktas', position: 'Kanat',
    nationality: 'Kosova', age: 28, injured: true, injury_reason: 'Kasik sakatlanmasi',
    stats: { matches: 20, goals: 6, assists: 5, rating: 6.9, minutes: 1500, yellow_cards: 2, red_cards: 0, shots_on_target: 15, pass_accuracy: 72 },
    form: ['L', 'D', 'W', 'L', 'D'],
  },
};

export const MOCK_STANDINGS = [
  { rank: 1, team: 'Galatasaray', played: 32, won: 25, drawn: 4, lost: 3, goals_for: 72, goals_against: 25, goal_difference: 47, points: 79, form: ['W', 'W', 'D', 'W', 'W'] as const },
  { rank: 2, team: 'Fenerbahce', played: 32, won: 24, drawn: 5, lost: 3, goals_for: 68, goals_against: 22, goal_difference: 46, points: 77, form: ['W', 'D', 'W', 'W', 'L'] as const },
  { rank: 3, team: 'Besiktas', played: 32, won: 18, drawn: 7, lost: 7, goals_for: 55, goals_against: 35, goal_difference: 20, points: 61, form: ['D', 'W', 'L', 'W', 'D'] as const },
  { rank: 4, team: 'Trabzonspor', played: 32, won: 16, drawn: 8, lost: 8, goals_for: 48, goals_against: 32, goal_difference: 16, points: 56, form: ['W', 'L', 'W', 'D', 'W'] as const },
  { rank: 5, team: 'Basaksehir', played: 32, won: 15, drawn: 8, lost: 9, goals_for: 44, goals_against: 35, goal_difference: 9, points: 53, form: ['L', 'W', 'W', 'D', 'L'] as const },
  { rank: 6, team: 'Adana Demirspor', played: 32, won: 14, drawn: 6, lost: 12, goals_for: 42, goals_against: 40, goal_difference: 2, points: 48, form: ['W', 'L', 'D', 'W', 'L'] as const },
  { rank: 7, team: 'Antalyaspor', played: 32, won: 13, drawn: 7, lost: 12, goals_for: 38, goals_against: 38, goal_difference: 0, points: 46, form: ['D', 'D', 'W', 'L', 'W'] as const },
  { rank: 8, team: 'Konyaspor', played: 32, won: 12, drawn: 8, lost: 12, goals_for: 36, goals_against: 39, goal_difference: -3, points: 44, form: ['L', 'W', 'D', 'D', 'W'] as const },
  { rank: 9, team: 'Sivasspor', played: 32, won: 11, drawn: 9, lost: 12, goals_for: 35, goals_against: 38, goal_difference: -3, points: 42, form: ['D', 'L', 'W', 'W', 'L'] as const },
  { rank: 10, team: 'Kasimpasa', played: 32, won: 11, drawn: 7, lost: 14, goals_for: 38, goals_against: 45, goal_difference: -7, points: 40, form: ['L', 'L', 'W', 'D', 'W'] as const },
  { rank: 11, team: 'Gaziantep FK', played: 32, won: 10, drawn: 8, lost: 14, goals_for: 32, goals_against: 42, goal_difference: -10, points: 38, form: ['W', 'D', 'L', 'L', 'D'] as const },
  { rank: 12, team: 'Hatayspor', played: 32, won: 10, drawn: 7, lost: 15, goals_for: 30, goals_against: 43, goal_difference: -13, points: 37, form: ['L', 'W', 'L', 'D', 'L'] as const },
  { rank: 13, team: 'Kayserispor', played: 32, won: 9, drawn: 9, lost: 14, goals_for: 32, goals_against: 44, goal_difference: -12, points: 36, form: ['D', 'L', 'D', 'W', 'L'] as const },
  { rank: 14, team: 'Alanyaspor', played: 32, won: 9, drawn: 8, lost: 15, goals_for: 30, goals_against: 42, goal_difference: -12, points: 35, form: ['L', 'D', 'W', 'L', 'L'] as const },
  { rank: 15, team: 'Rizespor', played: 32, won: 9, drawn: 6, lost: 17, goals_for: 28, goals_against: 48, goal_difference: -20, points: 33, form: ['L', 'L', 'W', 'L', 'D'] as const },
  { rank: 16, team: 'Samsunspor', played: 32, won: 8, drawn: 8, lost: 16, goals_for: 27, goals_against: 45, goal_difference: -18, points: 32, form: ['D', 'L', 'L', 'D', 'W'] as const },
  { rank: 17, team: 'Pendikspor', played: 32, won: 7, drawn: 7, lost: 18, goals_for: 24, goals_against: 50, goal_difference: -26, points: 28, form: ['L', 'L', 'D', 'L', 'L'] as const },
  { rank: 18, team: 'Istanbulspor', played: 32, won: 6, drawn: 8, lost: 18, goals_for: 25, goals_against: 52, goal_difference: -27, points: 26, form: ['L', 'D', 'L', 'L', 'L'] as const },
  { rank: 19, team: 'Karagumruk', played: 32, won: 5, drawn: 7, lost: 20, goals_for: 22, goals_against: 55, goal_difference: -33, points: 22, form: ['L', 'L', 'L', 'D', 'L'] as const },
];

export const MOCK_TOP_SCORERS = [
  { rank: 1, player_id: 'player_1', name: 'Mauro Icardi', team: 'Galatasaray', goals: 22, assists: 6, matches: 28 },
  { rank: 2, player_id: 'player_2', name: 'Edin Dzeko', team: 'Fenerbahce', goals: 15, assists: 8, matches: 30 },
  { rank: 3, player_id: 'p3', name: 'Vincent Aboubakar', team: 'Besiktas', goals: 14, assists: 4, matches: 26 },
  { rank: 4, player_id: 'p4', name: 'Cedric Bakambu', team: 'Trabzonspor', goals: 12, assists: 3, matches: 29 },
  { rank: 5, player_id: 'p5', name: 'Bafetimbi Gomis', team: 'Galatasaray', goals: 11, assists: 2, matches: 25 },
  { rank: 6, player_id: 'p6', name: 'Anderson Talisca', team: 'Fenerbahce', goals: 10, assists: 7, matches: 31 },
  { rank: 7, player_id: 'p7', name: 'Cenk Tosun', team: 'Besiktas', goals: 9, assists: 3, matches: 27 },
  { rank: 8, player_id: 'player_3', name: 'Dusan Tadic', team: 'Fenerbahce', goals: 8, assists: 14, matches: 32 },
  { rank: 9, player_id: 'p9', name: 'Djaniny', team: 'Antalyaspor', goals: 8, assists: 2, matches: 28 },
  { rank: 10, player_id: 'p10', name: 'Mario Balotelli', team: 'Adana Demirspor', goals: 7, assists: 4, matches: 22 },
];

export const MOCK_POPULAR_BETS = [
  { id: 'pb1', match_label: 'Galatasaray vs Fenerbahce', market: 'MS', selection: '1', odds: 1.85, pick_percentage: 62.3, total_picks: 1547 },
  { id: 'pb2', match_label: 'Galatasaray vs Fenerbahce', market: 'KG', selection: 'Var', odds: 1.72, pick_percentage: 78.1, total_picks: 2103 },
  { id: 'pb3', match_label: 'Besiktas vs Trabzonspor', market: 'ALT_UST', selection: 'Ust', odds: 1.85, pick_percentage: 55.8, total_picks: 892 },
  { id: 'pb4', match_label: 'Basaksehir vs Antalyaspor', market: 'MS', selection: '1', odds: 1.65, pick_percentage: 71.2, total_picks: 634 },
  { id: 'pb5', match_label: 'Galatasaray vs Fenerbahce', market: 'ALT_UST', selection: 'Ust', odds: 1.70, pick_percentage: 68.9, total_picks: 1876 },
];

export const MOCK_COMMENTARY = [
  { minute: 1, text: 'Mac basladi! Galatasaray acilis vurusunu yapti.', event_type: 'info' },
  { minute: 5, text: 'Galatasaray erken baskiyla oynuyor, Fenerbahce savunmada.', event_type: 'info' },
  { minute: 12, text: 'GOOOOL! Icardi sol ayakla sert vurdu, kaleci uzanamadi! Mertens\'in guzel asisti. 1-0 Galatasaray!', event_type: 'goal' },
  { minute: 18, text: 'Fenerbahce topa sahip olmaya basliyor, Tadic orta sahada etkili.', event_type: 'info' },
  { minute: 25, text: 'Tehlikeli pozisyon! Dzeko\'nun sutu direkten dondu.', event_type: 'chance' },
  { minute: 34, text: 'GOOOOL! Dzeko kafa vurusuyla esitledi! Tadic\'in kosesinden muhtesem orta. 1-1!', event_type: 'goal' },
  { minute: 45, text: 'Szymanski\'ye sari kart. Sert mudahale.', event_type: 'card' },
  { minute: 58, text: 'GOOOOL! Mertens serbest vurustan fileden findik topladi! Icardi\'nin kazandigi faul. 2-1 Galatasaray!', event_type: 'goal' },
  { minute: 65, text: 'Fenerbahce cift forvet gecti, Mourinho riske giriyor.', event_type: 'info' },
];
