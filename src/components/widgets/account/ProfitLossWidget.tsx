import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AccuracyData } from '../../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../constants/theme';
import { formatPercentage } from '../../../utils/format';

interface Props {
  data: AccuracyData;
}

export function ProfitLossWidget({ data }: Props) {
  const accuracyColor = data.accuracy_rate >= 50 ? COLORS.accent : COLORS.lossResult;

  const maxAccuracy = Math.max(...data.data_points.map((p) => p.accuracy), 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dogruluk Takibi</Text>

      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: accuracyColor }]}>
            {formatPercentage(data.accuracy_rate)}
          </Text>
          <Text style={styles.summaryLabel}>Dogruluk</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{data.total_predictions}</Text>
          <Text style={styles.summaryLabel}>Toplam</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: COLORS.accent }]}>
            {data.correct_predictions}
          </Text>
          <Text style={styles.summaryLabel}>Dogru</Text>
        </View>
      </View>

      {/* Bar chart */}
      <View style={styles.chartContainer}>
        {data.data_points.slice(-14).map((point, i) => {
          const height = (point.accuracy / 100) * 120 + 10;
          const barColor = point.accuracy >= 50 ? COLORS.accent : COLORS.lossResult;
          return (
            <View key={i} style={styles.barWrapper}>
              <View style={[styles.chartBar, { height, backgroundColor: barColor }]} />
              <Text style={styles.chartLabel}>
                {new Date(point.date).getDate()}
              </Text>
            </View>
          );
        })}
      </View>
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
  },
  summaryLabel: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 150,
    gap: 2,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.xs,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  chartBar: {
    width: '80%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 1,
    borderBottomRightRadius: 1,
    minHeight: 4,
  },
  chartLabel: {
    color: COLORS.textMuted,
    fontSize: 8,
    marginTop: 2,
  },
});
