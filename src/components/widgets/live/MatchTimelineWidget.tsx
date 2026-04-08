import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Match, MatchEvent } from '../../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../constants/theme';
import { formatMinute } from '../../../utils/format';

interface Props {
  match: Match;
  events: MatchEvent[];
}

const EVENT_ICONS: Record<string, string> = {
  goal: '⚽',
  yellow_card: '🟡',
  red_card: '🔴',
  substitution: '🔄',
  var: '📺',
};

export function MatchTimelineWidget({ match, events }: Props) {
  return (
    <ScrollView style={styles.container} nestedScrollEnabled>
      <View style={styles.matchHeader}>
        <Text style={styles.team}>{match.home_team}</Text>
        <Text style={styles.score}>
          {match.home_score ?? 0} - {match.away_score ?? 0}
        </Text>
        <Text style={styles.team}>{match.away_team}</Text>
      </View>

      <View style={styles.timeline}>
        {events.map((event, i) => {
          const isHome = event.team === match.home_team;
          return (
            <View key={i} style={[styles.eventRow, isHome ? styles.homeEvent : styles.awayEvent]}>
              {isHome && (
                <View style={styles.eventContent}>
                  <Text style={styles.eventText}>
                    {event.player}
                    {event.assist ? ` (${event.assist})` : ''}
                    {event.detail ? ` - ${event.detail}` : ''}
                  </Text>
                </View>
              )}
              <View style={styles.minuteContainer}>
                <Text style={styles.minuteText}>{formatMinute(event.minute)}</Text>
                <Text style={styles.eventIcon}>{EVENT_ICONS[event.type] || '📋'}</Text>
              </View>
              {!isHome && (
                <View style={styles.eventContent}>
                  <Text style={[styles.eventText, styles.awayText]}>
                    {event.player}
                    {event.assist ? ` (${event.assist})` : ''}
                    {event.detail ? ` - ${event.detail}` : ''}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 300,
    padding: SPACING.xs,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  team: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  score: {
    color: COLORS.odds,
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    marginHorizontal: SPACING.md,
  },
  timeline: {
    gap: SPACING.sm,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  homeEvent: {
    justifyContent: 'flex-start',
  },
  awayEvent: {
    justifyContent: 'flex-end',
  },
  minuteContainer: {
    alignItems: 'center',
    width: 50,
  },
  minuteText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
  eventIcon: {
    fontSize: 16,
  },
  eventContent: {
    flex: 1,
  },
  eventText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    textAlign: 'right',
  },
  awayText: {
    textAlign: 'left',
  },
});
