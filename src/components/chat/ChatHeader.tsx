import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';
import { BallIcon, MinimizeIcon, ExpandIcon } from '../icons';
import { getLiveFixtures, ApiFixture } from '../../services/footballApi';

interface ChatHeaderProps {
  expanded: boolean;
  onToggle: () => void;
  onLiveTap?: () => void;
}

interface LiveMatchInfo {
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  minute: string;
}

function abbreviate(name: string): string {
  // Short form: first 3 chars uppercase
  return name.length > 3 ? name.slice(0, 3).toUpperCase() : name.toUpperCase();
}

export function ChatHeader({ expanded, onToggle, onLiveTap }: ChatHeaderProps) {
  const insets = useSafeAreaInsets();
  const dotOpacity = useSharedValue(1);
  const [liveMatch, setLiveMatch] = useState<LiveMatchInfo | null>(null);

  // Fetch live matches on mount and every 60s
  const fetchLive = useCallback(async () => {
    try {
      const fixtures = await getLiveFixtures();
      if (fixtures.length > 0) {
        const f = fixtures[0];
        setLiveMatch({
          home: abbreviate(f.teams.home.name),
          away: abbreviate(f.teams.away.name),
          homeScore: f.goals.home ?? 0,
          awayScore: f.goals.away ?? 0,
          minute: `${f.fixture.status.elapsed ?? 0}'`,
        });
      } else {
        setLiveMatch(null);
      }
    } catch {
      setLiveMatch(null);
    }
  }, []);

  useEffect(() => {
    fetchLive();
    const interval = setInterval(fetchLive, 60000);
    return () => clearInterval(interval);
  }, [fetchLive]);

  useEffect(() => {
    dotOpacity.value = withRepeat(
      withSequence(
        withTiming(0.15, { duration: 700 }),
        withTiming(1, { duration: 700 })
      ),
      -1,
      true
    );
  }, []);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top + 6 }]}>
      {/* Left — branding */}
      <View style={styles.left}>
        <BallIcon size={28} color={COLORS.accent} />
        <View style={styles.titleGroup}>
          <Text style={styles.appName}>SAHADAN</Text>
          <Text style={styles.tagline}>Futbol AI Asistani</Text>
        </View>
      </View>

      {/* Center — live score pill (only when a match is live) */}
      {liveMatch && (
        <Pressable style={styles.livePill} onPress={onLiveTap}>
          <Animated.View style={[styles.liveDot, dotStyle]} />
          <Text style={styles.liveLabel}>CANLI</Text>
          <Text style={styles.scoreText}>
            {liveMatch.home} {liveMatch.homeScore}–{liveMatch.awayScore} {liveMatch.away}
          </Text>
          <Text style={styles.minuteText}>{liveMatch.minute}</Text>
        </Pressable>
      )}

      {/* Right — toggle */}
      <Pressable style={styles.toggleBtn} onPress={onToggle} hitSlop={10}>
        {expanded ? (
          <MinimizeIcon size={16} color={COLORS.textSecondary} />
        ) : (
          <ExpandIcon size={16} color={COLORS.textSecondary} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  titleGroup: {
    gap: 1,
  },
  appName: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  tagline: {
    color: COLORS.textSecondary,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderBright,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.live,
  },
  liveLabel: {
    color: COLORS.live,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  scoreText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  minuteText: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '600',
  },
  toggleBtn: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: SPACING.sm,
  },
});
