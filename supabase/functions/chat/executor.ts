import {
  MOCK_MATCHES,
  MOCK_LIVE_MATCHES,
  MOCK_STANDINGS,
  MOCK_TOP_SCORERS,
  MOCK_PLAYERS,
  MOCK_POPULAR_BETS,
  MOCK_COMMENTARY,
  getMockOdds,
} from './mockData.ts';

export function executeTool(name: string, args: Record<string, any>): { result: any; widget_type: string } {
  switch (name) {
    case 'get_hot_matches':
      return {
        result: { matches: MOCK_MATCHES },
        widget_type: 'hot_matches',
      };

    case 'get_match_odds':
      return {
        result: getMockOdds(args.match_id),
        widget_type: 'turkish_odds',
      };

    case 'get_player_analysis': {
      const key = (args.player_name || '').toLowerCase().split(' ').pop() || '';
      const player = MOCK_PLAYERS[key] || MOCK_PLAYERS.icardi;
      return {
        result: { player },
        widget_type: 'player_analysis',
      };
    }

    case 'create_coupon':
      return {
        result: { selections: args.selections || [], stake: args.stake || 0 },
        widget_type: 'coupon_builder',
      };

    case 'get_league_standings':
      return {
        result: { standings: MOCK_STANDINGS },
        widget_type: 'league_standings',
      };

    case 'get_head_to_head': {
      const teamA = args.team_a || 'Galatasaray';
      const teamB = args.team_b || 'Fenerbahce';
      return {
        result: {
          data: {
            team_a: teamA,
            team_b: teamB,
            total_matches: 52,
            team_a_wins: 22,
            team_b_wins: 18,
            draws: 12,
            team_a_goals: 68,
            team_b_goals: 55,
            recent_matches: [
              { date: '2024-12-22', home_team: teamA, away_team: teamB, home_score: 3, away_score: 1 },
              { date: '2024-04-14', home_team: teamB, away_team: teamA, home_score: 0, away_score: 1 },
              { date: '2023-11-05', home_team: teamA, away_team: teamB, home_score: 0, away_score: 0 },
              { date: '2023-06-04', home_team: teamB, away_team: teamA, home_score: 2, away_score: 1 },
              { date: '2023-01-08', home_team: teamA, away_team: teamB, home_score: 1, away_score: 0 },
            ],
          },
        },
        widget_type: 'head_to_head',
      };
    }

    case 'get_team_form': {
      const team = args.team || 'Galatasaray';
      const standing = MOCK_STANDINGS.find((s) => s.team.toLowerCase().includes(team.toLowerCase()));
      return {
        result: {
          data: {
            team,
            results: standing?.form || ['W', 'D', 'W', 'L', 'W'],
            win_percentage: standing ? (standing.won / standing.played) * 100 : 65,
            goals_scored: standing?.goals_for || 45,
            goals_conceded: standing?.goals_against || 20,
            clean_sheets: 12,
            recent_matches: [
              { date: '2024-12-22', home_team: team, away_team: 'Fenerbahce', home_score: 3, away_score: 1 },
              { date: '2024-12-15', home_team: 'Besiktas', away_team: team, home_score: 1, away_score: 1 },
              { date: '2024-12-08', home_team: team, away_team: 'Trabzonspor', home_score: 2, away_score: 0 },
            ],
          },
        },
        widget_type: 'team_form',
      };
    }

    case 'get_goal_distribution': {
      const team = args.team || 'Galatasaray';
      return {
        result: {
          data: {
            team,
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
        widget_type: 'goal_distribution',
      };
    }

    case 'get_top_scorers':
      return {
        result: { scorers: MOCK_TOP_SCORERS.slice(0, args.limit || 10) },
        widget_type: 'top_scorers',
      };

    case 'get_live_scores':
      return {
        result: { matches: MOCK_LIVE_MATCHES },
        widget_type: 'live_score',
      };

    case 'get_live_odds':
      return {
        result: {
          entries: [
            {
              match: MOCK_LIVE_MATCHES[0],
              current_odds: { id: 'lo1', label: 'MS 1', value: 1.45 },
              previous_odds: 1.85,
              direction: 'down',
              history: [],
            },
            {
              match: MOCK_LIVE_MATCHES[0],
              current_odds: { id: 'lo2', label: 'Ust 2.5', value: 1.25 },
              previous_odds: 1.70,
              direction: 'down',
              history: [],
            },
            {
              match: MOCK_LIVE_MATCHES[1],
              current_odds: { id: 'lo3', label: 'MS 1', value: 2.30 },
              previous_odds: 2.10,
              direction: 'up',
              history: [],
            },
          ],
        },
        widget_type: 'live_odds',
      };

    case 'get_match_timeline': {
      const liveMatch = MOCK_LIVE_MATCHES.find((m) => m.id === args.match_id) || MOCK_LIVE_MATCHES[0];
      return {
        result: {
          match: liveMatch,
          events: liveMatch.events,
        },
        widget_type: 'match_timeline',
      };
    }

    case 'get_live_commentary': {
      const liveMatch = MOCK_LIVE_MATCHES.find((m) => m.id === args.match_id) || MOCK_LIVE_MATCHES[0];
      return {
        result: {
          match: liveMatch,
          commentary: MOCK_COMMENTARY,
        },
        widget_type: 'live_commentary',
      };
    }

    case 'get_popular_bets':
      return {
        result: { bets: MOCK_POPULAR_BETS.slice(0, args.limit || 5) },
        widget_type: 'popular_bets',
      };

    case 'submit_prediction':
      return {
        result: { success: true, match_id: args.match_id, prediction: args.prediction },
        widget_type: '',
      };

    case 'get_prediction_results':
      return {
        result: {
          poll: {
            match_id: args.match_id || 'match_1',
            match_label: args.match_label || 'Galatasaray vs Fenerbahce',
            home_percentage: 58.3,
            draw_percentage: 22.1,
            away_percentage: 19.6,
            total_votes: 3842,
          },
        },
        widget_type: 'match_prediction',
      };

    case 'get_bet_history':
      return {
        result: {
          history: [
            {
              id: 'c1', user_id: 'u1', stake: 100, total_odds: 3.52, potential_return: 352,
              status: 'won',
              selections: [
                { match_id: 'm1', match_label: 'GS vs FB', market: 'MS', selection: 'MS 1', odds: 1.85 },
                { match_id: 'm2', match_label: 'BJK vs TS', market: 'KG', selection: 'KG Var', odds: 1.90 },
              ],
              created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
            },
            {
              id: 'c2', user_id: 'u1', stake: 200, total_odds: 4.80, potential_return: 960,
              status: 'lost',
              selections: [
                { match_id: 'm3', match_label: 'Basaksehir vs Antalya', market: 'MS', selection: 'MS 2', odds: 3.20 },
                { match_id: 'm4', match_label: 'Konya vs Sivas', market: 'ALT_UST', selection: 'Ust 2.5', odds: 1.50 },
              ],
              created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
            },
            {
              id: 'c3', user_id: 'u1', stake: 50, total_odds: 2.15, potential_return: 107.50,
              status: 'pending',
              selections: [
                { match_id: 'm5', match_label: 'GS vs BJK', market: 'KG', selection: 'KG Var', odds: 2.15 },
              ],
              created_at: new Date().toISOString(),
            },
          ],
        },
        widget_type: 'bet_history',
      };

    case 'get_profit_loss':
      return {
        result: {
          data: {
            period: args.period || 'month',
            total_profit: 245.50,
            total_staked: 1850,
            roi: 13.27,
            data_points: Array.from({ length: 14 }, (_, i) => ({
              date: new Date(Date.now() - (13 - i) * 86400000).toISOString(),
              balance: 1000 + Math.sin(i * 0.5) * 200 + i * 20,
            })),
          },
        },
        widget_type: 'profit_loss',
      };

    case 'get_balance_summary':
      return {
        result: {
          summary: {
            current_balance: 1245.50,
            total_bets: 28,
            total_won: 12,
            total_lost: 14,
            win_rate: 42.86,
            average_odds: 2.85,
            roi: 13.27,
            best_win: 960,
          },
        },
        widget_type: 'balance_summary',
      };

    default:
      return { result: { error: 'Bilinmeyen arac' }, widget_type: '' };
  }
}
