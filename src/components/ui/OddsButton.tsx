import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZES } from '../../constants/theme';
import { useAnimatedPress } from '../../hooks/useAnimatedPress';
import { ArrowUpIcon, ArrowDownIcon } from '../icons';

interface OddsButtonProps {
  label: string;
  value: number;
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
  direction?: 'up' | 'down' | 'stable';
}

export function OddsButton({ label, value, selected, onPress, style, direction }: OddsButtonProps) {
  const { animatedStyle, onPressIn, onPressOut } = useAnimatedPress(0.94);

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        style={[styles.button, selected && styles.selected]}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
        <View style={styles.valueRow}>
          {direction === 'up' && <ArrowUpIcon size={8} color={COLORS.loss} />}
          {direction === 'down' && <ArrowDownIcon size={8} color={COLORS.accent} />}
          <Text style={[styles.value, selected && styles.selectedValue]}>
            {value.toFixed(2)}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.cardLight,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    minWidth: 68,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selected: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
    marginBottom: 2,
    fontWeight: '500',
  },
  selectedLabel: {
    color: COLORS.assistantTextDark,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  value: {
    color: COLORS.accent,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  selectedValue: {
    color: COLORS.assistantTextDark,
  },
});
