import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedView from '../../components/themed-view';
import ThemedText from '../../components/themed-text';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { isCompanyUser } from '../../types/user';
import { Task, TaskStatus } from '../../types/task';
import { subscribeCompanyTasks, deleteTask, updateTaskStatus } from '../../api/company-tasks-firebase';

const COMPANY_PRIMARY = '#8b5cf6';

const STATUS_LABELS: Record<TaskStatus, string> = {
  draft: '下書き',
  published: '公開中',
  unpublished: '非公開',
  closed: '終了',
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  draft: '#6b7280',
  published: '#10b981',
  unpublished: '#f59e0b',
  closed: '#ef4444',
};

export default function MyTasksListScreen({ navigation }: any) {
  const { user } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [tasks, setTasks] = useState<Task[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isCompanyUser(user)) return;

    const unsubscribe = subscribeCompanyTasks(user.id, (updatedTasks) => {
      setTasks(updatedTasks);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, [user]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // subscribeCompanyTasks will trigger callback with new data
  }, []);

  const handleDeleteTask = (taskId: string, taskTitle: string) => {
    if (!user || !isCompanyUser(user)) return;

    Alert.alert(
      'タスクを削除',
      `「${taskTitle}」を削除しますか？この操作は取り消せません。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(taskId, user.id);
            } catch (err) {
              Alert.alert('エラー', '削除に失敗しました');
            }
          },
        },
      ]
    );
  };

  const handleChangeStatus = async (taskId: string, newStatus: TaskStatus) => {
    if (!user || !isCompanyUser(user)) return;

    const actionLabels: Record<TaskStatus, string> = {
      draft: '下書きに戻す',
      published: '公開する',
      unpublished: '非公開にする',
      closed: '終了する',
    };
    const actionLabel = actionLabels[newStatus];

    Alert.alert(
      `タスクを${actionLabel}`,
      `このタスクを${actionLabel}か？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: actionLabel,
          onPress: async () => {
            try {
              await updateTaskStatus(taskId, user.id, newStatus);
            } catch (err) {
              Alert.alert('エラー', 'ステータスの変更に失敗しました');
            }
          },
        },
      ]
    );
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={[styles.taskCard, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.taskHeader}>
        <View style={styles.taskTitleRow}>
          <ThemedText style={styles.taskTitle} numberOfLines={1}>
            {item.title}
          </ThemedText>
          <View style={styles.headerRight}>
            <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}>
              <ThemedText style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
                {STATUS_LABELS[item.status]}
              </ThemedText>
            </View>
            <TouchableOpacity
              style={styles.deleteIconButton}
              onPress={() => handleDeleteTask(item.id, item.title)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
        <ThemedText style={[styles.taskMeta, { color: colors.subText }]}>
          {(() => {
            const cats = item.categories && item.categories.length > 0 ? item.categories : (item.category ? [item.category] : []);
            return cats.length > 0 ? `${cats.join(', ')} • ` : '';
          })()}
          応募者 {item.applicantCount ?? 0}人
        </ThemedText>
      </View>

      <View style={styles.taskDetails}>
        {item.deadline && (
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.subText} />
            <ThemedText style={[styles.detailText, { color: colors.subText }]}>
              締切: {item.deadline}
            </ThemedText>
          </View>
        )}
        {item.reward && (
          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={14} color={colors.subText} />
            <ThemedText style={[styles.detailText, { color: colors.subText }]}>
              報酬: {item.reward}
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.taskActions}>
        <TouchableOpacity
          style={[styles.actionButton, { borderColor: colors.border }]}
          onPress={() => navigation.navigate('TaskApplications', { taskId: item.id, taskTitle: item.title })}
        >
          <Ionicons name="people-outline" size={16} color={COMPANY_PRIMARY} />
          <ThemedText style={[styles.actionButtonText, { color: COMPANY_PRIMARY }]}>
            応募者
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { borderColor: colors.border }]}
          onPress={() => navigation.navigate('EditTask', { taskId: item.id })}
        >
          <Ionicons name="pencil-outline" size={16} color={colors.text} />
          <ThemedText style={styles.actionButtonText}>編集</ThemedText>
        </TouchableOpacity>

        {/* ステータス切り替えボタン */}
        {item.status === 'draft' && (
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: colors.border }]}
            onPress={() => handleChangeStatus(item.id, 'published')}
          >
            <Ionicons name="checkmark-circle-outline" size={16} color="#10b981" />
            <ThemedText style={[styles.actionButtonText, { color: '#10b981' }]}>
              公開
            </ThemedText>
          </TouchableOpacity>
        )}
        {item.status === 'published' && (
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: colors.border }]}
            onPress={() => handleChangeStatus(item.id, 'unpublished')}
          >
            <Ionicons name="eye-off-outline" size={16} color="#f59e0b" />
            <ThemedText style={[styles.actionButtonText, { color: '#f59e0b' }]}>
              非公開
            </ThemedText>
          </TouchableOpacity>
        )}
        {item.status === 'unpublished' && (
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: colors.border }]}
            onPress={() => handleChangeStatus(item.id, 'published')}
          >
            <Ionicons name="eye-outline" size={16} color="#10b981" />
            <ThemedText style={[styles.actionButtonText, { color: '#10b981' }]}>
              公開
            </ThemedText>
          </TouchableOpacity>
        )}
        {item.status !== 'closed' && item.status !== 'draft' && (
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: colors.border }]}
            onPress={() => handleChangeStatus(item.id, 'closed')}
          >
            <Ionicons name="close-circle-outline" size={16} color="#ef4444" />
            <ThemedText style={[styles.actionButtonText, { color: '#ef4444' }]}>
              終了
            </ThemedText>
          </TouchableOpacity>
        )}
        {item.status === 'closed' && (
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: colors.border }]}
            onPress={() => handleChangeStatus(item.id, 'published')}
          >
            <Ionicons name="refresh-outline" size={16} color="#10b981" />
            <ThemedText style={[styles.actionButtonText, { color: '#10b981' }]}>
              再公開
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: COMPANY_PRIMARY + '15' }]}>
        <Ionicons name="briefcase-outline" size={48} color={COMPANY_PRIMARY} />
      </View>
      <ThemedText style={styles.emptyTitle}>タスクがありません</ThemedText>
      <ThemedText style={[styles.emptySubtitle, { color: colors.subText }]}>
        新しいタスクを作成して{'\n'}大学生に依頼しましょう
      </ThemedText>
      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: COMPANY_PRIMARY }]}
        onPress={() => navigation.navigate('CreateTask')}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <ThemedText style={styles.createButtonText}>タスクを作成</ThemedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={tasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          tasks.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={!loading ? renderEmptyList : null}
      />

      {tasks.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: COMPANY_PRIMARY }]}
          onPress={() => navigation.navigate('CreateTask')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  emptyListContent: {
    flex: 1,
  },
  taskCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  taskHeader: {
    marginBottom: 12,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  deleteIconButton: {
    padding: 4,
  },
  taskMeta: {
    fontSize: 13,
  },
  taskDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  detailText: {
    fontSize: 13,
  },
  taskActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
