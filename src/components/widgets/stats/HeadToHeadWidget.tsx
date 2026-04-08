import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HeadToHead } from '../../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../constants/theme';

interface Props {
  data: HeadToHead;
}

export function HeadToHeadWidget({ data }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Karsilastirma</Text>

      <View style={styles.teamsRow}>
        <Text style={styles.teamName}>{data.team_a}</Text>
        <Text style={styles.vs}>vs</Text>
        <Text style={styles.teamName}>{data.team_b}</Text>
      </View>

      <View style={styles.statsContainer}>
        <StatRow label="Galibiyet" left={data.team_a_wins} right={data.team_b_wins} />
        <StatRow label="Beraberlik" left={data.draws} right={data.draws} center />
        <StatRow label="Toplam Gol" left={data.team_a_goals} right={data.team_b_goals} />
        <StatRow label="Toplam Mac" left={data.total_matches} right={data.total_matches} center />
      </View>

      {data.recent_matches.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.recentTitle}>Son Karsilasmalar</Text>
          {data.recent_matches.slice(0, 5).map((match, i) => (
            <View key={i} style={styles.recentRow}>
              <Text style={styles.recentDate}>{new Date(match.date).toLocaleDateString('tr-TR')}</Text>
              <Text style={styles.recentScore}>
                {match.home_team} {match.home_score} - {match.away_score} {match.away_team}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function StatRow({ label, left, right, center }: { label: string; left: number; right: number; center?: boolean }) {
  return (
    <View style={styles.statRow}>
      <Text style={[styles.statValue, !center && left > right && styles.highlight]}>{left}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, !center && right > left && styles.highlight]}>{right}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.sm,
  },
  title: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  teamsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  teamName: {
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  vs: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
    marginHorizontal: SPACING.sm,
  },
  statsContainer: {
    gap: SPACING.sm,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.cardLight,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  statValue: {
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    width: 40,
    textAlign: 'center',
  },
  highlight: {
    color: COLORS.accent,
  },
  recentSection: {
    marginTop: SPACING.lg,
  },
  recentTitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.sm,
  },
  recentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border + '50',
  },
  recentDate: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.xs,
    width: 70,
  },
  recentScore: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    flex: 1,
    textAlign: 'right',
  },
});
