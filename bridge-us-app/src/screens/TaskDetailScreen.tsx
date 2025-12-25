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
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ThemedView from '../components/themed-view';
import ThemedText from '../components/themed-text';
import ApplicationModal from '../components/ApplicationModal';
import { getTaskById, applyToTask, unapplyTask, addFavorite, removeFavorite } from '../api/tasks-firebase';
import { Task } from '../types/task';
import { Colors } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { isStudentUser } from '../types/user';

export default function TaskDetailScreen({ route }: any) {
  const { isLoggedIn, user } = useAuth();
  const navigation = useNavigation();
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
        const data = await getTaskById(taskId, user?.id ?? null);
        setTask(data ?? null);
      } finally {
        setLoading(false);
      }
    })();
  }, [taskId, user]);

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
    if (applying || !user) return;
    setApplying(true);
    try {
      await unapplyTask(user.id, task.id);
      setTask({ ...task, applied: false });
      Alert.alert('応募を取り消しました');
    } catch {
      Alert.alert('エラー', '処理に失敗しました。もう一度お試しください。');
    } finally {
      setApplying(false);
    }
  };

  const onSubmitApplication = async (message: string) => {
    if (!user || !isStudentUser(user)) return;
    try {
      await applyToTask({
        userId: user.id,
        taskId: task.id,
        message,
        studentName: user.name,
        studentUniversity: user.university,
        studentYear: user.year,
        studentAvatarUrl: user.avatarUrl,
      });
      setTask({ ...task, applied: true });
      setShowModal(false);
      Alert.alert('応募完了', 'タスクへの応募が完了しました。企業からの連絡をお待ちください。');
    } catch {
      Alert.alert('エラー', '応募に失敗しました。もう一度お試しください。');
    }
  };

  const onToggleFavorite = async () => {
    if (!user) return;
    try {
      if (task.favorited) {
        await removeFavorite(user.id, task.id);
        setTask({ ...task, favorited: false });
      } else {
        await addFavorite(user.id, task.id);
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
          {(task.categories && task.categories.length > 0 ? task.categories : (task.category ? [task.category] : [])).map((cat) => (
            <View key={cat} style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
              <ThemedText style={[styles.categoryText, { color: colors.primary }]}>
                {cat}
              </ThemedText>
            </View>
          ))}
          <TouchableOpacity onPress={onToggleFavorite} style={styles.favoriteButton}>
            <Ionicons
              name={task.favorited ? 'heart' : 'heart-outline'}
              size={28}
              color={task.favorited ? '#ef4444' : colors.subText}
            />
          </TouchableOpacity>
        </View>

        <ThemedText style={styles.title}>{task.title}</ThemedText>

        {/* 企業情報 - タップで企業プロフィールへ */}
        <TouchableOpacity
          style={styles.companyRow}
          onPress={() => {
            if (task.companyId) {
              (navigation as any).navigate('CompanyProfile', { companyId: task.companyId });
            }
          }}
          activeOpacity={0.7}
          disabled={!task.companyId}
        >
          <View style={[styles.companyAvatar, { backgroundColor: '#8b5cf6' }]}>
            <Ionicons name="business" size={16} color="#fff" />
          </View>
          <ThemedText style={[styles.company, { color: colors.subText }]}>
            {task.company}
          </ThemedText>
          {task.companyId && (
            <Ionicons name="chevron-forward" size={16} color={colors.subText} />
          )}
        </TouchableOpacity>

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
        {isLoggedIn ? (
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
        ) : (
          <View>
            <ThemedText style={[styles.loginPrompt, { color: colors.subText }]}>
              応募するにはログインが必要です
            </ThemedText>
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                navigation.getParent()?.getParent()?.dispatch(
                  CommonActions.navigate('Auth')
                );
              }}
              activeOpacity={0.8}
            >
              <ThemedText style={[styles.applyButtonText, { color: '#ffffff' }]}>
                ログイン / 新規登録
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
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
    marginBottom: 12,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  companyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  company: {
    fontSize: 15,
    flex: 1,
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
  loginPrompt: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
});
