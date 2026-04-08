import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Match } from '../../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../constants/theme';
import { formatTime } from '../../../utils/format';
import { useChatStore } from '../../../stores/chatStore';
import { Badge } from '../../ui/Badge';

interface Props {
  matches: Match[];
}

export function HotMatchesWidget({ matches }: Props) {
  const { addWidgetAction } = useChatStore();

  const handleMatchTap = (match: Match) => {
    addWidgetAction(`${match.home_team} vs ${match.away_team} macinin oranlarini goster`);
  };

  const renderMatch = ({ item }: { item: Match }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleMatchTap(item)} activeOpacity={0.7}>
      {item.status === 'live' && <Badge label="CANLI" variant="live" style={styles.badge} />}
      <Text style={styles.league}>{item.league}</Text>
      <View style={styles.teams}>
        <Text style={styles.team} numberOfLines={1}>{item.home_team}</Text>
        <View style={styles.scoreContainer}>
          {item.status === 'live' || item.status === 'finished' ? (
            <Text style={styles.score}>{item.home_score} - {item.away_score}</Text>
          ) : (
            <Text style={styles.time}>{formatTime(item.kickoff)}</Text>
          )}
        </View>
        <Text style={styles.team} numberOfLines={1}>{item.away_team}</Text>
      </View>
      <Text style={styles.tapHint}>Oranlari gor →</Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      horizontal
      data={matches}
      renderItem={renderMatch}
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      snapToInterval={220}
      decelerationRate="fast"
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingVertical: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.cardLight,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginRight: SPACING.md,
    width: 200,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badge: {
    marginBottom: SPACING.xs,
  },
  league: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
    marginBottom: SPACING.sm,
  },
  teams: {
    alignItems: 'center',
  },
  team: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    textAlign: 'center',
  },
  scoreContainer: {
    marginVertical: SPACING.sm,
  },
  score: {
    color: COLORS.odds,
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
  },
  time: {
    color: COLORS.accent,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  tapHint: {
    color: COLORS.info,
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});
