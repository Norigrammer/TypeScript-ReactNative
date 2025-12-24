import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ThemedView from '../components/themed-view';
import { Colors } from '../constants/theme';
import { getMessages, sendMessage, markAsRead } from '../api/chat';
import { Message } from '../types/chat';

type ChatRoomParams = {
  ChatRoom: {
    chatRoomId: string;
    title: string;
  };
};

export default function ChatRoomScreen() {
  const route = useRoute<RouteProp<ChatRoomParams, 'ChatRoom'>>();
  const { chatRoomId } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const fetchMessages = useCallback(async () => {
    try {
      const data = await getMessages(chatRoomId);
      setMessages(data);
      await markAsRead(chatRoomId);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  }, [chatRoomId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;

    setSending(true);
    try {
      const newMessage = await sendMessage(chatRoomId, inputText.trim());
      setMessages((prev) => [...prev, newMessage]);
      setInputText('');
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const shouldShowDate = (currentIndex: number) => {
    if (currentIndex === 0) return true;
    const currentDate = new Date(messages[currentIndex].createdAt).toDateString();
    const prevDate = new Date(messages[currentIndex - 1].createdAt).toDateString();
    return currentDate !== prevDate;
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isUser = item.senderType === 'user';
    const showDate = shouldShowDate(index);

    return (
      <View>
        {showDate && (
          <View style={styles.dateContainer}>
            <Text style={[styles.dateText, { color: colors.tabIconDefault }]}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        )}
        <View
          style={[
            styles.messageRow,
            isUser ? styles.messageRowUser : styles.messageRowCompany,
          ]}
        >
          {!isUser && (
            <View
              style={[
                styles.messageAvatar,
                { backgroundColor: colors.tint + '20' },
              ]}
            >
              <Ionicons name="business" size={16} color={colors.tint} />
            </View>
          )}
          <View
            style={[
              styles.messageBubble,
              isUser
                ? [styles.userBubble, { backgroundColor: colors.tint }]
                : [
                    styles.companyBubble,
                    {
                      backgroundColor:
                        colorScheme === 'dark' ? '#2c2c2e' : '#e5e5ea',
                    },
                  ],
            ]}
          >
            <Text
              style={[
                styles.messageText,
                { color: isUser ? '#fff' : colors.text },
              ]}
            >
              {item.content}
            </Text>
            <Text
              style={[
                styles.messageTime,
                {
                  color: isUser
                    ? 'rgba(255,255,255,0.7)'
                    : colors.tabIconDefault,
                },
              ]}
            >
              {formatTime(item.createdAt)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.tint} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }}
        />

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.cardBackground,
              borderTopColor: colors.border,
            },
          ]}
        >
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor:
                  colorScheme === 'dark' ? '#2c2c2e' : '#f2f2f7',
                color: colors.text,
              },
            ]}
            placeholder="メッセージを入力..."
            placeholderTextColor={colors.tabIconDefault}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor:
                  inputText.trim() && !sending ? colors.tint : colors.border,
              },
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardAvoid: {
    flex: 1,
  },
  messageList: {
    padding: 16,
    paddingBottom: 8,
  },
  dateContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateText: {
    fontSize: 12,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowCompany: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  companyBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
