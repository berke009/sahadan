import React, { useState } from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';
import { COLORS, BORDER_RADIUS } from '../../constants/theme';

const SIZES = { sm: 20, md: 28, lg: 40 } as const;

interface Props {
  uri?: string;
  name?: string;
  size?: keyof typeof SIZES;
}

export function TeamLogo({ uri, name, size = 'md' }: Props) {
  const [failed, setFailed] = useState(false);
  const px = SIZES[size];

  if (!uri || failed) {
    return (
      <View style={[styles.fallback, { width: px, height: px, borderRadius: px / 2 }]}>
        <Text style={[styles.letter, { fontSize: px * 0.45 }]}>
          {(name ?? '?')[0].toUpperCase()}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={{ width: px, height: px, borderRadius: px / 2 }}
      onError={() => setFailed(true)}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: COLORS.cardLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letter: {
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
});
