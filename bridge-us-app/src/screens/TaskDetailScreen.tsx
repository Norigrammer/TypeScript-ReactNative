import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Alert,
  ActivityIndicator,
  View,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedView from '../components/themed-view';
import ThemedText from '../components/themed-text';
import ApplicationModal from '../components/ApplicationModal';
import { getTaskById, applyToTask, unapplyTask, addFavorite, removeFavorite } from '../api/tasks';
import { Task } from '../types/task';
import { Colors } from '../constants/theme';

export default function TaskDetailScreen({ route }: any) {
  const taskId = route?.params?.taskId ?? 'unknown';
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  useEffect(() => {
    (async () => {
      try {
        const data = await getTaskById(taskId);
        setTask(data ?? null);
      } finally {
        setLoading(false);
      }
    })();
  }, [taskId]);

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ThemedView>
    );
  }

  if (!task) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>タスクが見つかりませんでした</ThemedText>
      </ThemedView>
    );
  }

  const handleApplyPress = () => {
    if (task.applied) {
      onCancelApplication();
    } else {
      setShowModal(true);
    }
  };

  const onCancelApplication = async () => {
    if (applying) return;
    setApplying(true);
    try {
      await unapplyTask(task.id);
      setTask({ ...task, applied: false });
      Alert.alert('応募を取り消しました');
    } catch {
      Alert.alert('エラー', '処理に失敗しました。もう一度お試しください。');
    } finally {
      setApplying(false);
    }
  };

  const onSubmitApplication = async (message: string) => {
    try {
      await applyToTask(task.id, message);
      setTask({ ...task, applied: true });
      setShowModal(false);
      Alert.alert('応募完了', 'タスクへの応募が完了しました。企業からの連絡をお待ちください。');
    } catch {
      Alert.alert('エラー', '応募に失敗しました。もう一度お試しください。');
    }
  };

  const onToggleFavorite = async () => {
    try {
      if (task.favorited) {
        await removeFavorite(task.id);
        setTask({ ...task, favorited: false });
      } else {
        await addFavorite(task.id);
        setTask({ ...task, favorited: true });
      }
    } catch {
      Alert.alert('エラー', '処理に失敗しました。');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          {task.category && (
            <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
              <ThemedText style={[styles.categoryText, { color: colors.primary }]}>
                {task.category}
              </ThemedText>
            </View>
          )}
          <TouchableOpacity onPress={onToggleFavorite} style={styles.favoriteButton}>
            <Ionicons
              name={task.favorited ? 'heart' : 'heart-outline'}
              size={28}
              color={task.favorited ? '#ef4444' : colors.subText}
            />
          </TouchableOpacity>
        </View>

        <ThemedText style={styles.title}>{task.title}</ThemedText>

        <ThemedText style={[styles.company, { color: colors.subText }]}>
          {task.company}
        </ThemedText>

        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          {task.deadline && (
            <View style={styles.infoRow}>
              <ThemedText style={[styles.infoLabel, { color: colors.subText }]}>
                締切日
              </ThemedText>
              <ThemedText style={styles.infoValue}>{task.deadline}</ThemedText>
            </View>
          )}
          {task.reward && (
            <View style={styles.infoRow}>
              <ThemedText style={[styles.infoLabel, { color: colors.subText }]}>
                報酬
              </ThemedText>
              <ThemedText style={[styles.infoValue, { color: colors.primary, fontWeight: 'bold' }]}>
                {task.reward}
              </ThemedText>
            </View>
          )}
        </View>

        {task.description && (
          <View style={styles.descriptionSection}>
            <ThemedText style={styles.sectionTitle}>タスク内容</ThemedText>
            <ThemedText style={[styles.description, { color: colors.text }]}>
              {task.description}
            </ThemedText>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.applyButton,
            {
              backgroundColor: task.applied ? colors.card : colors.primary,
              borderWidth: task.applied ? 1 : 0,
              borderColor: colors.border,
            },
          ]}
          onPress={handleApplyPress}
          activeOpacity={0.8}
          disabled={applying}
        >
          {applying ? (
            <ActivityIndicator color={task.applied ? colors.text : '#ffffff'} />
          ) : (
            <ThemedText
              style={[
                styles.applyButtonText,
                { color: task.applied ? colors.text : '#ffffff' },
              ]}
            >
              {task.applied ? '応募を取り消す' : 'このタスクに応募する'}
            </ThemedText>
          )}
        </TouchableOpacity>
      </View>

      <ApplicationModal
        visible={showModal}
        taskTitle={task.title}
        companyName={task.company}
        onClose={() => setShowModal(false)}
        onSubmit={onSubmitApplication}
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
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  favoriteButton: {
    padding: 4,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  company: {
    fontSize: 15,
    marginBottom: 20,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 15,
  },
  descriptionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  applyButton: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
