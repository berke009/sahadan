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

function RichText({ text, dark }: { text: string; dark?: boolean }) {
  const baseColor = dark ? COLORS.assistantTextDark : COLORS.text;
  const parts: React.ReactNode[] = [];
  // Split on **bold** markers
  const segments = text.split(/(\*\*[^*]+\*\*)/g);
  segments.forEach((seg, i) => {
    if (seg.startsWith('**') && seg.endsWith('**')) {
      parts.push(
        <Text key={i} style={{ fontWeight: '700', color: baseColor }}>{seg.slice(2, -2)}</Text>
      );
    } else {
      // Handle bullet points
      const lines = seg.split('\n');
      lines.forEach((line, j) => {
        if (j > 0) parts.push(<Text key={`br-${i}-${j}`}>{'\n'}</Text>);
        const trimmed = line.trimStart();
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          parts.push(
            <Text key={`${i}-${j}`} style={{ color: baseColor }}>
              {'  \u2022 '}{trimmed.slice(2)}
            </Text>
          );
        } else {
          parts.push(<Text key={`${i}-${j}`} style={{ color: baseColor }}>{line}</Text>);
        }
      });
    }
  });
  return <Text style={[styles.text, { color: baseColor }]}>{parts}</Text>;
}

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export function ChatBubble({ message, isRecent = true }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  const hasWidget = !!message.widget_payload;
  const widgetOnly = hasWidget && !message.content;
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
          <RichText text={message.content} dark={isWhiteBubble} />
        ) : null}
        {message.widget_payload && (
          <View style={[message.content && styles.widgetWithText]}>
            <WidgetRenderer payload={message.widget_payload} />
          </View>
        )}
      </View>
      {/* Timestamp */}
      <Text style={[styles.timestamp, isUser ? styles.timestampRight : styles.timestampLeft]}>
        {formatTimestamp(message.created_at)}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 3,
    maxWidth: '85%',
  },
  widgetMessageContainer: {
    maxWidth: '98%',
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
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
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
  widgetWithText: {
    marginTop: SPACING.sm,
  },
  timestamp: {
    color: COLORS.textMuted,
    fontSize: 9,
    marginTop: 3,
  },
  timestampRight: {
    textAlign: 'right',
    marginRight: 4,
  },
  timestampLeft: {
    textAlign: 'left',
    marginLeft: 4,
  },
});
