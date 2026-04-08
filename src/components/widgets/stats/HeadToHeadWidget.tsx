import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HeadToHead } from '../../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../constants/theme';
import { Badge } from '../../ui/Badge';

interface Props {
  data: HeadToHead;
}

function ComparisonBar({ left, right, label }: { left: number; right: number; label: string }) {
  const total = left + right || 1;
  const leftPct = (left / total) * 100;
  const rightPct = (right / total) * 100;

  return (
    <View style={barStyles.container}>
      <Text style={[barStyles.value, left >= right && barStyles.highlight]}>{left}</Text>
      <View style={barStyles.barContainer}>
        <View style={barStyles.barTrack}>
          <View style={[barStyles.barLeft, { width: `${leftPct}%` }]} />
          <View style={[barStyles.barRight, { width: `${rightPct}%` }]} />
        </View>
        <Text style={barStyles.label}>{label}</Text>
      </View>
      <Text style={[barStyles.value, right >= left && barStyles.highlight]}>{right}</Text>
    </View>
  );
}

export function HeadToHeadWidget({ data }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>Karsilastirma</Text>

      {/* Teams header */}
      <View style={styles.teamsRow}>
        <View style={styles.teamCol}>
          <Text style={styles.teamName} numberOfLines={1}>{data.team_a}</Text>
        </View>
        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
          <Text style={styles.totalMatches}>{data.total_matches} mac</Text>
        </View>
        <View style={styles.teamCol}>
          <Text style={styles.teamName} numberOfLines={1}>{data.team_b}</Text>
        </View>
      </View>

      {/* Comparison bars */}
      <View style={styles.statsContainer}>
        <ComparisonBar left={data.team_a_wins} right={data.team_b_wins} label="Galibiyet" />
        <ComparisonBar left={data.draws} right={data.draws} label="Beraberlik" />
        <ComparisonBar left={data.team_a_goals} right={data.team_b_goals} label="Toplam Gol" />
      </View>

      {/* Recent matches */}
      {data.recent_matches.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.recentTitle}>Son Karsilasmalar</Text>
          {data.recent_matches.slice(0, 5).map((match, i) => {
            const homeWin = match.home_score > match.away_score;
            const draw = match.home_score === match.away_score;
            return (
              <View key={i} style={styles.recentRow}>
                <Text style={styles.recentDate}>
                  {new Date(match.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                </Text>
                <View style={styles.recentMatch}>
                  <Text style={[styles.recentTeam, homeWin && styles.winnerText]} numberOfLines={1}>
                    {match.home_team}
                  </Text>
                  <View style={styles.recentScoreBadge}>
                    <Text style={styles.recentScoreText}>
                      {match.home_score} - {match.away_score}
                    </Text>
                  </View>
                  <Text style={[styles.recentTeam, !homeWin && !draw && styles.winnerText]} numberOfLines={1}>
                    {match.away_team}
                  </Text>
                </View>
                <Badge
                  label={draw ? 'B' : homeWin ? (match.home_team === data.team_a ? 'G' : 'M') : (match.away_team === data.team_a ? 'G' : 'M')}
                  variant={draw ? 'draw' : (homeWin ? (match.home_team === data.team_a ? 'win' : 'loss') : (match.away_team === data.team_a ? 'win' : 'loss'))}
                />
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const barStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  value: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    width: 28,
    textAlign: 'center',
  },
  highlight: {
    color: COLORS.accent,
  },
  barContainer: {
    flex: 1,
    gap: 3,
  },
  barTrack: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: COLORS.border,
  },
  barLeft: {
    backgroundColor: COLORS.accent,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  barRight: {
    backgroundColor: COLORS.lossResult + '80',
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 9,
    textAlign: 'center',
  },
});

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  teamCol: {
    flex: 1,
    alignItems: 'center',
  },
  teamName: {
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    textAlign: 'center',
  },
  vsContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  vsText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    letterSpacing: 2,
  },
  totalMatches: {
    color: COLORS.textMuted,
    fontSize: 9,
    marginTop: 2,
  },
  statsContainer: {
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  recentSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  recentTitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border + '30',
    gap: SPACING.sm,
  },
  recentDate: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.xs,
    width: 52,
  },
  recentMatch: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recentTeam: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
    flex: 1,
  },
  winnerText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  recentScoreBadge: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  recentScoreText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
});
