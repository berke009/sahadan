import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { TopScorer } from '../../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../constants/theme';
import { useChatStore } from '../../../stores/chatStore';

interface Props {
  scorers: TopScorer[];
}

const RANK_COLORS: Record<number, string> = {
  1: COLORS.gold,
  2: COLORS.silver,
  3: COLORS.bronze,
};

export function TopScorersWidget({ scorers }: Props) {
  const { addWidgetAction } = useChatStore();
  const maxGoals = Math.max(...scorers.map(s => s.goals), 1);

  return (
    <ScrollView style={styles.container} nestedScrollEnabled>
      <Text style={styles.title}>Gol Kralligi</Text>
      {scorers.map((scorer) => {
        const rankColor = RANK_COLORS[scorer.rank];
        const barWidth = (scorer.goals / maxGoals) * 100;

        return (
          <TouchableOpacity
            key={scorer.rank}
            style={styles.row}
            onPress={() => addWidgetAction(`${scorer.name} oyuncu analizi goster`)}
            activeOpacity={0.6}
          >
            {/* Rank */}
            <View style={[styles.rankBadge, rankColor ? { backgroundColor: rankColor + '20', borderColor: rankColor + '40' } : undefined]}>
              <Text style={[styles.rankText, rankColor ? { color: rankColor } : undefined]}>{scorer.rank}</Text>
            </View>

            {/* Photo */}
            {scorer.photo ? (
              <Image source={{ uri: scorer.photo }} style={styles.photo} />
            ) : (
              <View style={[styles.photo, styles.photoFallback]}>
                <Text style={styles.photoLetter}>{scorer.name[0]}</Text>
              </View>
            )}

            {/* Info */}
            <View style={styles.playerInfo}>
              <Text style={styles.name} numberOfLines={1}>{scorer.name}</Text>
              <Text style={styles.team}>{scorer.team}</Text>
              {/* Goal bar */}
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${barWidth}%` }]} />
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsCol}>
              <Text style={styles.goals}>{scorer.goals}</Text>
              <Text style={styles.assists}>{scorer.assists}A | {scorer.matches}M</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 380,
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
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border + '30',
    gap: SPACING.sm,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rankText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
  },
  photo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.cardLight,
  },
  photoFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoLetter: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  playerInfo: {
    flex: 1,
  },
  name: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  team: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
    marginTop: 1,
  },
  barTrack: {
    height: 3,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: 3,
    backgroundColor: COLORS.accent,
    borderRadius: 2,
  },
  statsCol: {
    alignItems: 'flex-end',
  },
  goals: {
    color: COLORS.accent,
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
  },
  assists: {
    color: COLORS.textMuted,
    fontSize: 9,
    marginTop: 1,
  },
});
