import React from 'react';
import { WidgetPayload } from '../../types';
import { HotMatchesWidget } from './core/HotMatchesWidget';
import { TurkishOddsWidget } from './core/TurkishOddsWidget';
import { PlayerAnalysisWidget } from './core/PlayerAnalysisWidget';
import { CouponBuilderWidget } from './core/CouponBuilderWidget';
import { LeagueStandingsWidget } from './stats/LeagueStandingsWidget';
import { HeadToHeadWidget } from './stats/HeadToHeadWidget';
import { TeamFormWidget } from './stats/TeamFormWidget';
import { GoalDistributionWidget } from './stats/GoalDistributionWidget';
import { TopScorersWidget } from './stats/TopScorersWidget';
import { LiveScoreWidget } from './live/LiveScoreWidget';
import { LiveOddsWidget } from './live/LiveOddsWidget';
import { MatchTimelineWidget } from './live/MatchTimelineWidget';
import { LiveCommentaryWidget } from './live/LiveCommentaryWidget';
import { PopularBetsWidget } from './social/PopularBetsWidget';
import { MatchPredictionWidget } from './social/MatchPredictionWidget';
import { BetHistoryWidget } from './account/BetHistoryWidget';
import { ProfitLossWidget } from './account/ProfitLossWidget';
import { BalanceSummaryWidget } from './account/BalanceSummaryWidget';

interface WidgetRendererProps {
  payload: WidgetPayload;
}

export function WidgetRenderer({ payload }: WidgetRendererProps) {
  switch (payload.type) {
    case 'hot_matches':
      return <HotMatchesWidget matches={payload.matches} />;
    case 'match_probability':
      return <TurkishOddsWidget data={payload.data} />;
    case 'player_analysis':
      return <PlayerAnalysisWidget player={payload.player} />;
    case 'match_watchlist':
      return <CouponBuilderWidget items={payload.items} />;
    case 'league_standings':
      return <LeagueStandingsWidget standings={payload.standings} />;
    case 'head_to_head':
      return <HeadToHeadWidget data={payload.data} />;
    case 'team_form':
      return <TeamFormWidget data={payload.data} />;
    case 'goal_distribution':
      return <GoalDistributionWidget data={payload.data} />;
    case 'top_scorers':
      return <TopScorersWidget scorers={payload.scorers} />;
    case 'live_score':
      return <LiveScoreWidget matches={payload.matches} />;
    case 'live_probability':
      return <LiveOddsWidget entries={payload.entries} />;
    case 'match_timeline':
      return <MatchTimelineWidget match={payload.match} events={payload.events} />;
    case 'live_commentary':
      return <LiveCommentaryWidget match={payload.match} commentary={payload.commentary} />;
    case 'trending_predictions':
      return <PopularBetsWidget predictions={payload.predictions} />;
    case 'match_prediction':
      return <MatchPredictionWidget poll={payload.poll} />;
    case 'prediction_history':
      return <BetHistoryWidget history={payload.history} />;
    case 'accuracy_tracking':
      return <ProfitLossWidget data={payload.data} />;
    case 'analyst_profile':
      return <BalanceSummaryWidget profile={payload.profile} />;
    default:
      return null;
  }
}
