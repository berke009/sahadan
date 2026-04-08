import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';
import { useAnimatedPress } from '../../hooks/useAnimatedPress';
import { SendIcon } from '../icons';

const QUICK_PROMPTS = [
  { icon: '\uD83D\uDCC5', label: 'Bugun maclar' },
  { icon: '\uD83D\uDD34', label: 'Canli skorlar' },
  { icon: '\uD83D\uDCCA', label: 'Puan durumu' },
  { icon: '\uD83D\uDC51', label: 'Gol kralligi' },
  { icon: '\uD83E\uDD81', label: 'GS formu' },
  { icon: '\uD83C\uDFDF\uFE0F', label: 'GS vs FB' },
];

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const { animatedStyle, onPressIn, onPressOut } = useAnimatedPress(0.88);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <View style={styles.wrapper}>
      {/* Quick prompt chips with icons */}
      {!focused && !text && (
        <View style={styles.chips}>
          {QUICK_PROMPTS.map((prompt) => (
            <Pressable
              key={prompt.label}
              style={styles.chip}
              onPress={() => onSend(prompt.label)}
              disabled={disabled}
            >
              <Text style={styles.chipIcon}>{prompt.icon}</Text>
              <Text style={styles.chipText}>{prompt.label}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Input row */}
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, focused && styles.inputFocused]}
          placeholder="Futbol hakkinda bir seyler sor..."
          placeholderTextColor={COLORS.textSecondary}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
          editable={!disabled}
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <Animated.View style={animatedStyle}>
          <Pressable
            style={[styles.sendBtn, canSend && styles.sendBtnActive]}
            onPress={handleSend}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            disabled={!canSend}
          >
            <SendIcon size={18} color={canSend ? COLORS.assistantTextDark : COLORS.textSecondary} />
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  chipIcon: {
    fontSize: 12,
  },
  chipText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputFocused: {
    borderColor: COLORS.glassAccentBorder,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
});
