import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { LiveMatch } from '../../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../constants/theme';
import { Badge } from '../../ui/Badge';
import { useChatStore } from '../../../stores/chatStore';
import { formatMinute } from '../../../utils/format';

interface Props {
  matches: LiveMatch[];
}

export function LiveScoreWidget({ matches }: Props) {
  const { addWidgetAction } = useChatStore();

  const renderMatch = ({ item }: { item: LiveMatch }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => addWidgetAction(`${item.home_team} vs ${item.away_team} mac olaylarini goster`)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Badge label="CANLI" variant="live" pulsing />
        <Text style={styles.minute}>{formatMinute(item.elapsed)}</Text>
      </View>
      <View style={styles.matchRow}>
        <Text style={styles.team} numberOfLines={1}>{item.home_team}</Text>
        <Text style={styles.score}>{item.home_score}</Text>
      </View>
      <View style={styles.matchRow}>
        <Text style={styles.team} numberOfLines={1}>{item.away_team}</Text>
        <Text style={styles.score}>{item.away_score}</Text>
      </View>
      {item.events.length > 0 && (
        <Text style={styles.lastEvent}>
          {formatMinute(item.events[item.events.length - 1].minute)}{' '}
          {item.events[item.events.length - 1].type === 'goal' ? '⚽' : '📋'}{' '}
          {item.events[item.events.length - 1].player}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={matches}
      renderItem={renderMatch}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    gap: SPACING.sm,
    padding: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.cardLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.live,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  minute: {
    color: COLORS.live,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  matchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  team: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    flex: 1,
  },
  score: {
    color: COLORS.odds,
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    width: 30,
    textAlign: 'right',
  },
  lastEvent: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
});
