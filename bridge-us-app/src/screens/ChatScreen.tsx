import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  useColorScheme,
} from 'react-native';
import { useFocusEffect, useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import ThemedView from '../components/themed-view';
import ThemedText from '../components/themed-text';
import { Colors } from '../constants/theme';
import { subscribeChatRooms } from '../api/chat-firebase';
import { ChatRoom } from '../types/chat';
import { useAuth } from '../contexts/AuthContext';

type RootStackParamList = {
  ChatRoom: { chatRoomId: string; title: string };
};

export default function ChatScreen() {
  const { isLoggedIn, user } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useFocusEffect(
    useCallback(() => {
      if (!isLoggedIn || !user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const unsub = subscribeChatRooms(user.id, (rooms) => {
        const mapped: ChatRoom[] = rooms.map((r: any) => ({
          id: r.id,
          taskId: r.taskId || '',
          taskTitle: r.taskTitle || '',
          companyName: r.companyName || '企業',
          companyAvatarUrl: r.companyAvatarUrl,
          lastMessage: r.lastMessage || '',
          lastMessageAt: r.lastMessageAt?.toDate?.()?.toISOString?.() || undefined,
          unreadCount: r.unreadCount || 0,
        }));
        setChatRooms(mapped);
        setLoading(false);
        setRefreshing(false);
      });
      return () => unsub && unsub();
    }, [isLoggedIn, user])
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // Firestore onSnapshot will push updates automatically
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      return date.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffDays === 1) {
      return '昨日';
    } else if (diffDays < 7) {
      return `${diffDays}日前`;
    } else {
      return date.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const handleChatPress = (room: ChatRoom) => {
    navigation.navigate('ChatRoom', {
      chatRoomId: room.id,
      title: room.companyName,
    });
  };

  const renderChatRoom = ({ item }: { item: ChatRoom }) => (
    <TouchableOpacity
      style={[
        styles.chatItem,
        {
          backgroundColor: colors.cardBackground,
          borderBottomColor: colors.border,
        },
      ]}
      onPress={() => handleChatPress(item)}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.avatar,
          { backgroundColor: colors.tint + '20' },
        ]}
      >
        <Ionicons name="business" size={24} color={colors.tint} />
      </View>

      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <ThemedText style={styles.companyName} numberOfLines={1}>
            {item.companyName}
          </ThemedText>
          <Text style={[styles.timestamp, { color: colors.tabIconDefault }]}>
            {formatDate(item.lastMessageAt)}
          </Text>
        </View>

        <Text
          style={[styles.taskTitle, { color: colors.tabIconDefault }]}
          numberOfLines={1}
        >
          {item.taskTitle}
        </Text>

        <View style={styles.messageRow}>
          <Text
            style={[
              styles.lastMessage,
              {
                color: item.unreadCount > 0 ? colors.text : colors.tabIconDefault,
                fontWeight: item.unreadCount > 0 ? '600' : 'normal',
              },
            ]}
            numberOfLines={1}
          >
            {item.lastMessage || 'メッセージはありません'}
          </Text>
          {item.unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.tint }]}>
              <Text style={styles.badgeText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.tabIconDefault}
      />
    </TouchableOpacity>
  );

  // 未ログイン時の表示
  if (!isLoggedIn) {
    return (
      <ThemedView style={styles.centerContainer}>
        <View style={[styles.guestIcon, { backgroundColor: colors.tint + '15' }]}>
          <Ionicons name="chatbubbles-outline" size={48} color={colors.tint} />
        </View>
        <ThemedText style={styles.emptyTitle}>ログインが必要です</ThemedText>
        <Text style={[styles.emptyMessage, { color: colors.tabIconDefault }]}>
          チャット機能を利用するには{'\n'}アカウント登録が必要です
        </Text>
        <TouchableOpacity
          style={[styles.loginButton, { backgroundColor: colors.tint }]}
          onPress={() => {
            navigation.getParent()?.getParent()?.dispatch(
              CommonActions.navigate('Auth')
            );
          }}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.loginButtonText}>ログイン / 新規登録</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.tint} />
      </ThemedView>
    );
  }

  if (chatRooms.length === 0) {
    return (
      <ThemedView style={styles.centerContainer}>
        <Ionicons
          name="chatbubbles-outline"
          size={64}
          color={colors.tabIconDefault}
        />
        <ThemedText style={styles.emptyTitle}>チャットはありません</ThemedText>
        <Text style={[styles.emptyMessage, { color: colors.tabIconDefault }]}>
          タスクに応募すると、企業とのチャットが始まります
        </Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={chatRooms}
        keyExtractor={(item) => item.id}
        renderItem={renderChatRoom}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.tint}
          />
        }
        contentContainerStyle={styles.listContent}
      />
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
    padding: 24,
  },
  listContent: {
    paddingVertical: 8,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  chatContent: {
    flex: 1,
    marginRight: 8,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
  },
  taskTitle: {
    fontSize: 12,
    marginBottom: 4,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  guestIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
