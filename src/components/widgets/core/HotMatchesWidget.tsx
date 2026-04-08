import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Match } from '../../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../constants/theme';
import { formatTime } from '../../../utils/format';
import { useChatStore } from '../../../stores/chatStore';
import { Badge } from '../../ui/Badge';
import { TeamLogo } from '../../ui/TeamLogo';

interface Props {
  matches: Match[];
}

export function HotMatchesWidget({ matches }: Props) {
  const { addWidgetAction } = useChatStore();

  const handleMatchTap = (match: Match) => {
    addWidgetAction(`${match.home_team} vs ${match.away_team} macinin oranlarini goster`);
  };

  const renderMatch = ({ item }: { item: Match }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleMatchTap(item)} activeOpacity={0.7}>
      {/* League pill */}
      <View style={styles.leaguePill}>
        <Text style={styles.leagueText}>{item.league}</Text>
        {item.status === 'live' && <View style={styles.liveDot} />}
      </View>

      {/* Teams + Score */}
      <View style={styles.matchContent}>
        {/* Home */}
        <View style={styles.teamCol}>
          <TeamLogo uri={item.home_logo} name={item.home_team} size="md" />
          <Text style={styles.teamName} numberOfLines={2}>{item.home_team}</Text>
        </View>

        {/* Score / Time */}
        <View style={styles.centerCol}>
          {item.status === 'live' || item.status === 'finished' ? (
            <>
              <Text style={styles.score}>{item.home_score} - {item.away_score}</Text>
              {item.status === 'live' && (
                <Badge label={`${item.elapsed}'`} variant="live" pulsing />
              )}
              {item.status === 'finished' && (
                <Text style={styles.statusFinished}>BM</Text>
              )}
            </>
          ) : (
            <>
              <Text style={styles.time}>{formatTime(item.kickoff)}</Text>
              <Text style={styles.statusUpcoming}>Baslamamis</Text>
            </>
          )}
        </View>

        {/* Away */}
        <View style={styles.teamCol}>
          <TeamLogo uri={item.away_logo} name={item.away_team} size="md" />
          <Text style={styles.teamName} numberOfLines={2}>{item.away_team}</Text>
        </View>
      </View>

      {/* Action button */}
      <TouchableOpacity style={styles.detailBtn} onPress={() => handleMatchTap(item)}>
        <Text style={styles.detailBtnText}>Detay</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <FlatList
      horizontal
      data={matches}
      renderItem={renderMatch}
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      snapToInterval={232}
      decelerationRate="fast"
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.glass,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginRight: SPACING.md,
    width: 220,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  leaguePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 3,
    marginBottom: SPACING.md,
    gap: 6,
  },
  leagueText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.live,
  },
  matchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  teamCol: {
    alignItems: 'center',
    width: 60,
    gap: 6,
  },
  teamName: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
  centerCol: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  score: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    letterSpacing: 2,
  },
  time: {
    color: COLORS.accent,
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  statusFinished: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  statusUpcoming: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.xs,
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
