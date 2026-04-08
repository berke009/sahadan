import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TeamForm } from '../../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../constants/theme';
import { FormCircle } from '../../ui/Badge';
import { TeamLogo } from '../../ui/TeamLogo';
import { formatPercentage } from '../../../utils/format';
import { useChatStore } from '../../../stores/chatStore';

interface Props {
  data: TeamForm;
}

function StatBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}

export function TeamFormWidget({ data }: Props) {
  const { addWidgetAction } = useChatStore();
  const totalGoals = Math.max(data.goals_scored, data.goals_conceded, 1);

  return (
    <View style={styles.container}>
      {/* Header with logo */}
      <View style={styles.header}>
        <TeamLogo uri={data.team_logo} name={data.team} size="lg" />
        <View style={styles.headerText}>
          <Text style={styles.title}>{data.team}</Text>
          <Text style={styles.subtitle}>Son Form</Text>
        </View>
      </View>

      {/* Form circles */}
      <View style={styles.formSection}>
        {data.results.map((result, i) => (
          <View key={i} style={styles.formItem}>
            <FormCircle result={result} />
          </View>
        ))}
      </View>

      {/* Stats with bars */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: COLORS.accent }]}>{formatPercentage(data.win_percentage)}</Text>
          <StatBar value={data.win_percentage} max={100} color={COLORS.accent} />
          <Text style={styles.statLabel}>Galibiyet</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{data.goals_scored}</Text>
          <StatBar value={data.goals_scored} max={totalGoals} color={COLORS.accent} />
          <Text style={styles.statLabel}>Atilan Gol</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{data.goals_conceded}</Text>
          <StatBar value={data.goals_conceded} max={totalGoals} color={COLORS.lossResult} />
          <Text style={styles.statLabel}>Yenilen Gol</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{data.clean_sheets}</Text>
          <StatBar value={data.clean_sheets} max={20} color={COLORS.info} />
          <Text style={styles.statLabel}>Gol Yemeden</Text>
        </View>
      </View>

      {/* Recent matches */}
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

      {/* Action */}
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={() => addWidgetAction(`${data.team} son maclari ve istatistikleri`)}
      >
        <Text style={styles.actionBtnText}>Tum Istatistikler</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  formSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  formItem: {
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.glass,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.sm,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 9,
    textAlign: 'center',
  },
  barTrack: {
    width: '100%',
    height: 3,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: 3,
    borderRadius: 2,
  },
  matchesList: {
    gap: SPACING.xs,
    marginBottom: SPACING.md,
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
  actionBtn: {
    borderWidth: 1,
    borderColor: COLORS.glassAccentBorder,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: COLORS.glassAccent,
  },
  actionBtnText: {
    color: COLORS.accent,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
});
