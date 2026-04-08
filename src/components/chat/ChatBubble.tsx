import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp, Easing } from 'react-native-reanimated';
import { Message } from '../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';
import { WidgetRenderer } from '../widgets/WidgetRenderer';

interface ChatBubbleProps {
  message: Message;
  isRecent?: boolean;
}

export function ChatBubble({ message, isRecent = true }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  const hasWidget = !!message.widget_payload;
  const widgetOnly = hasWidget && !message.content;

  // White bubble only for text-only AI responses (clean minimal look)
  const isWhiteBubble = !isUser && !hasWidget;

  const entering = isRecent
    ? isUser
      ? FadeInUp.duration(250).easing(Easing.out(Easing.cubic))
      : FadeInDown.duration(300).easing(Easing.out(Easing.cubic))
    : FadeIn.duration(60);

  return (
    <Animated.View
      entering={entering}
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
        hasWidget && styles.widgetMessageContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUser
            ? styles.userBubble
            : isWhiteBubble
            ? styles.assistantBubbleWhite
            : styles.assistantBubbleDark,
          widgetOnly && styles.bubbleWidgetOnly,
        ]}
      >
        {message.content ? (
          <Text
            style={[
              styles.text,
              isUser
                ? styles.userText
                : isWhiteBubble
                ? styles.assistantTextDark
                : styles.assistantTextLight,
            ]}
          >
            {message.content}
          </Text>
        ) : null}
        {message.widget_payload && (
          <View style={[message.content && styles.widgetWithText]}>
            <WidgetRenderer payload={message.widget_payload} />
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 3,
    maxWidth: '85%',
  },
  widgetMessageContainer: {
    maxWidth: '95%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  assistantContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    overflow: 'hidden',
  },
  bubbleWidgetOnly: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  userBubble: {
    backgroundColor: COLORS.userBubble,
    borderWidth: 1.5,
    borderColor: COLORS.userBubbleBorder,
    borderBottomRightRadius: BORDER_RADIUS.sm,
  },
  assistantBubbleDark: {
    backgroundColor: COLORS.assistantBubble,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomLeftRadius: BORDER_RADIUS.sm,
  },
  assistantBubbleWhite: {
    backgroundColor: COLORS.assistantBubbleWhite,
    borderBottomLeftRadius: BORDER_RADIUS.sm,
  },
  text: {
    fontSize: FONT_SIZES.md,
    lineHeight: 21,
  },
  userText: {
    color: COLORS.text,
  },
  assistantTextLight: {
    color: COLORS.text,
  },
  assistantTextDark: {
    color: COLORS.assistantTextDark,
    fontWeight: '500',
  },
  widgetWithText: {
    marginTop: SPACING.sm,
  },
});
