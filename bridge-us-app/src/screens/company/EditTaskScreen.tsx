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
  Modal,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
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
  const [deadlineDate, setDeadlineDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
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

  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const openDatePicker = () => {
    const base = deadline && /^\d{4}-\d{2}-\d{2}$/.test(deadline)
      ? new Date(`${deadline}T00:00:00`)
      : new Date();
    setDeadlineDate(base);
    setShowDatePicker(true);
  };

  const onChangeDate = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      if (event.type === 'set' && selected) {
        setDeadline(formatDate(selected));
      }
      setShowDatePicker(false);
    } else {
      if (selected) setDeadlineDate(selected);
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
            <View style={styles.statusGrid}>
              {([
                { key: 'draft', label: '下書き', color: '#6b7280' },
                { key: 'published', label: '公開', color: '#10b981' },
                { key: 'unpublished', label: '非公開', color: '#f59e0b' },
                { key: 'closed', label: '終了', color: '#ef4444' },
              ] as { key: TaskStatus; label: string; color: string }[]).map((s) => (
                <TouchableOpacity
                  key={s.key}
                  style={[
                    styles.statusButton,
                    {
                      backgroundColor: status === s.key ? s.color : colors.card,
                      borderColor: status === s.key ? s.color : colors.border,
                    },
                  ]}
                  onPress={() => setStatus(s.key)}
                >
                  <ThemedText
                    style={[
                      styles.statusButtonText,
                      { color: status === s.key ? '#ffffff' : colors.text },
                    ]}
                  >
                    {s.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
            <ThemedText style={[styles.statusHint, { color: colors.subText }]}>
              {status === 'draft' && '作成中のタスクです。学生には表示されません。'}
              {status === 'published' && '学生に公開され、応募を受け付けます。'}
              {status === 'unpublished' && '一時的に非公開。学生には表示されません。'}
              {status === 'closed' && '募集を終了しました。再公開も可能です。'}
            </ThemedText>
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
              <TouchableOpacity activeOpacity={0.8} onPress={openDatePicker}>
                <View style={[styles.input, styles.inputWithIcon, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                  <ThemedText style={{ color: deadline ? colors.text : colors.subText, fontSize: 16 }}>
                    {deadline || 'カレンダーから選択'}
                  </ThemedText>
                  <Ionicons name="calendar-outline" size={20} color={colors.subText} />
                </View>
              </TouchableOpacity>
              <ThemedText style={[styles.hint, { color: colors.subText }]}> 
                タップしてカレンダーを開く（YYYY-MM-DD）
              </ThemedText>
            </View>
          </View>
        </ScrollView>
        {/* 下部固定ボタン */}
        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              paddingBottom: insets.bottom + 8,
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

          {/* キャンセル（小さめ、保存の下） */}
          <TouchableOpacity
            style={styles.cancelSmallButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <ThemedText style={[styles.cancelSmallText, { color: colors.subText }]}>キャンセル</ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* カレンダーモーダル */}
      {showDatePicker && (
        Platform.OS === 'android' ? (
          <DateTimePicker
            value={deadlineDate || new Date()}
            mode="date"
            display="calendar"
            onChange={onChangeDate}
          />
        ) : (
          <Modal
            visible
            animationType="slide"
            transparent
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.modalBackdrop}>
              <View style={[styles.modalSheet, { backgroundColor: colors.background }]}> 
                <View style={styles.modalHeader}>
                  <ThemedText style={styles.modalTitle}>締切日を選択</ThemedText>
                  <TouchableOpacity
                    onPress={() => {
                      const picked = deadlineDate || new Date();
                      setDeadline(formatDate(picked));
                      setShowDatePicker(false);
                    }}
                  >
                    <ThemedText style={[styles.modalDone, { color: COMPANY_PRIMARY }]}>完了</ThemedText>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={deadlineDate || new Date()}
                  mode="date"
                  display="inline"
                  onChange={onChangeDate}
                  style={{ alignSelf: 'stretch' }}
                />
              </View>
            </View>
          </Modal>
        )
      )}
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
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusButton: {
    width: '47%',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusHint: {
    fontSize: 12,
    marginTop: 12,
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
  cancelSmallButton: {
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 8,
  },
  cancelSmallText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalDone: {
    fontSize: 16,
    fontWeight: '600',
  },
});
