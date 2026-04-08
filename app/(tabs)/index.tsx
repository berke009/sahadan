import { useEffect, useRef, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useWindowDimensions,
} from 'react-native';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useChatStore } from '../../src/stores/chatStore';
import { ChatBubble } from '../../src/components/chat/ChatBubble';
import { ChatInput } from '../../src/components/chat/ChatInput';
import { ChatHeader } from '../../src/components/chat/ChatHeader';
import { ChatDateSeparator } from '../../src/components/chat/ChatDateSeparator';
import { TypingIndicator } from '../../src/components/chat/TypingIndicator';
import { SoccerPitchWatermark, ChevronDownIcon } from '../../src/components/icons';
import { WelcomeMessage } from '../../src/components/chat/WelcomeMessage';
import { COLORS, SPACING } from '../../src/constants/theme';
import { Message } from '../../src/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ListItem =
  | { type: 'message'; data: Message; isRecent: boolean }
  | { type: 'separator'; date: string; id: string };

function buildListItems(messages: Message[]): ListItem[] {
  const items: ListItem[] = [];
  let lastDate = '';
  const recentThreshold = messages.length - 5;

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const msgDate = msg.created_at.split('T')[0];
    if (msgDate !== lastDate) {
      items.push({ type: 'separator', date: msg.created_at, id: `sep-${msgDate}` });
      lastDate = msgDate;
    }
    items.push({ type: 'message', data: msg, isRecent: i >= recentThreshold });
  }
  return items;
}

export default function ChatScreen() {
  const { messages, loading, sendMessage, initSession } = useChatStore();
  const flatListRef = useRef<FlatList>(null);
  const [showScrollFab, setShowScrollFab] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const bodyHeight = useSharedValue(screenHeight);

  useEffect(() => {
    initSession();
  }, []);

  const toggleExpanded = () => {
    if (expanded) {
      bodyHeight.value = withSpring(0, { damping: 20, stiffness: 200 });
    } else {
      bodyHeight.value = withSpring(screenHeight, { damping: 20, stiffness: 200 });
    }
    setExpanded(!expanded);
  };

  const bodyStyle = useAnimatedStyle(() => ({
    height: bodyHeight.value,
    overflow: 'hidden',
  }));

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const distFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
    setShowScrollFab(distFromBottom > 200);
  };

  const scrollToBottom = () => flatListRef.current?.scrollToEnd({ animated: true });

  const listItems = buildListItems(messages);

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'separator') return <ChatDateSeparator date={item.date} />;
    return <ChatBubble message={item.data} isRecent={item.isRecent} />;
  };

  return (
    <View style={styles.container}>
      <ChatHeader expanded={expanded} onToggle={toggleExpanded} onLiveTap={() => sendMessage('Canli skorlar')} />

      <Animated.View style={[styles.body, bodyStyle]}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.flex}>
            {/* Soccer pitch watermark — behind messages */}
            <View style={styles.watermark} pointerEvents="none">
              <SoccerPitchWatermark />
            </View>

            <FlatList
              ref={flatListRef}
              data={listItems}
              renderItem={renderItem}
              keyExtractor={(item) =>
                item.type === 'separator' ? item.id : item.data.id
              }
              contentContainerStyle={styles.list}
              onContentSizeChange={scrollToBottom}
              onScroll={handleScroll}
              scrollEventThrottle={100}
              ListEmptyComponent={!loading ? <WelcomeMessage onSend={sendMessage} /> : null}
              ListFooterComponent={loading ? <TypingIndicator /> : null}
            />

            {showScrollFab && (
              <Animated.View
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(200)}
                style={styles.fabContainer}
              >
                <Pressable style={styles.fab} onPress={scrollToBottom}>
                  <ChevronDownIcon size={20} color={COLORS.assistantTextDark} />
                </Pressable>
              </Animated.View>
            )}
          </View>

          <ChatInput onSend={sendMessage} disabled={loading} />
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  body: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  watermark: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 1,
  },
  list: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  fab: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
