import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Player } from '../../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../constants/theme';
import { FormCircle } from '../../ui/Badge';
import { useChatStore } from '../../../stores/chatStore';

interface Props {
  player: Player;
}

export function PlayerAnalysisWidget({ player }: Props) {
  const { addWidgetAction } = useChatStore();

  const ratingColor =
    player.stats.rating >= 7.5 ? COLORS.win :
    player.stats.rating >= 6.5 ? COLORS.odds :
    COLORS.lossResult;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.playerInfo}>
          <Text style={styles.name}>{player.name}</Text>
          <Text style={styles.team}>{player.team} - {player.position}</Text>
          {player.injured && (
            <Text style={styles.injury}>Sakatlık: {player.injury_reason || 'Sakatlanmış'}</Text>
          )}
        </View>
        <View style={[styles.ratingCircle, { borderColor: ratingColor }]}>
          <Text style={[styles.ratingText, { color: ratingColor }]}>
            {player.stats.rating.toFixed(1)}
          </Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatItem label="Mac" value={player.stats.matches} />
        <StatItem label="Gol" value={player.stats.goals} />
        <StatItem label="Asist" value={player.stats.assists} />
        <StatItem label="Dakika" value={player.stats.minutes} />
        <StatItem label="Sari" value={player.stats.yellow_cards} />
        <StatItem label="Kirmizi" value={player.stats.red_cards} />
        {player.stats.shots_on_target !== undefined && (
          <StatItem label="Isabetli Sut" value={player.stats.shots_on_target} />
        )}
        {player.stats.pass_accuracy !== undefined && (
          <StatItem label="Pas %" value={`${player.stats.pass_accuracy}%`} />
        )}
      </View>

      {player.form.length > 0 && (
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Son Form</Text>
          <View style={styles.formRow}>
            {player.form.map((result, i) => (
              <FormCircle key={i} result={result} />
            ))}
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.betButton}
        onPress={() => addWidgetAction(`${player.name} detayli istatistiklerini goster`)}
      >
        <Text style={styles.betButtonText}>Detayli Analiz</Text>
      </TouchableOpacity>
    </View>
  );
}

function StatItem({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  playerInfo: {
    flex: 1,
  },
  name: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  team: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    marginTop: 2,
  },
  injury: {
    color: COLORS.lossResult,
    fontSize: FONT_SIZES.xs,
    marginTop: 4,
  },
  ratingCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statItem: {
    backgroundColor: COLORS.cardLight,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    minWidth: 65,
    alignItems: 'center',
  },
  statValue: {
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  formSection: {
    marginBottom: SPACING.md,
  },
  formLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.xs,
  },
  formRow: {
    flexDirection: 'row',
  },
  betButton: {
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  betButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
});
