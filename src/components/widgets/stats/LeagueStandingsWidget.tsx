import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { StandingEntry } from '../../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../constants/theme';
import { FormCircle } from '../../ui/Badge';
import { useChatStore } from '../../../stores/chatStore';

interface Props {
  standings: StandingEntry[];
}

export function LeagueStandingsWidget({ standings }: Props) {
  const { addWidgetAction } = useChatStore();

  const getRowColor = (rank: number, index: number) => {
    if (rank <= 4) return COLORS.accent + '18';
    if (rank >= 17) return COLORS.lossResult + '18';
    return index % 2 === 0 ? 'transparent' : COLORS.surface + '40';
  };

  return (
    <ScrollView style={styles.container} nestedScrollEnabled>
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.rankCol]}>#</Text>
        <Text style={[styles.headerCell, styles.teamCol]}>Takim</Text>
        <Text style={[styles.headerCell, styles.statCol]}>O</Text>
        <Text style={[styles.headerCell, styles.statCol]}>G</Text>
        <Text style={[styles.headerCell, styles.statCol]}>B</Text>
        <Text style={[styles.headerCell, styles.statCol]}>M</Text>
        <Text style={[styles.headerCell, styles.statCol]}>AV</Text>
        <Text style={[styles.headerCell, styles.ptsCol]}>P</Text>
      </View>
      {standings.map((entry, index) => (
        <TouchableOpacity
          key={entry.rank}
          style={[
            styles.row,
            { backgroundColor: getRowColor(entry.rank, index) },
            entry.rank <= 4 && styles.qualificationRow,
          ]}
          onPress={() => addWidgetAction(`${entry.team} takim detaylarini goster`)}
        >
          <Text style={[styles.cell, styles.rankCol]}>{entry.rank}</Text>
          <Text style={[styles.cell, styles.teamCol]} numberOfLines={1}>{entry.team}</Text>
          <Text style={[styles.cell, styles.statCol]}>{entry.played}</Text>
          <Text style={[styles.cell, styles.statCol]}>{entry.won}</Text>
          <Text style={[styles.cell, styles.statCol]}>{entry.drawn}</Text>
          <Text style={[styles.cell, styles.statCol]}>{entry.lost}</Text>
          <Text style={[styles.cell, styles.statCol]}>{entry.goal_difference > 0 ? '+' : ''}{entry.goal_difference}</Text>
          <Text style={[styles.cell, styles.ptsCol, styles.points]}>{entry.points}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 350,
    padding: SPACING.xs,
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerCell: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border + '50',
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
  },
  qualificationRow: {
    borderLeftWidth: 2,
    borderLeftColor: COLORS.accent,
  },
  cell: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
  },
  rankCol: { width: 24, textAlign: 'center' },
  teamCol: { flex: 1, paddingHorizontal: SPACING.xs },
  statCol: { width: 32, textAlign: 'center' },
  ptsCol: { width: 30, textAlign: 'center' },
  points: { fontWeight: '700', color: COLORS.odds },
});
