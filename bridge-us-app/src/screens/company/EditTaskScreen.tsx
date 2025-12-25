import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedView from '../../components/themed-view';
import ThemedText from '../../components/themed-text';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { isCompanyUser } from '../../types/user';
import { Task, TaskStatus } from '../../types/task';
import { updateTask } from '../../api/company-tasks-firebase';
import { getTaskById } from '../../api/tasks-firebase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COMPANY_PRIMARY = '#8b5cf6';

const CATEGORIES = [
  'リサーチ',
  'データ入力',
  'ライティング',
  '翻訳',
  'デザイン',
  'プログラミング',
  'SNS運用',
  'イベント',
  'その他',
];

interface Props {
  route: {
    params: {
      taskId: string;
    };
  };
  navigation: any;
}

export default function EditTaskScreen({ route, navigation }: Props) {
  const { taskId } = route.params;
  const { user } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const [task, setTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [reward, setReward] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [status, setStatus] = useState<TaskStatus>('published');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadTask = async () => {
      try {
        const taskData = await getTaskById(taskId, null);
        if (taskData) {
          setTask(taskData);
          setTitle(taskData.title);
          setDescription(taskData.description || '');
          setDeadline(taskData.deadline || '');
          setReward(taskData.reward || '');
          const categories = Array.isArray(taskData.categories)
            ? taskData.categories
            : taskData.category
              ? [taskData.category]
              : [];
          setSelectedCategories(categories);
          setStatus(taskData.status);
        }
      } catch (err) {
        Alert.alert('エラー', 'タスクの読み込みに失敗しました', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [taskId, navigation]);

  if (!user || !isCompanyUser(user)) {
    return null;
  }

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COMPANY_PRIMARY} />
        </View>
      </ThemedView>
    );
  }

  if (!task) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.subText} />
          <ThemedText style={[styles.errorText, { color: colors.subText }]}>
            タスクが見つかりません
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  const validateForm = (): string | null => {
    if (!title.trim()) return 'タイトルを入力してください';
    if (title.trim().length < 5) return 'タイトルは5文字以上で入力してください';
    return null;
  };

  const handleSave = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert('入力エラー', error);
      return;
    }

    setSaving(true);
    try {
      await updateTask(taskId, user.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        deadline: deadline.trim() || undefined,
        reward: reward.trim() || undefined,
        categories: selectedCategories,
        status,
      });

      Alert.alert('完了', 'タスクを更新しました', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('エラー', 'タスクの更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 120 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* ステータス */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>ステータス</ThemedText>
            <View style={styles.statusContainer}>
              {(['draft', 'published', 'closed'] as TaskStatus[]).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.statusButton,
                    {
                      backgroundColor: status === s ? COMPANY_PRIMARY : colors.card,
                      borderColor: status === s ? COMPANY_PRIMARY : colors.border,
                    },
                  ]}
                  onPress={() => setStatus(s)}
                >
                  <ThemedText
                    style={[
                      styles.statusButtonText,
                      { color: status === s ? '#ffffff' : colors.text },
                    ]}
                  >
                    {s === 'draft' ? '下書き' : s === 'published' ? '公開中' : '終了'}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* タイトル */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              タスク情報 <ThemedText style={{ color: '#ef4444' }}>*</ThemedText>
            </ThemedText>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: colors.subText }]}>タイトル</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                value={title}
                onChangeText={setTitle}
                placeholder="例: SNS投稿の分析レポート作成"
                placeholderTextColor={colors.subText}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: colors.subText }]}>詳細説明</ThemedText>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                value={description}
                onChangeText={setDescription}
                placeholder="タスクの詳細、期待する成果物、必要なスキルなどを記載してください"
                placeholderTextColor={colors.subText}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* カテゴリー */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>カテゴリー</ThemedText>
            <View style={styles.categoryContainer}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    {
                      backgroundColor: selectedCategories.includes(cat) ? COMPANY_PRIMARY : colors.card,
                      borderColor: selectedCategories.includes(cat) ? COMPANY_PRIMARY : colors.border,
                    },
                  ]}
                  onPress={() => {
                    setSelectedCategories((prev) =>
                      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
                    );
                  }}
                >
                  <ThemedText
                    style={[
                      styles.categoryButtonText,
                      { color: selectedCategories.includes(cat) ? '#ffffff' : colors.text },
                    ]}
                  >
                    {cat}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 報酬・締切 */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>報酬・締切（任意）</ThemedText>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: colors.subText }]}>報酬</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                value={reward}
                onChangeText={setReward}
                placeholder="例: 5,000円、時給1,500円"
                placeholderTextColor={colors.subText}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: colors.subText }]}>締切日</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                value={deadline}
                onChangeText={setDeadline}
                placeholder="例: 2025-01-31"
                placeholderTextColor={colors.subText}
              />
              <ThemedText style={[styles.hint, { color: colors.subText }]}>
                YYYY-MM-DD形式で入力
              </ThemedText>
            </View>
          </View>

          {/* キャンセル */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <ThemedText style={[styles.cancelButtonText, { color: colors.subText }]}>キャンセル</ThemedText>
          </TouchableOpacity>
        </ScrollView>
        {/* 下部固定ボタン */}
        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: COMPANY_PRIMARY }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.saveButtonText}>変更を保存</ThemedText>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 120,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingTop: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  cancelButton: {
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
  },
  cancelButtonText: {
    fontSize: 15,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
