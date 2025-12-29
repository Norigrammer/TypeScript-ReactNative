import React, { useMemo, useState } from 'react';
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
import { TaskStatus } from '../../types/task';
import { createTask } from '../../api/company-tasks-firebase';
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

export default function CreateTaskScreen({ navigation }: any) {
  const { user } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [deadlineDate, setDeadlineDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reward, setReward] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  if (!user || !isCompanyUser(user)) {
    return null;
  }

  const validateForm = (): string | null => {
    if (!title.trim()) return 'タイトルを入力してください';
    if (title.trim().length < 5) return 'タイトルは5文字以上で入力してください';
    return null;
  };

  const handleCreate = async (status: TaskStatus = 'published') => {
    const error = validateForm();
    if (error) {
      Alert.alert('入力エラー', error);
      return;
    }

    setLoading(true);
    try {
      await createTask(user.id, user.companyName, user.logoUrl, {
        title: title.trim(),
        description: description.trim() || undefined,
        deadline: deadline.trim() || undefined,
        reward: reward.trim() || undefined,
        categories: selectedCategories,
        status,
      });

      const message = status === 'draft' ? '下書きを保存しました' : 'タスクを公開しました';
      Alert.alert('完了', message, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('エラー', 'タスクの作成に失敗しました');
    } finally {
      setLoading(false);
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
            { paddingBottom: insets.bottom + 140 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
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

          {/* キャンセル */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <ThemedText style={[styles.cancelButtonText, { color: colors.subText }]}>
              キャンセル
            </ThemedText>
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
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.draftButton, { borderColor: COMPANY_PRIMARY }]}
              onPress={() => handleCreate('draft')}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Ionicons name="document-outline" size={18} color={COMPANY_PRIMARY} />
              <ThemedText style={[styles.draftButtonText, { color: COMPANY_PRIMARY }]}>下書き保存</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.publishButton, { backgroundColor: COMPANY_PRIMARY }]}
              onPress={() => handleCreate('published')}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="paper-plane-outline" size={18} color="#fff" />
                  <ThemedText style={styles.publishButtonText}>公開する</ThemedText>
                </>
              )}
            </TouchableOpacity>
          </View>
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  draftButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  draftButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  publishButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 12,
    gap: 8,
  },
  publishButtonText: {
    color: '#ffffff',
    fontSize: 16,
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
