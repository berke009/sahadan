import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PredictionPoll } from '../../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../constants/theme';
import { formatPercentage } from '../../../utils/format';

interface Props {
  poll: PredictionPoll;
}

export function MatchPredictionWidget({ poll }: Props) {
  const [userVote, setUserVote] = useState<'1' | 'X' | '2' | undefined>(poll.user_vote);

  const options = [
    { label: '1 (Ev)', key: '1' as const, percentage: poll.home_percentage },
    { label: 'X (Ber)', key: 'X' as const, percentage: poll.draw_percentage },
    { label: '2 (Dep)', key: '2' as const, percentage: poll.away_percentage },
  ];

  const handleVote = (vote: '1' | 'X' | '2') => {
    setUserVote(vote);
    // In production, this would call supabase to save the prediction
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{poll.match_label}</Text>
      <Text style={styles.subtitle}>Tahminini Yap</Text>

      <View style={styles.optionsRow}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.voteButton,
              userVote === option.key && styles.voteSelected,
            ]}
            onPress={() => handleVote(option.key)}
          >
            <Text style={[styles.voteLabel, userVote === option.key && styles.voteLabelSelected]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.resultsContainer}>
        {options.map((option) => (
          <View key={option.key} style={styles.resultRow}>
            <Text style={styles.resultLabel}>{option.label}</Text>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  { width: `${option.percentage}%` },
                  userVote === option.key && styles.barHighlight,
                ]}
              />
            </View>
            <Text style={styles.resultPercentage}>{formatPercentage(option.percentage)}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.totalVotes}>{poll.total_votes} oy</Text>
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
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  voteButton: {
    flex: 1,
    backgroundColor: COLORS.cardLight,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  voteSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent + '22',
  },
  voteLabel: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  voteLabelSelected: {
    color: COLORS.accent,
  },
  resultsContainer: {
    gap: SPACING.sm,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
    width: 55,
  },
  barContainer: {
    flex: 1,
    height: 16,
    backgroundColor: COLORS.cardLight,
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: SPACING.sm,
  },
  bar: {
    height: '100%',
    backgroundColor: COLORS.info + '66',
    borderRadius: 8,
  },
  barHighlight: {
    backgroundColor: COLORS.accent,
  },
  resultPercentage: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
  totalVotes: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});
