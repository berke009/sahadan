import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AnalystProfile } from '../../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../constants/theme';
import { formatPercentage } from '../../../utils/format';

interface Props {
  profile: AnalystProfile;
}

export function BalanceSummaryWidget({ profile }: Props) {
  return (
    <View style={styles.container}>
      {/* Level & XP card */}
      <View style={styles.levelCard}>
        <Text style={styles.levelLabel}>{profile.level}</Text>
        <Text style={styles.xpAmount}>{profile.xp.toLocaleString()} XP</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profile.total_predictions}</Text>
          <Text style={styles.statLabel}>Toplam Tahmin</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.accent }]}>{profile.correct_predictions}</Text>
          <Text style={styles.statLabel}>Dogru</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.lossResult }]}>{profile.incorrect_predictions}</Text>
          <Text style={styles.statLabel}>Yanlis</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatPercentage(profile.accuracy_rate)}</Text>
          <Text style={styles.statLabel}>Dogruluk</Text>
        </View>
      </View>

      {/* Streak */}
      <View style={styles.streakRow}>
        <View style={styles.streakItem}>
          <Text style={styles.streakIcon}>🔥</Text>
          <Text style={styles.streakValue}>{profile.streak}</Text>
          <Text style={styles.streakLabel}>Seri</Text>
        </View>
        <View style={styles.streakItem}>
          <Text style={styles.streakIcon}>⭐</Text>
          <Text style={styles.streakValue}>{profile.best_streak}</Text>
          <Text style={styles.streakLabel}>En Iyi Seri</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.sm,
  },
  levelCard: {
    backgroundColor: COLORS.accentGlow,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.accent + '30',
  },
  levelLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    letterSpacing: 1,
  },
  xpAmount: {
    color: COLORS.accent,
    fontSize: 32,
    fontWeight: '800',
    marginTop: SPACING.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  statItem: {
    backgroundColor: COLORS.cardLight,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    width: '48%',
    flexGrow: 1,
    alignItems: 'center',
  },
  statValue: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  streakRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  streakItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.cardLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  streakIcon: {
    fontSize: 18,
  },
  streakValue: {
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  streakLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
  },
});
