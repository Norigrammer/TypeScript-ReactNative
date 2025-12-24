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
import { Ionicons } from '@expo/vector-icons';
import ThemedView from '../components/themed-view';
import ThemedText from '../components/themed-text';
import { getFavoriteTasks } from '../api/tasks';
import { Task } from '../types/task';
import { Colors } from '../constants/theme';

export default function FavoritesScreen({ navigation }: any) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const fetchTasks = useCallback(async () => {
    try {
      const data = await getFavoriteTasks();
      setTasks(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTasks();
  }, [fetchTasks]);

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ThemedView>
    );
  }

  if (tasks.length === 0) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <Ionicons name="heart-outline" size={48} color={colors.subText} />
        <ThemedText style={styles.emptyTitle}>お気に入りはありません</ThemedText>
        <ThemedText style={[styles.emptySubtitle, { color: colors.subText }]}>
          タスク詳細画面でハートをタップして{'\n'}お気に入りに追加しましょう
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <View style={styles.badgeContainer}>
                {item.category && (
                  <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
                    <ThemedText style={[styles.categoryText, { color: colors.primary }]}>
                      {item.category}
                    </ThemedText>
                  </View>
                )}
                {item.applied && (
                  <View style={[styles.appliedBadge, { backgroundColor: '#10b98120' }]}>
                    <ThemedText style={styles.appliedText}>応募済み</ThemedText>
                  </View>
                )}
              </View>
              <Ionicons name="heart" size={18} color="#ef4444" />
            </View>

            <ThemedText style={styles.title}>{item.title}</ThemedText>
            <ThemedText style={[styles.company, { color: colors.subText }]}>
              {item.company}
            </ThemedText>

            <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
              {item.deadline && (
                <View style={styles.deadlineContainer}>
                  <ThemedText style={[styles.deadlineLabel, { color: colors.subText }]}>
                    締切
                  </ThemedText>
                  <ThemedText style={[styles.deadline, { color: colors.text }]}>
                    {item.deadline}
                  </ThemedText>
                </View>
              )}
              {item.reward && (
                <ThemedText style={[styles.reward, { color: colors.primary }]}>
                  {item.reward}
                </ThemedText>
              )}
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  listContent: {
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  appliedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  appliedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  company: {
    fontSize: 14,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deadlineLabel: {
    fontSize: 12,
  },
  deadline: {
    fontSize: 14,
    fontWeight: '500',
  },
  reward: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
