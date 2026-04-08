import React, { useEffect } from 'react';
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

interface ChatHeaderProps {
  expanded: boolean;
  onToggle: () => void;
}

const LIVE_MATCH = {
  home: 'MCI',
  away: 'LIV',
  homeScore: 2,
  awayScore: 1,
  minute: "67'",
};

export function ChatHeader({ expanded, onToggle }: ChatHeaderProps) {
  const insets = useSafeAreaInsets();
  const dotOpacity = useSharedValue(1);

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
          <Text style={styles.appName}>SOCCERA</Text>
          <Text style={styles.tagline}>AI Football Assistant</Text>
        </View>
      </View>

      {/* Center — live score pill */}
      <Pressable style={styles.livePill}>
        <Animated.View style={[styles.liveDot, dotStyle]} />
        <Text style={styles.liveLabel}>LIVE</Text>
        <Text style={styles.scoreText}>
          {LIVE_MATCH.home} {LIVE_MATCH.homeScore}–{LIVE_MATCH.awayScore} {LIVE_MATCH.away}
        </Text>
        <Text style={styles.minuteText}>{LIVE_MATCH.minute}</Text>
      </Pressable>

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
