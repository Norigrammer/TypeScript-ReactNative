import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedView from '../../components/themed-view';
import ThemedText from '../../components/themed-text';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { isCompanyUser } from '../../types/user';

const COMPANY_PRIMARY = '#8b5cf6';

export default function CompanyProfileScreen({ navigation }: any) {
  const { user, isLoggedIn, logout } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // 未ログイン時の表示
  if (!isLoggedIn || !user || !isCompanyUser(user)) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.guestContainer}>
          <View style={[styles.guestIcon, { backgroundColor: COMPANY_PRIMARY + '15' }]}>
            <Ionicons name="business-outline" size={48} color={COMPANY_PRIMARY} />
          </View>
          <ThemedText style={styles.guestTitle}>企業マイページ</ThemedText>
          <ThemedText style={[styles.guestSubtitle, { color: colors.subText }]}>
            ログインして、タスクの管理や{'\n'}応募者とのチャットをご利用ください
          </ThemedText>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: COMPANY_PRIMARY }]}
            onPress={() => navigation.navigate('Auth', { screen: 'CompanyRegister' })}
            activeOpacity={0.8}
          >
            <Ionicons name="business" size={20} color="#fff" />
            <ThemedText style={styles.primaryButtonText}>新規登録</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: COMPANY_PRIMARY }]}
            onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
            activeOpacity={0.8}
          >
            <Ionicons name="log-in" size={20} color={COMPANY_PRIMARY} />
            <ThemedText style={[styles.secondaryButtonText, { color: COMPANY_PRIMARY }]}>
              ログイン
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* アバターセクション */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: COMPANY_PRIMARY }]}>
            {user.logoUrl ? (
              <ThemedText style={styles.avatarText}>
                {user.companyName.charAt(0)}
              </ThemedText>
            ) : (
              <Ionicons name="business" size={36} color="#fff" />
            )}
          </View>
          <ThemedText style={styles.companyName}>{user.companyName}</ThemedText>
          <ThemedText style={[styles.representativeName, { color: colors.subText }]}>
            担当者: {user.representativeName}
          </ThemedText>
          <TouchableOpacity
            style={[styles.editButton, { borderColor: COMPANY_PRIMARY }]}
            onPress={() => navigation.navigate('CompanyEditProfile')}
          >
            <Ionicons name="pencil" size={14} color={COMPANY_PRIMARY} />
            <ThemedText style={[styles.editButtonText, { color: COMPANY_PRIMARY }]}>
              編集
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* 統計セクション */}
        <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: COMPANY_PRIMARY }]}>
              {user.publishedTaskCount ?? 0}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.subText }]}>
              公開中タスク
            </ThemedText>
          </View>
        </View>

        {/* メニューセクション */}
        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('MyTasks')}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemContent}>
            <Ionicons name="briefcase-outline" size={22} color={COMPANY_PRIMARY} />
            <ThemedText style={styles.menuItemText}>タスク管理</ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.subText} />
        </TouchableOpacity>

        {/* プロフィール情報セクション */}
        <View style={[styles.infoSection, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>企業情報</ThemedText>

          <View style={styles.infoRow}>
            <ThemedText style={[styles.infoLabel, { color: colors.subText }]}>
              メールアドレス
            </ThemedText>
            <ThemedText style={styles.infoValue}>{user.email}</ThemedText>
          </View>

          {user.description && (
            <View style={styles.infoRow}>
              <ThemedText style={[styles.infoLabel, { color: colors.subText }]}>
                会社紹介
              </ThemedText>
              <ThemedText style={styles.infoValue}>{user.description}</ThemedText>
            </View>
          )}
        </View>

        {/* ログアウトボタン */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.card }]}
          onPress={logout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          <ThemedText style={styles.logoutButtonText}>ログアウト</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  // ゲスト表示用スタイル
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  guestIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  guestSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 52,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  // ログイン済み企業ユーザー用スタイル
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  companyName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  representativeName: {
    fontSize: 14,
    marginTop: 4,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
  },
  infoSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '500',
  },
});
