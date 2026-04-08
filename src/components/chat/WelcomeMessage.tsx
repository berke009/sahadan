import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';
import { BallIcon } from '../icons';

const SUGGESTIONS = [
  { label: 'Bugun mac var mi?', icon: '📅' },
  { label: 'Canli skorlar', icon: '🔴' },
  { label: 'Super Lig puan durumu', icon: '📊' },
  { label: 'Gol kralligi', icon: '👑' },
  { label: 'Galatasaray formu', icon: '🦁' },
  { label: 'GS vs FB', icon: '🏟' },
];

interface WelcomeMessageProps {
  onSend: (text: string) => void;
}

export function WelcomeMessage({ onSend }: WelcomeMessageProps) {
  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.logoSection}>
        <BallIcon size={48} color={COLORS.accent} />
        <Text style={styles.title}>SAHADAN</Text>
        <Text style={styles.subtitle}>
          Merhaba! Ben Sahadan AI.{'\n'}Futbol hakkinda her seyi sorabilirsin.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.grid}>
        {SUGGESTIONS.map((s, i) => (
          <Animated.View key={s.label} entering={FadeInDown.delay(400 + i * 80).duration(400)}>
            <Pressable
              style={styles.card}
              onPress={() => onSend(s.label)}
            >
              <Text style={styles.cardIcon}>{s.icon}</Text>
              <Text style={styles.cardLabel}>{s.label}</Text>
            </Pressable>
          </Animated.View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: SPACING.md,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: SPACING.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
    maxWidth: 380,
  },
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderBright,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    minWidth: 160,
  },
  cardIcon: {
    fontSize: 18,
  },
  cardLabel: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
});
