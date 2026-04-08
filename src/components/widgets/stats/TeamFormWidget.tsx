import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TeamForm } from '../../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../constants/theme';
import { FormCircle } from '../../ui/Badge';
import { formatPercentage } from '../../../utils/format';

interface Props {
  data: TeamForm;
}

export function TeamFormWidget({ data }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{data.team} - Son Form</Text>

      <View style={styles.formRow}>
        {data.results.map((result, i) => (
          <FormCircle key={i} result={result} />
        ))}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatPercentage(data.win_percentage)}</Text>
          <Text style={styles.statLabel}>Galibiyet</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{data.goals_scored}</Text>
          <Text style={styles.statLabel}>Atilan Gol</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{data.goals_conceded}</Text>
          <Text style={styles.statLabel}>Yenilen Gol</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{data.clean_sheets}</Text>
          <Text style={styles.statLabel}>Gol Yemeden</Text>
        </View>
      </View>

      {data.recent_matches.length > 0 && (
        <View style={styles.matchesList}>
          {data.recent_matches.slice(0, 5).map((match, i) => {
            const isHome = match.home_team === data.team;
            const won = isHome ? match.home_score > match.away_score : match.away_score > match.home_score;
            const draw = match.home_score === match.away_score;
            return (
              <View key={i} style={styles.matchRow}>
                <View style={[styles.resultDot, {
                  backgroundColor: draw ? COLORS.draw : won ? COLORS.win : COLORS.lossResult
                }]} />
                <Text style={styles.matchText}>
                  {match.home_team} {match.home_score}-{match.away_score} {match.away_team}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.sm,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: COLORS.cardLight,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    flex: 1,
    marginHorizontal: 2,
  },
  statValue: {
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
    textAlign: 'center',
  },
  matchesList: {
    gap: SPACING.xs,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  resultDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.sm,
  },
  matchText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
});
