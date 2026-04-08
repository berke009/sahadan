import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Match, Commentary } from '../../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../constants/theme';
import { formatMinute } from '../../../utils/format';

interface Props {
  match: Match;
  commentary: Commentary[];
}

const EVENT_ICONS: Record<string, string> = {
  goal: '⚽',
  card: '🟡',
  substitution: '🔄',
  chance: '🎯',
  info: '📋',
};

export function LiveCommentaryWidget({ match, commentary }: Props) {
  return (
    <ScrollView style={styles.container} nestedScrollEnabled>
      <Text style={styles.title}>
        {match.home_team} vs {match.away_team} - Canli Yorum
      </Text>
      {commentary.map((entry, i) => (
        <View key={i} style={[styles.entry, entry.event_type === 'goal' && styles.goalEntry]}>
          <View style={styles.minuteCol}>
            <Text style={styles.minute}>{formatMinute(entry.minute)}</Text>
            {entry.event_type && (
              <Text style={styles.icon}>{EVENT_ICONS[entry.event_type] || ''}</Text>
            )}
          </View>
          <Text style={[styles.text, entry.event_type === 'goal' && styles.goalText]}>
            {entry.text}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 280,
    padding: SPACING.xs,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  entry: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border + '50',
  },
  goalEntry: {
    backgroundColor: COLORS.accent + '15',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.xs,
  },
  minuteCol: {
    width: 45,
    alignItems: 'center',
  },
  minute: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
  icon: {
    fontSize: 14,
  },
  text: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    flex: 1,
    lineHeight: 18,
  },
  goalText: {
    color: COLORS.text,
    fontWeight: '600',
  },
});
