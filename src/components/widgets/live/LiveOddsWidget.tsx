import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LiveProbabilityEntry } from '../../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../constants/theme';
import { ArrowUpIcon, ArrowDownIcon } from '../../icons';
import { useCouponStore } from '../../../stores/couponStore';

interface Props {
  entries: LiveProbabilityEntry[];
}

export function LiveOddsWidget({ entries }: Props) {
  const { toggleItem } = useCouponStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Canli Olasilik Degisimleri</Text>
      {entries.map((entry, i) => {
        const diff = entry.current_probability.value - entry.previous_value;
        const diffText = diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2);
        const diffColor = diff > 0 ? COLORS.lossResult : diff < 0 ? COLORS.accent : COLORS.textMuted;

        return (
          <Pressable
            key={i}
            style={styles.row}
            onPress={() =>
              toggleItem({
                match_id: entry.match.id,
                match_label: `${entry.match.home_team} vs ${entry.match.away_team}`,
                market: 'LIVE',
                selection: entry.current_probability.label,
                probability: 1 / entry.current_probability.value,
              })
            }
          >
            <View style={styles.matchInfo}>
              <Text style={styles.matchLabel}>
                {entry.match.home_team} vs {entry.match.away_team}
              </Text>
              <View style={styles.diffRow}>
                {entry.direction === 'up' && <ArrowUpIcon size={10} color={diffColor} />}
                {entry.direction === 'down' && <ArrowDownIcon size={10} color={diffColor} />}
                <Text style={[styles.diff, { color: diffColor }]}> {diffText}</Text>
              </View>
            </View>
            <View style={styles.valueBadge}>
              <Text style={styles.valueText}>{entry.current_probability.value.toFixed(2)}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.sm,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.cardLight,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
  },
  matchInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  matchLabel: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  diffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  diff: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
  valueBadge: {
    backgroundColor: COLORS.accentGlow,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  valueText: {
    color: COLORS.accent,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
});
