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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import ThemedView from '../components/themed-view';
import ThemedText from '../components/themed-text';
import { Colors } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CompanyRegisterScreen({ navigation }: any) {
  const { registerCompany } = useAuth();

  const [companyName, setCompanyName] = useState('');
  const [representativeName, setRepresentativeName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [description, setDescription] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const validateForm = (): string | null => {
    if (!companyName.trim()) return '会社名を入力してください';
    if (!representativeName.trim()) return '担当者名を入力してください';
    if (!email.trim()) return 'メールアドレスを入力してください';
    if (!email.includes('@')) return '有効なメールアドレスを入力してください';
    if (!password) return 'パスワードを入力してください';
    if (password.length < 6) return 'パスワードは6文字以上で入力してください';
    if (password !== confirmPassword) return 'パスワードが一致しません';
    return null;
  };

  const handleRegister = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert('入力エラー', error);
      return;
    }

    setLoading(true);
    try {
      await registerCompany({
        companyName: companyName.trim(),
        representativeName: representativeName.trim(),
        email: email.trim(),
        password,
        description: description.trim() || undefined,
      });
      // 登録成功後は企業用メインタブへ遷移
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'CompanyMainTabs' }],
        })
      );
    } catch (err) {
      Alert.alert('登録エラー', '登録に失敗しました。もう一度お試しください。');
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
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 120 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* ヘッダー */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: '#8b5cf6' + '15' }]}>
              <Ionicons name="business" size={40} color="#8b5cf6" />
            </View>
            <ThemedText style={styles.title}>企業アカウント登録</ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.subText }]}>
              タスクを作成して大学生に依頼しましょう
            </ThemedText>
          </View>

          {/* 必須項目 */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              必須項目 <ThemedText style={{ color: '#ef4444' }}>*</ThemedText>
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

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: colors.subText }]}>メールアドレス</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                value={email}
                onChangeText={setEmail}
                placeholder="contact@example.com"
                placeholderTextColor={colors.subText}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: colors.subText }]}>パスワード</ThemedText>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="6文字以上"
                  placeholderTextColor={colors.subText}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={22}
                    color={colors.subText}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: colors.subText }]}>パスワード（確認）</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="パスワードを再入力"
                placeholderTextColor={colors.subText}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
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

          {/* 戻るリンク */}
          <View style={styles.backLink}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ThemedText style={[styles.backLinkText, { color: colors.primary }]}>
                ユーザー選択に戻る
              </ThemedText>
            </TouchableOpacity>
          </View>
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
            style={[styles.registerButton, { backgroundColor: '#8b5cf6' }]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.registerButtonText}>企業アカウントを作成</ThemedText>
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
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
    minHeight: 100,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingTop: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    borderWidth: 1,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  registerButton: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  backLink: {
    alignItems: 'center',
    marginTop: 24,
  },
  backLinkText: {
    fontSize: 14,
    fontWeight: '600',
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
