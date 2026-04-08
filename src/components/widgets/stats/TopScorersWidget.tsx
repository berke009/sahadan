import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { TopScorer } from '../../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../constants/theme';
import { useChatStore } from '../../../stores/chatStore';

interface Props {
  scorers: TopScorer[];
}

export function TopScorersWidget({ scorers }: Props) {
  const { addWidgetAction } = useChatStore();

  return (
    <ScrollView style={styles.container} nestedScrollEnabled>
      <Text style={styles.title}>Gol Kralligi</Text>
      {scorers.map((scorer) => (
        <TouchableOpacity
          key={scorer.rank}
          style={styles.row}
          onPress={() => addWidgetAction(`${scorer.name} oyuncu analizi goster`)}
        >
          <Text style={styles.rank}>{scorer.rank}</Text>
          <View style={styles.playerInfo}>
            <Text style={styles.name}>{scorer.name}</Text>
            <Text style={styles.team}>{scorer.team}</Text>
          </View>
          <View style={styles.statsContainer}>
            <Text style={styles.goals}>{scorer.goals}</Text>
            <Text style={styles.assists}>{scorer.assists} A</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 300,
    padding: SPACING.xs,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    marginBottom: SPACING.md,
    paddingLeft: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border + '50',
  },
  rank: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    width: 28,
    textAlign: 'center',
  },
  playerInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  name: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  team: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  statsContainer: {
    alignItems: 'flex-end',
  },
  goals: {
    color: COLORS.odds,
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
  },
  assists: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
  },
});
