import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GoalDistribution } from '../../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../constants/theme';

interface Props {
  data: GoalDistribution;
}

export function GoalDistributionWidget({ data }: Props) {
  const maxGoals = Math.max(
    ...data.intervals.map((i) => Math.max(i.scored, i.conceded)),
    1
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{data.team} - Gol Dagilimi</Text>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.accent }]} />
          <Text style={styles.legendText}>Atilan</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.lossResult }]} />
          <Text style={styles.legendText}>Yenilen</Text>
        </View>
      </View>

      {data.intervals.map((interval) => (
        <View key={interval.label} style={styles.intervalRow}>
          <Text style={styles.intervalLabel}>{interval.label}</Text>
          <View style={styles.barsContainer}>
            <View style={styles.barRow}>
              <View
                style={[
                  styles.bar,
                  styles.scoredBar,
                  { width: `${(interval.scored / maxGoals) * 100}%` },
                ]}
              />
              <Text style={styles.barValue}>{interval.scored}</Text>
            </View>
            <View style={styles.barRow}>
              <View
                style={[
                  styles.bar,
                  styles.concededBar,
                  { width: `${(interval.conceded / maxGoals) * 100}%` },
                ]}
              />
              <Text style={styles.barValue}>{interval.conceded}</Text>
            </View>
          </View>
        </View>
      ))}
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
    marginBottom: SPACING.sm,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.xs,
  },
  legendText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
  },
  intervalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  intervalLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
    width: 45,
  },
  barsContainer: {
    flex: 1,
    gap: 2,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bar: {
    height: 14,
    borderRadius: 7,
    minWidth: 6,
  },
  scoredBar: {
    backgroundColor: COLORS.accent,
  },
  concededBar: {
    backgroundColor: COLORS.lossResult,
  },
  barValue: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.xs,
    marginLeft: SPACING.xs,
  },
});
