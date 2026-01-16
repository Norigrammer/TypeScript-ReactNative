import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import ThemedView from '../components/themed-view';
import ThemedText from '../components/themed-text';
import { Colors } from '../constants/theme';

export default function UserTypeSelectionScreen({ navigation }: any) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const handleSkip = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'StudentMainTabs' }],
      })
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>はじめまして</ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.subText }]}>
          あなたに合った方を選択してください
        </ThemedText>
      </View>

      <View style={styles.cardsContainer}>
        {/* 学生カード */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.8}
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="school" size={40} color={colors.primary} />
          </View>
          <ThemedText style={styles.cardTitle}>大学生として登録</ThemedText>
          <ThemedText style={[styles.cardDescription, { color: colors.subText }]}>
            タスクに応募して報酬を得ることができます
          </ThemedText>
          <View style={[styles.cardArrow, { backgroundColor: colors.primary }]}>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* 企業カード */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.navigate('CompanyRegister')}
          activeOpacity={0.8}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#8b5cf6' + '15' }]}>
            <Ionicons name="business" size={40} color="#8b5cf6" />
          </View>
          <ThemedText style={styles.cardTitle}>企業として登録</ThemedText>
          <ThemedText style={[styles.cardDescription, { color: colors.subText }]}>
            タスクを作成して大学生に依頼できます
          </ThemedText>
          <View style={[styles.cardArrow, { backgroundColor: '#8b5cf6' }]}>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  cardArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
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
    padding: 12,
  },
  skipButtonText: {
    fontSize: 15,
  },
});
