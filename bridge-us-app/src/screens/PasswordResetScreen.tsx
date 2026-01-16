import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../config/firebase';
import { fetchSignInMethodsForEmail } from 'firebase/auth';
import ThemedView from '../components/themed-view';
import ThemedText from '../components/themed-text';
import { Colors } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';

export default function PasswordResetScreen({ navigation }: any) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const onSubmit = async () => {
    const targetEmail = email.trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      Alert.alert('入力エラー', '有効なメールアドレスを入力してください');
      return;
    }
    setLoading(true);
    try {
      // ユーザーのサインイン方法を確認し、適切なメッセージを表示
      const methods = await fetchSignInMethodsForEmail(auth, targetEmail);
      if (!methods || methods.length === 0) {
        Alert.alert(
          'アカウントが見つかりません',
          '入力されたメールアドレスのアカウントが見つかりません。メールアドレスをご確認ください。'
        );
        return;
      }
      if (!methods.includes('password')) {
        // Google などの連携ログインのみの可能性
        Alert.alert(
          'パスワードリセット不可',
          'このメールアドレスはソーシャルログインで登録されています。パスワードの再設定は不要です。該当のプロバイダでログインしてください。'
        );
        return;
      }

      await resetPassword(targetEmail);
      Alert.alert(
        'メールを送信しました',
        'パスワード再設定用のメールを送信しました。受信トレイ／迷惑メールをご確認ください。',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert('送信に失敗しました', 'メール送信に失敗しました。もう一度お試しください。');
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
        <View style={styles.content}>
          {/* ヘッダー */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="key-outline" size={40} color={colors.primary} />
            </View>
            <ThemedText style={styles.title}>パスワードを再設定</ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.subText }]}>登録したメールアドレスを入力してください</ThemedText>
          </View>

          {/* 入力 */}
          <View style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: colors.subText }]}>メールアドレス</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={email}
              onChangeText={setEmail}
              placeholder="example@domain.com"
              placeholderTextColor={colors.subText}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* 送信ボタン */}
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.primary }]} 
            onPress={onSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.submitButtonText}>再設定メールを送信</ThemedText>
            )}
          </TouchableOpacity>

          {/* 戻る */}
          <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
            <ThemedText style={[styles.backLinkText, { color: colors.primary }]}>ログインに戻る</ThemedText>
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
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
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
  submitButton: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonText: {
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
});
