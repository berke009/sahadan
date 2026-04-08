import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZES } from '../../constants/theme';

type BadgeVariant = 'win' | 'draw' | 'loss' | 'live' | 'pending' | 'info';

interface BadgeProps {
  label: string;
  variant: BadgeVariant;
  style?: ViewStyle;
  pulsing?: boolean;
}

const VARIANT_COLORS: Record<BadgeVariant, string> = {
  win: COLORS.win,
  draw: COLORS.draw,
  loss: COLORS.lossResult,
  live: COLORS.live,
  pending: COLORS.pending,
  info: COLORS.info,
};

export function Badge({ label, variant, style, pulsing }: BadgeProps) {
  const color = VARIANT_COLORS[variant];
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (pulsing) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
    }
  }, [pulsing]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const badgeContent = (
    <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color }, style]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );

  if (pulsing) {
    return <Animated.View style={animatedStyle}>{badgeContent}</Animated.View>;
  }

  return badgeContent;
}

export function FormCircle({ result }: { result: 'W' | 'D' | 'L' }) {
  const colors = { W: COLORS.win, D: COLORS.draw, L: COLORS.lossResult };
  return (
    <View style={[styles.circle, { backgroundColor: colors[result] }]}>
      <Text style={styles.circleText}>{result === 'W' ? 'G' : result === 'D' ? 'B' : 'M'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  circleText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
});
