import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { LiveMatch } from '../../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../constants/theme';
import { Badge } from '../../ui/Badge';
import { TeamLogo } from '../../ui/TeamLogo';
import { useChatStore } from '../../../stores/chatStore';
import { formatMinute } from '../../../utils/format';

interface Props {
  matches: LiveMatch[];
}

const EVENT_ICONS: Record<string, string> = {
  goal: '\u26BD',
  yellow_card: '\uD83D\uDFE1',
  red_card: '\uD83D\uDD34',
  substitution: '\uD83D\uDD04',
  var: '\uD83D\uDCFA',
};

export function LiveScoreWidget({ matches }: Props) {
  const { addWidgetAction } = useChatStore();

  const renderMatch = ({ item }: { item: LiveMatch }) => {
    const lastEvents = item.events.slice(-3);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => addWidgetAction(`${item.home_team} vs ${item.away_team} mac olaylarini goster`)}
        activeOpacity={0.7}
      >
        {/* Header: badge + minute */}
        <View style={styles.header}>
          <Badge label="CANLI" variant="live" pulsing />
          <Text style={styles.minute}>{formatMinute(item.elapsed)}</Text>
        </View>

        {/* Progress bar (0-90 min) */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.min((item.elapsed / 90) * 100, 100)}%` }]} />
        </View>

        {/* Teams + Score */}
        <View style={styles.matchBody}>
          {/* Home */}
          <View style={styles.teamRow}>
            <TeamLogo uri={item.home_logo} name={item.home_team} size="md" />
            <Text style={styles.teamName} numberOfLines={1}>{item.home_team}</Text>
            <Text style={styles.score}>{item.home_score}</Text>
          </View>
          {/* Away */}
          <View style={styles.teamRow}>
            <TeamLogo uri={item.away_logo} name={item.away_team} size="md" />
            <Text style={styles.teamName} numberOfLines={1}>{item.away_team}</Text>
            <Text style={styles.score}>{item.away_score}</Text>
          </View>
        </View>

        {/* Recent events */}
        {lastEvents.length > 0 && (
          <View style={styles.eventsContainer}>
            {lastEvents.map((e, i) => (
              <View key={i} style={styles.eventRow}>
                <Text style={styles.eventMinute}>{formatMinute(e.minute)}</Text>
                <Text style={styles.eventIcon}>{EVENT_ICONS[e.type] ?? '\u2139\uFE0F'}</Text>
                <Text style={styles.eventText} numberOfLines={1}>{e.player}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Action */}
        <TouchableOpacity
          style={styles.detailBtn}
          onPress={() => addWidgetAction(`${item.home_team} vs ${item.away_team} mac olaylarini goster`)}
        >
          <Text style={styles.detailBtnText}>Mac Detayi</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

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
    backgroundColor: COLORS.glass,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  minute: {
    color: COLORS.live,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  progressTrack: {
    height: 2,
    backgroundColor: COLORS.border,
    borderRadius: 1,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: 2,
    backgroundColor: COLORS.live,
    borderRadius: 1,
  },
  matchBody: {
    gap: 6,
    marginBottom: SPACING.sm,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  teamName: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    flex: 1,
  },
  score: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    width: 32,
    textAlign: 'right',
  },
  eventsContainer: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    gap: 4,
    marginBottom: SPACING.sm,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventMinute: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    width: 28,
  },
  eventIcon: {
    fontSize: 12,
  },
  eventText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
    flex: 1,
  },
  detailBtn: {
    borderWidth: 1,
    borderColor: COLORS.glassAccentBorder,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: COLORS.glassAccent,
  },
  detailBtnText: {
    color: COLORS.accent,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
});
