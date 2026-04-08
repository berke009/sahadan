import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { StandingEntry } from '../../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../constants/theme';
import { FormCircle } from '../../ui/Badge';
import { TeamLogo } from '../../ui/TeamLogo';
import { useChatStore } from '../../../stores/chatStore';

interface Props {
  standings: StandingEntry[];
}

export function LeagueStandingsWidget({ standings }: Props) {
  const { addWidgetAction } = useChatStore();

  const getRowStyle = (rank: number) => {
    if (rank <= 4) return styles.qualRow;
    if (rank >= standings.length - 2) return styles.relegationRow;
    return undefined;
  };

  const getZoneIndicator = (rank: number) => {
    if (rank <= 4) return styles.zoneGreen;
    if (rank >= standings.length - 2) return styles.zoneRed;
    return styles.zoneNone;
  };

  return (
    <ScrollView style={styles.container} nestedScrollEnabled>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.rankCol]}>#</Text>
        <View style={styles.teamHeaderCol}>
          <Text style={styles.headerCell}>Takim</Text>
        </View>
        <Text style={[styles.headerCell, styles.statCol]}>O</Text>
        <Text style={[styles.headerCell, styles.statCol]}>G</Text>
        <Text style={[styles.headerCell, styles.statCol]}>B</Text>
        <Text style={[styles.headerCell, styles.statCol]}>M</Text>
        <Text style={[styles.headerCell, styles.gdCol]}>AV</Text>
        <Text style={[styles.headerCell, styles.ptsCol]}>P</Text>
        <View style={styles.formCol}>
          <Text style={styles.headerCell}>Form</Text>
        </View>
      </View>

      {/* Rows */}
      {standings.map((entry) => (
        <TouchableOpacity
          key={entry.rank}
          style={[styles.row, getRowStyle(entry.rank)]}
          onPress={() => addWidgetAction(`${entry.team} takim detaylarini goster`)}
          activeOpacity={0.6}
        >
          <View style={[styles.zoneBar, getZoneIndicator(entry.rank)]} />
          <Text style={[styles.cell, styles.rankCol, styles.rankText]}>{entry.rank}</Text>
          <View style={styles.teamCell}>
            <TeamLogo uri={entry.team_logo} name={entry.team} size="sm" />
            <Text style={styles.teamName} numberOfLines={1}>{entry.team}</Text>
          </View>
          <Text style={[styles.cell, styles.statCol]}>{entry.played}</Text>
          <Text style={[styles.cell, styles.statCol]}>{entry.won}</Text>
          <Text style={[styles.cell, styles.statCol]}>{entry.drawn}</Text>
          <Text style={[styles.cell, styles.statCol]}>{entry.lost}</Text>
          <Text style={[styles.cell, styles.gdCol, entry.goal_difference > 0 && styles.gdPositive, entry.goal_difference < 0 && styles.gdNegative]}>
            {entry.goal_difference > 0 ? '+' : ''}{entry.goal_difference}
          </Text>
          <Text style={[styles.cell, styles.ptsCol, styles.points]}>{entry.points}</Text>
          <View style={styles.formCol}>
            {entry.form.map((r, i) => (
              <FormCircle key={i} result={r} />
            ))}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 420,
    padding: SPACING.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 2,
  },
  headerCell: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border + '30',
    borderRadius: BORDER_RADIUS.sm,
  },
  qualRow: {
    backgroundColor: COLORS.glassAccent,
  },
  relegationRow: {
    backgroundColor: 'rgba(255, 69, 58, 0.06)',
  },
  zoneBar: {
    width: 3,
    height: '80%',
    borderRadius: 2,
    marginRight: 2,
  },
  zoneGreen: {
    backgroundColor: COLORS.accent,
  },
  zoneRed: {
    backgroundColor: COLORS.lossResult,
  },
  zoneNone: {
    backgroundColor: 'transparent',
  },
  rankCol: { width: 22, textAlign: 'center' },
  rankText: { fontWeight: '700', color: COLORS.textSecondary },
  teamHeaderCol: { flex: 1, paddingLeft: SPACING.xs },
  teamCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 4,
  },
  teamName: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    flex: 1,
  },
  cell: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xs,
  },
  statCol: { width: 26, textAlign: 'center' },
  gdCol: { width: 30, textAlign: 'center' },
  gdPositive: { color: COLORS.accent },
  gdNegative: { color: COLORS.lossResult },
  ptsCol: { width: 28, textAlign: 'center' },
  points: { fontWeight: '800', color: COLORS.accent, fontSize: FONT_SIZES.sm },
  formCol: {
    flexDirection: 'row',
    width: 60,
    justifyContent: 'flex-end',
    gap: 2,
  },
});
