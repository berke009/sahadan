import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { TrendingPrediction } from '../../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../constants/theme';
import { useCouponStore } from '../../../stores/couponStore';
import { formatPercentage } from '../../../utils/format';

interface Props {
  predictions: TrendingPrediction[];
}

export function PopularBetsWidget({ predictions }: Props) {
  const { toggleItem, items } = useCouponStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trend Tahminler</Text>
      {predictions.map((prediction) => {
        const isTracked = items.some(
          (i) => i.match_id === prediction.id && i.selection === prediction.selection
        );
        return (
          <View key={prediction.id} style={styles.row}>
            <View style={styles.info}>
              <Text style={styles.matchLabel}>{prediction.match_label}</Text>
              <Text style={styles.selectionLabel}>{prediction.market} — {prediction.selection}</Text>
              <View style={styles.popularityRow}>
                <View style={[styles.popularityBar, { width: `${prediction.pick_percentage}%` }]} />
                <Text style={styles.popularityText}>
                  {formatPercentage(prediction.pick_percentage)} ({prediction.total_picks} kisi)
                </Text>
              </View>
            </View>
            <Pressable
              style={[styles.trackBtn, isTracked && styles.trackBtnActive]}
              onPress={() =>
                toggleItem({
                  match_id: prediction.id,
                  match_label: prediction.match_label,
                  market: prediction.market,
                  selection: prediction.selection,
                  probability: prediction.probability,
                })
              }
            >
              <Text style={[styles.trackBtnText, isTracked && styles.trackBtnTextActive]}>
                {isTracked ? '✓' : '+'}
              </Text>
            </Pressable>
          </View>
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
    backgroundColor: COLORS.cardLight,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  info: {
    flex: 1,
    marginRight: SPACING.md,
  },
  matchLabel: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  selectionLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  popularityRow: {
    marginTop: SPACING.xs,
  },
  popularityBar: {
    height: 4,
    backgroundColor: COLORS.accent,
    borderRadius: 2,
    marginBottom: 2,
  },
  popularityText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.xs,
  },
  trackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.borderBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackBtnActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  trackBtnText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  trackBtnTextActive: {
    color: COLORS.assistantTextDark,
  },
});
