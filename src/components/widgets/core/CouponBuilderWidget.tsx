import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { WatchlistItem } from '../../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../constants/theme';
import { useCouponStore } from '../../../stores/couponStore';

interface Props {
  items: WatchlistItem[];
}

export function CouponBuilderWidget({ items: initialItems }: Props) {
  const { items, removeItem, clearWatchlist } = useCouponStore();

  const displayItems = items.length > 0 ? items : initialItems;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Takip Listem</Text>
        <Text style={styles.count}>{displayItems.length} mac</Text>
      </View>

      {displayItems.map((item, i) => (
        <View key={`${item.match_id}-${item.market}-${i}`} style={styles.itemRow}>
          <View style={styles.itemInfo}>
            <Text style={styles.matchLabel}>{item.match_label}</Text>
            <Text style={styles.selectionLabel}>{item.selection}</Text>
          </View>
          <View style={styles.probabilityBadge}>
            <Text style={styles.probabilityText}>{(item.probability * 100).toFixed(0)}%</Text>
          </View>
          {items.length > 0 && (
            <TouchableOpacity
              onPress={() => removeItem(item.match_id, item.market)}
              style={styles.removeBtn}
            >
              <Text style={styles.removeBtnText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      {displayItems.length > 0 && (
        <TouchableOpacity style={styles.clearBtn} onPress={clearWatchlist}>
          <Text style={styles.clearText}>Listeyi Temizle</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  count: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardLight,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.xs,
  },
  itemInfo: {
    flex: 1,
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
  probabilityBadge: {
    backgroundColor: COLORS.accentGlow,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    marginRight: SPACING.sm,
  },
  probabilityText: {
    color: COLORS.accent,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  removeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.lossResult + '33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    color: COLORS.lossResult,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  clearBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
  },
  clearText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
});
