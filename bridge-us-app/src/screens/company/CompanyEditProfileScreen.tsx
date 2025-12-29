import React, { useState } from 'react';
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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedView from '../../components/themed-view';
import ThemedText from '../../components/themed-text';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { isCompanyUser } from '../../types/user';
import {
  COMPANY_AVATARS,
  getCompanyAvatarSource,
  DEFAULT_COMPANY_AVATAR_ID,
} from '../../constants/avatars';

const COMPANY_PRIMARY = '#8b5cf6';

export default function CompanyEditProfileScreen({ navigation }: any) {
  const { user, updateUser } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // 企業ユーザーでない場合は戻る
  if (!user || !isCompanyUser(user)) {
    return null;
  }

  const [companyName, setCompanyName] = useState(user.companyName);
  const [representativeName, setRepresentativeName] = useState(user.representativeName);
  const [description, setDescription] = useState(user.description ?? '');
  const [loading, setLoading] = useState(false);
  const [avatarId, setAvatarId] = useState<number>(user.avatarId ?? DEFAULT_COMPANY_AVATAR_ID);

  const validateForm = (): string | null => {
    if (!companyName.trim()) return '会社名を入力してください';
    if (!representativeName.trim()) return '担当者名を入力してください';
    return null;
  };

  const handleSave = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert('入力エラー', error);
      return;
    }

    setLoading(true);
    try {
      await updateUser({
        ...user,
        companyName: companyName.trim(),
        representativeName: representativeName.trim(),
        description: description.trim() || undefined,
        avatarId,
      });
      Alert.alert('保存完了', 'プロフィールを更新しました', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('エラー', 'プロフィールの更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* アバターセクション */}
          <View style={styles.avatarSection}>
            <View style={styles.currentAvatarContainer}>
              <Image
                source={getCompanyAvatarSource(avatarId)}
                style={styles.currentAvatar}
              />
            </View>
            <ThemedText style={styles.avatarHint}>アイコンを選択</ThemedText>
            <View style={styles.avatarGrid}>
              {COMPANY_AVATARS.map((avatar) => (
                <TouchableOpacity
                  key={avatar.id}
                  style={[
                    styles.avatarOption,
                    {
                      borderColor: avatarId === avatar.id ? COMPANY_PRIMARY : colors.border,
                      borderWidth: avatarId === avatar.id ? 3 : 1,
                    },
                  ]}
                  onPress={() => setAvatarId(avatar.id)}
                >
                  <Image source={avatar.source} style={styles.avatarOptionImage} />
                  {avatarId === avatar.id && (
                    <View style={[styles.avatarCheckmark, { backgroundColor: COMPANY_PRIMARY }]}>
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 必須項目 */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              基本情報 <ThemedText style={{ color: '#ef4444' }}>*</ThemedText>
            </ThemedText>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: colors.subText }]}>会社名</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                value={companyName}
                onChangeText={setCompanyName}
                placeholder="株式会社サンプル"
                placeholderTextColor={colors.subText}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: colors.subText }]}>担当者名</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                value={representativeName}
                onChangeText={setRepresentativeName}
                placeholder="山田 太郎"
                placeholderTextColor={colors.subText}
              />
            </View>
          </View>

          {/* 任意項目 */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>会社情報（任意）</ThemedText>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: colors.subText }]}>会社紹介</ThemedText>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                value={description}
                onChangeText={setDescription}
                placeholder="会社の事業内容や特徴などを入力してください"
                placeholderTextColor={colors.subText}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* 保存ボタン */}
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: COMPANY_PRIMARY }]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.saveButtonText}>保存</ThemedText>
            )}
          </TouchableOpacity>

          {/* キャンセルボタン */}
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
    avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  currentAvatarContainer: {
    marginBottom: 12,
  },
  currentAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarHint: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 12,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  avatarOption: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
  },
  avatarOptionImage: {
    width: '100%',
    height: '100%',
  },
  avatarCheckmark: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeAvatarButton: {
    padding: 8,
  },
  changeAvatarText: {
    fontSize: 14,
    fontWeight: '500',
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
    minHeight: 100,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingTop: 12,
    fontSize: 16,
    borderWidth: 1,
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
});
