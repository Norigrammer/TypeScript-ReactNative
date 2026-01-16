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
import ThemedView from '../components/themed-view';
import ThemedText from '../components/themed-text';
import { getAppliedTasks } from '../api/tasks-firebase';
import { AppliedTask, ApplicationStatus } from '../types/task';
import { Colors } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: '審査中',
  approved: '承認済み',
  rejected: '不承認',
  completed: '完了',
};

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  pending: '#f59e0b',
  approved: '#10b981',
  rejected: '#ef4444',
  completed: '#6b7280',
};

export default function MyApplicationsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<AppliedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const fetchTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }
    try {
      const data = await getAppliedTasks(user.id);
      setTasks(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

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
        <ThemedText style={styles.emptyTitle}>応募中のタスクはありません</ThemedText>
        <ThemedText style={[styles.emptySubtitle, { color: colors.subText }]}>
          タスク一覧から気になるタスクに応募してみましょう
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
          >
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: STATUS_COLORS[item.status] + '20' },
                ]}
              >
                <ThemedText
                  style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}
                >
                  {STATUS_LABELS[item.status]}
                </ThemedText>
              </View>
              <ThemedText style={[styles.appliedAt, { color: colors.subText }]}>
                {item.appliedAt}
              </ThemedText>
            </View>

            <ThemedText style={styles.title}>{item.title}</ThemedText>
            <ThemedText style={[styles.company, { color: colors.subText }]}>
              {item.company}
            </ThemedText>

            <View style={styles.cardFooter}>
              {item.deadline && (
                <ThemedText style={[styles.deadline, { color: colors.subText }]}>
                  締切: {item.deadline}
                </ThemedText>
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
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
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
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  appliedAt: {
    fontSize: 12,
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
  },
  deadline: {
    fontSize: 12,
  },
  reward: {
    fontSize: 14,
    fontWeight: '600',
  },
});
