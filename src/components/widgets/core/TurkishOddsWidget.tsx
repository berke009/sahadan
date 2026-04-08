import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MatchProbability, ProbabilityMarket, WatchlistItem } from '../../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../constants/theme';
import { OddsButton } from '../../ui/OddsButton';
import { useCouponStore } from '../../../stores/couponStore';

interface Props {
  data: MatchProbability;
}

export function TurkishOddsWidget({ data }: Props) {
  const { items, toggleItem } = useCouponStore();

  const matchLabel = `${data.match.home_team} vs ${data.match.away_team}`;

  const isSelected = (market: string, selectionLabel: string) => {
    return items.some(
      (i) =>
        i.match_id === data.match.id &&
        i.market === market &&
        i.selection === selectionLabel
    );
  };

  const handleTap = (market: ProbabilityMarket, optionLabel: string, value: number) => {
    const item: WatchlistItem = {
      match_id: data.match.id,
      match_label: matchLabel,
      market: market.market,
      selection: `${market.label} ${optionLabel}`,
      probability: 1 / value,
    };
    toggleItem(item);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.matchTitle}>{matchLabel}</Text>
      <Text style={styles.subtitle}>AI Olasilik Analizi</Text>
      {data.markets.map((market) => (
        <View key={market.market} style={styles.marketContainer}>
          <Text style={styles.marketLabel}>{market.label}</Text>
          <View style={styles.oddsRow}>
            {market.options.map((option) => (
              <OddsButton
                key={option.id}
                label={option.label}
                value={option.value}
                selected={isSelected(market.market, `${market.label} ${option.label}`)}
                onPress={() => handleTap(market, option.label, option.value)}
                style={styles.oddsButton}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.sm,
  },
  matchTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  marketContainer: {
    marginBottom: SPACING.md,
  },
  marketLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  oddsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  oddsButton: {
    flex: 1,
  },
});
