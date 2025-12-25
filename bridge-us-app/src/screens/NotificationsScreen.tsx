import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  View,
  RefreshControl,
  useColorScheme,
} from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ThemedView from '../components/themed-view';
import ThemedText from '../components/themed-text';
import {
  subscribeNotifications,
  markAsRead,
  markAllAsRead,
} from '../api/notifications-firebase';
import { Notification, NotificationType } from '../types/notification';
import { Colors } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';

const TYPE_ICONS: Record<NotificationType, string> = {
  new_task: '📋',
  application_approved: '✅',
  application_rejected: '❌',
  task_reminder: '⏰',
  message: '💬',
  task_completed: '🎉',
  new_application: '🙋',
};

const TYPE_COLORS: Record<NotificationType, string> = {
  new_task: '#3b82f6',
  application_approved: '#10b981',
  application_rejected: '#ef4444',
  task_reminder: '#f59e0b',
  message: '#8b5cf6',
  task_completed: '#06b6d4',
  new_application: '#8b5cf6',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins}分前`;
  } else if (diffHours < 24) {
    return `${diffHours}時間前`;
  } else if (diffDays < 7) {
    return `${diffDays}日前`;
  } else {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }
}

export default function NotificationsScreen() {
  const { isLoggedIn, user } = useAuth();
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  useEffect(() => {
    if (!isLoggedIn || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeNotifications(user.id, (data) => {
      setNotifications(data);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, [isLoggedIn, user]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Firestore onSnapshot will push updates automatically
  }, []);

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
      // Firestore will update via subscription
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    await markAllAsRead(user.id);
    // Firestore will update via subscription
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // 未ログイン時の表示
  if (!isLoggedIn) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <View style={[styles.guestIcon, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name="notifications-outline" size={48} color={colors.primary} />
        </View>
        <ThemedText style={styles.guestTitle}>ログインが必要です</ThemedText>
        <ThemedText style={[styles.guestMessage, { color: colors.subText }]}>
          通知機能を利用するには{'\n'}アカウント登録が必要です
        </ThemedText>
        <TouchableOpacity
          style={[styles.loginButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            navigation.getParent()?.dispatch(
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
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* ヘッダー */}
      {unreadCount > 0 && (
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <ThemedText style={[styles.unreadCount, { color: colors.subText }]}>
            {unreadCount}件の未読
          </ThemedText>
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <ThemedText style={[styles.markAllRead, { color: colors.primary }]}>
              すべて既読にする
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {/* 通知一覧 */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyIcon}>🔔</ThemedText>
            <ThemedText style={styles.emptyText}>通知はありません</ThemedText>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.notificationCard,
              {
                backgroundColor: item.read ? colors.background : colors.card,
                borderLeftColor: TYPE_COLORS[item.type],
              },
            ]}
            onPress={() => handleNotificationPress(item)}
            activeOpacity={0.7}
          >
            <View style={styles.notificationContent}>
              <View style={[styles.iconContainer, { backgroundColor: colors.card }]}>
                <ThemedText style={styles.icon}>{TYPE_ICONS[item.type]}</ThemedText>
              </View>
              <View style={styles.textContainer}>
                <View style={styles.titleRow}>
                  <ThemedText
                    style={[
                      styles.title,
                      { fontWeight: item.read ? '500' : 'bold' },
                    ]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </ThemedText>
                  {!item.read && (
                    <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                  )}
                </View>
                <ThemedText
                  style={[styles.message, { color: colors.subText }]}
                  numberOfLines={2}
                >
                  {item.message}
                </ThemedText>
                <ThemedText style={[styles.time, { color: colors.subText }]}>
                  {formatDate(item.createdAt)}
                </ThemedText>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  unreadCount: {
    fontSize: 14,
  },
  markAllRead: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
  },
  notificationCard: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderLeftWidth: 4,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 8,
  },
  notificationContent: {
    flexDirection: 'row',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  time: {
    fontSize: 12,
  },
  guestIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  guestTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  guestMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
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
