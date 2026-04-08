// ============ Core Types ============

export type MessageRole = 'user' | 'assistant' | 'system';

export type WidgetType =
  | 'hot_matches'
  | 'match_probability'
  | 'player_analysis'
  | 'match_watchlist'
  | 'league_standings'
  | 'head_to_head'
  | 'team_form'
  | 'goal_distribution'
  | 'top_scorers'
  | 'live_score'
  | 'live_probability'
  | 'match_timeline'
  | 'live_commentary'
  | 'trending_predictions'
  | 'match_prediction'
  | 'prediction_history'
  | 'accuracy_tracking'
  | 'analyst_profile';

export interface Message {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  widget_type?: WidgetType;
  widget_payload?: WidgetPayload;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  xp: number;
  total_predictions: number;
  correct_predictions: number;
  created_at: string;
}

// ============ Match & Probability Types ============

export interface Match {
  id: string;
  home_team: string;
  away_team: string;
  home_logo?: string;
  away_logo?: string;
  league: string;
  kickoff: string;
  status: 'upcoming' | 'live' | 'finished';
  home_score?: number;
  away_score?: number;
  elapsed?: number;
  venue?: string;
}

export interface ProbabilityMarket {
  market: string; // MS, KG, ALT_UST, IY
  label: string;
  options: ProbabilityOption[];
}

export interface ProbabilityOption {
  label: string;
  value: number;      // probability/odds value
  id: string;
}

export interface MatchProbability {
  match: Match;
  markets: ProbabilityMarket[];
}

// ============ Player Types ============

export interface Player {
  id: string;
  name: string;
  team: string;
  position: string;
  photo?: string;
  nationality?: string;
  age?: number;
  stats: PlayerStats;
  form: MatchResult[];
  injured: boolean;
  injury_reason?: string;
}

export interface PlayerStats {
  matches: number;
  goals: number;
  assists: number;
  rating: number;
  minutes: number;
  yellow_cards: number;
  red_cards: number;
  shots_on_target?: number;
  pass_accuracy?: number;
}

export type MatchResult = 'W' | 'D' | 'L';

// ============ Watchlist Types (replaces Coupon) ============

export interface WatchlistItem {
  match_id: string;
  match_label: string;
  market: string;
  selection: string;
  probability: number;      // AI probability score
}

// ============ Standings Types ============

export interface StandingEntry {
  rank: number;
  team: string;
  team_logo?: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  form: MatchResult[];
}

// ============ Head to Head Types ============

export interface HeadToHead {
  team_a: string;
  team_b: string;
  total_matches: number;
  team_a_wins: number;
  team_b_wins: number;
  draws: number;
  team_a_goals: number;
  team_b_goals: number;
  recent_matches: RecentMatch[];
}

export interface RecentMatch {
  date: string;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
}

// ============ Team Form Types ============

export interface TeamForm {
  team: string;
  team_logo?: string;
  results: MatchResult[];
  win_percentage: number;
  goals_scored: number;
  goals_conceded: number;
  clean_sheets: number;
  recent_matches: RecentMatch[];
}

// ============ Goal Distribution Types ============

export interface GoalDistribution {
  team: string;
  intervals: GoalInterval[];
}

export interface GoalInterval {
  label: string;
  scored: number;
  conceded: number;
}

// ============ Top Scorers Types ============

export interface TopScorer {
  rank: number;
  player_id: string;
  name: string;
  team: string;
  photo?: string;
  goals: number;
  assists: number;
  matches: number;
}

// ============ Live Types ============

export interface LiveMatch extends Match {
  status: 'live';
  elapsed: number;
  events: MatchEvent[];
}

export interface MatchEvent {
  minute: number;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'var';
  team: string;
  player: string;
  detail?: string;
  assist?: string;
}

export interface LiveProbabilityEntry {
  match: Match;
  current_probability: ProbabilityOption;
  previous_value: number;
  direction: 'up' | 'down' | 'stable';
  history: { time: string; value: number }[];
}

export interface Commentary {
  minute: number;
  text: string;
  event_type?: 'goal' | 'card' | 'substitution' | 'chance' | 'info';
}

// ============ Social Types ============

export interface TrendingPrediction {
  id: string;
  match_label: string;
  market: string;
  selection: string;
  probability: number;
  pick_percentage: number;
  total_picks: number;
}

export interface PredictionPoll {
  match_id: string;
  match_label: string;
  home_percentage: number;
  draw_percentage: number;
  away_percentage: number;
  total_votes: number;
  user_vote?: '1' | 'X' | '2';
}

// ============ Account Types ============

export interface PredictionHistoryEntry {
  id: string;
  user_id: string;
  selections: WatchlistItem[];
  created_at: string;
  status: 'pending' | 'correct' | 'incorrect';
  settled_at?: string;
}

export interface AccuracyData {
  period: string;
  data_points: { date: string; accuracy: number }[];
  total_predictions: number;
  correct_predictions: number;
  accuracy_rate: number;
}

export interface AnalystProfile {
  total_predictions: number;
  correct_predictions: number;
  incorrect_predictions: number;
  accuracy_rate: number;
  streak: number;
  best_streak: number;
  xp: number;
  level: string;
}

// ============ Widget Payload Union ============

export type WidgetPayload =
  | { type: 'hot_matches'; matches: Match[] }
  | { type: 'match_probability'; data: MatchProbability }
  | { type: 'player_analysis'; player: Player }
  | { type: 'match_watchlist'; items: WatchlistItem[] }
  | { type: 'league_standings'; standings: StandingEntry[] }
  | { type: 'head_to_head'; data: HeadToHead }
  | { type: 'team_form'; data: TeamForm }
  | { type: 'goal_distribution'; data: GoalDistribution }
  | { type: 'top_scorers'; scorers: TopScorer[] }
  | { type: 'live_score'; matches: LiveMatch[] }
  | { type: 'live_probability'; entries: LiveProbabilityEntry[] }
  | { type: 'match_timeline'; match: Match; events: MatchEvent[] }
  | { type: 'live_commentary'; match: Match; commentary: Commentary[] }
  | { type: 'trending_predictions'; predictions: TrendingPrediction[] }
  | { type: 'match_prediction'; poll: PredictionPoll }
  | { type: 'prediction_history'; history: PredictionHistoryEntry[] }
  | { type: 'accuracy_tracking'; data: AccuracyData }
  | { type: 'analyst_profile'; profile: AnalystProfile };
