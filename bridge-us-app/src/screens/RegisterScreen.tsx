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

const YEARS = [1, 2, 3, 4, 5, 6];

export default function RegisterScreen({ navigation }: any) {
  const { registerStudent } = useAuth();

  const handleSkip = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'StudentMainTabs' }],
      })
    );
  };
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [university, setUniversity] = useState('');
  const [faculty, setFaculty] = useState('');
  const [year, setYear] = useState<number | undefined>(undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const validateForm = (): string | null => {
    if (!name.trim()) return '名前を入力してください';
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
      await registerStudent({
        name: name.trim(),
        email: email.trim(),
        password,
        university: university.trim() || undefined,
        faculty: faculty.trim() || undefined,
        year,
      });
      // 登録成功後はメインタブへ遷移
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'StudentMainTabs' }],
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
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="person-add" size={40} color={colors.primary} />
            </View>
            <ThemedText style={styles.title}>新規登録</ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.subText }]}>
              アカウントを作成して始めましょう
            </ThemedText>
          </View>

          {/* 必須項目 */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              必須項目 <ThemedText style={{ color: '#ef4444' }}>*</ThemedText>
            </ThemedText>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: colors.subText }]}>名前</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                value={name}
                onChangeText={setName}
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
                placeholder="example@university.ac.jp"
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
            <ThemedText style={styles.sectionTitle}>学校情報（任意）</ThemedText>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: colors.subText }]}>大学名</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                value={university}
                onChangeText={setUniversity}
                placeholder="東京大学"
                placeholderTextColor={colors.subText}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: colors.subText }]}>学部・学科</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                value={faculty}
                onChangeText={setFaculty}
                placeholder="経済学部"
                placeholderTextColor={colors.subText}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: colors.subText }]}>学年</ThemedText>
              <View style={styles.yearContainer}>
                {YEARS.map((y) => (
                  <TouchableOpacity
                    key={y}
                    style={[
                      styles.yearButton,
                      {
                        backgroundColor: year === y ? colors.primary : colors.card,
                        borderColor: year === y ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setYear(year === y ? undefined : y)}
                  >
                    <ThemedText
                      style={[
                        styles.yearButtonText,
                        { color: year === y ? '#ffffff' : colors.text },
                      ]}
                    >
                      {y}年
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* ログインリンク */}
          <View style={styles.loginLink}>
            <ThemedText style={[styles.loginText, { color: colors.subText }]}>
              すでにアカウントをお持ちの方は
            </ThemedText>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <ThemedText style={[styles.loginLinkText, { color: colors.primary }]}>
                ログイン
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* スキップボタン */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <ThemedText style={[styles.skipButtonText, { color: colors.subText }]}>
              今はしない
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
          <TouchableOpacity
            style={[styles.registerButton, { backgroundColor: colors.primary }]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.registerButtonText}>アカウントを作成</ThemedText>
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
  yearContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  yearButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  yearButtonText: {
    fontSize: 14,
    fontWeight: '500',
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
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 4,
  },
  loginText: {
    fontSize: 14,
  },
  loginLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
    padding: 12,
  },
  skipButtonText: {
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
