import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, BORDER_RADIUS, SPACING, SHADOWS, GRADIENT_COLORS } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'light' | 'gradient';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  if (variant === 'gradient') {
    return (
      <LinearGradient
        colors={[...GRADIENT_COLORS.card]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.card, styles.gradientCard, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.card, variant === 'light' && styles.light, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  light: {
    backgroundColor: COLORS.cardLight,
  },
  gradientCard: {
    borderWidth: 1,
    borderColor: COLORS.border + '80',
    ...SHADOWS.medium,
  },
});
