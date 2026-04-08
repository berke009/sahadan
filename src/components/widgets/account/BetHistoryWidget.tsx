import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { PredictionHistoryEntry } from '../../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../constants/theme';
import { formatDate } from '../../../utils/format';
import { Badge } from '../../ui/Badge';

interface Props {
  history: PredictionHistoryEntry[];
}

export function BetHistoryWidget({ history }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const statusVariant = (status: string): 'win' | 'loss' | 'pending' => {
    switch (status) {
      case 'correct': return 'win';
      case 'incorrect': return 'loss';
      default: return 'pending';
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'correct': return 'Dogru';
      case 'incorrect': return 'Yanlis';
      default: return 'Bekliyor';
    }
  };

  return (
    <ScrollView style={styles.container} nestedScrollEnabled>
      <Text style={styles.title}>Tahmin Gecmisi</Text>
      {history.map((entry) => (
        <TouchableOpacity
          key={entry.id}
          style={[styles.card, { borderLeftColor: COLORS[statusVariant(entry.status)] }]}
          onPress={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.date}>{formatDate(entry.created_at)}</Text>
              <Text style={styles.info}>{entry.selections.length} tahmin</Text>
            </View>
            <Badge label={statusLabel(entry.status)} variant={statusVariant(entry.status)} />
          </View>

          {expandedId === entry.id && (
            <View style={styles.selectionsContainer}>
              {entry.selections.map((sel, i) => (
                <View key={i} style={styles.selectionRow}>
                  <Text style={styles.selectionMatch}>{sel.match_label}</Text>
                  <Text style={styles.selectionDetail}>
                    {sel.selection} — {(sel.probability * 100).toFixed(0)}% olasilik
                  </Text>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 350,
    padding: SPACING.xs,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.cardLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  date: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.xs,
  },
  info: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    marginTop: 2,
  },
  selectionsContainer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  selectionRow: {
    paddingVertical: SPACING.xs,
  },
  selectionMatch: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
  },
  selectionDetail: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
    marginTop: 1,
  },
});
