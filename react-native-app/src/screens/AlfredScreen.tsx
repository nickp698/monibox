import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LightTheme as C, Spacing, Radius } from '../theme/colors';
import { sendToAlfred } from '../services/alfred';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

const SUGGESTION_CHIPS = [
  'What is my net worth?',
  'How can I reduce my bills?',
  'Review my subscriptions',
  'Am I on track for retirement?',
];

export default function AlfredScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Good day! I'm Alfred, your personal finance concierge. I have access to your vault data and can help you understand your finances, spot savings, and plan ahead. How may I assist you?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingDots = useRef(new Animated.Value(0)).current;

  // Typing animation
  const startTypingAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(typingDots, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(typingDots, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, [typingDots]);

  const sendMessage = useCallback(
    async (text?: string) => {
      const msgText = (text || input).trim();
      if (!msgText || loading) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: msgText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setLoading(true);
      startTypingAnimation();

      try {
        // Build history for context
        const history = messages
          .filter((m) => m.id !== '1') // Skip welcome message
          .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

        const reply = await sendToAlfred(msgText, history);

        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: reply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        const errorMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I apologise, something went wrong. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setLoading(false);
        typingDots.stopAnimation();
      }
    },
    [input, loading, messages, startTypingAnimation, typingDots]
  );

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.msgBubble,
        item.role === 'user' ? styles.userBubble : styles.assistantBubble,
      ]}
    >
      {item.role === 'assistant' && (
        <Text style={styles.alfredBadge}>🎩 Alfred</Text>
      )}
      <Text style={[styles.msgText, item.role === 'user' && styles.userText]}>
        {item.content}
      </Text>
      <Text style={[styles.timestamp, item.role === 'user' && styles.userTimestamp]}>
        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  const showSuggestions = messages.length <= 1 && !loading;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alfred</Text>
        <Text style={styles.headerSub}>Your Personal Finance Concierge</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={
          <>
            {/* Typing indicator */}
            {loading && (
              <View style={[styles.msgBubble, styles.assistantBubble, styles.typingBubble]}>
                <Animated.Text style={[styles.typingText, { opacity: typingDots }]}>
                  Alfred is thinking...
                </Animated.Text>
              </View>
            )}

            {/* Suggestion chips */}
            {showSuggestions && (
              <View style={styles.suggestionsWrap}>
                <Text style={styles.suggestionsLabel}>Try asking:</Text>
                {SUGGESTION_CHIPS.map((chip) => (
                  <TouchableOpacity
                    key={chip}
                    style={styles.chip}
                    onPress={() => sendMessage(chip)}
                  >
                    <Text style={styles.chipText}>{chip}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Ask Alfred anything..."
            placeholderTextColor={C.text3}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => sendMessage()}
            returnKeyType="send"
            multiline
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            <Text style={styles.sendIcon}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { padding: Spacing.lg, paddingBottom: Spacing.md },
  headerTitle: { fontSize: 26, fontWeight: '300', color: C.text },
  headerSub: { fontSize: 13, color: C.text2, marginTop: 2 },
  messageList: { padding: Spacing.lg, paddingBottom: Spacing.md },
  msgBubble: { maxWidth: '82%', padding: 14, borderRadius: Radius.md, marginBottom: Spacing.sm },
  userBubble: { backgroundColor: C.accent, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  assistantBubble: { backgroundColor: C.surface, alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  msgText: { fontSize: 15, lineHeight: 22, color: C.text },
  userText: { color: '#fff' },
  alfredBadge: { fontSize: 11, color: C.text3, marginBottom: 4 },
  timestamp: { fontSize: 10, color: C.text3, marginTop: 6, alignSelf: 'flex-end' },
  userTimestamp: { color: 'rgba(255,255,255,0.6)' },

  typingBubble: { paddingVertical: 10 },
  typingText: { fontSize: 13, color: C.text3, fontStyle: 'italic' },

  suggestionsWrap: { marginTop: Spacing.md, gap: 8 },
  suggestionsLabel: { fontSize: 12, color: C.text3, marginBottom: 4 },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  chipText: { fontSize: 14, color: C.accent },

  inputBar: {
    flexDirection: 'row',
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.border,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: C.surface2,
    borderRadius: Radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: C.text,
    maxHeight: 100,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendIcon: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
