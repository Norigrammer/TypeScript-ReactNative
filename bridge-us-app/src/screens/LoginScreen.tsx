import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ThemedView from '../components/themed-view';
import ThemedText from '../components/themed-text';
import { Colors } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { isCompanyUser } from '../types/user';

export default function LoginScreen({ navigation }: any) {
  const { login, user } = useAuth();

  const handleSkip = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'StudentMainTabs' }],
      })
    );
  };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('入力エラー', 'メールアドレスを入力してください');
      return;
    }
    if (!password) {
      Alert.alert('入力エラー', 'パスワードを入力してください');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      // ログイン後、ユーザー情報はAuthContextで管理されるため
      // RootNavigatorが自動的に適切な画面にルーティングする
    } catch (err) {
      Alert.alert('ログインエラー', 'メールアドレスまたはパスワードが正しくありません');
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* ヘッダー */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="log-in" size={40} color={colors.primary} />
            </View>
            <ThemedText style={styles.title}>ログイン</ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.subText }]}>
              アカウントにログインして続ける
            </ThemedText>
          </View>

          {/* フォーム */}
          <View style={styles.form}>
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
                  placeholder="パスワードを入力"
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

            <TouchableOpacity style={styles.forgotPassword}>
              <ThemedText style={[styles.forgotPasswordText, { color: colors.primary }]}>
                パスワードをお忘れですか？
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* ログインボタン */}
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.loginButtonText}>ログイン</ThemedText>
            )}
          </TouchableOpacity>

          {/* 登録リンク */}
          <View style={styles.registerLink}>
            <ThemedText style={[styles.registerText, { color: colors.subText }]}>
              アカウントをお持ちでない方は
            </ThemedText>
            <TouchableOpacity onPress={() => navigation.navigate('UserTypeSelection')}>
              <ThemedText style={[styles.registerLinkText, { color: colors.primary }]}>
                新規登録
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
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
  form: {
    marginBottom: 24,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    fontSize: 13,
  },
  loginButton: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  registerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  registerText: {
    fontSize: 14,
  },
  registerLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    marginTop: 32,
    padding: 12,
  },
  skipButtonText: {
    fontSize: 15,
  },
});
