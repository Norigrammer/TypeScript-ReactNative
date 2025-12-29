import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedView from '../components/themed-view';
import ThemedText from '../components/themed-text';
import { Colors } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { isStudentUser } from '../types/user';

export default function ProfileScreen({ navigation }: any) {
  const { user, isLoggedIn, logout } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // 未ログイン時の表示
  if (!isLoggedIn || !user) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.guestContainer}>
          <View style={[styles.guestIcon, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="person-outline" size={48} color={colors.primary} />
          </View>
          <ThemedText style={styles.guestTitle}>マイページ</ThemedText>
          <ThemedText style={[styles.guestSubtitle, { color: colors.subText }]}>
            ログインして、タスクへの応募や{'\n'}お気に入り機能をお使いください
          </ThemedText>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.8}
          >
            <Ionicons name="person-add" size={20} color="#fff" />
            <ThemedText style={styles.primaryButtonText}>新規登録</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.primary }]}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Ionicons name="log-in" size={20} color={colors.primary} />
            <ThemedText style={[styles.secondaryButtonText, { color: colors.primary }]}>
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
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <ThemedText style={styles.avatarText}>
              {isStudentUser(user) ? user.name.charAt(0) : user.companyName.charAt(0)}
            </ThemedText>
          </View>
          <ThemedText style={styles.name}>{isStudentUser(user) ? user.name : user.companyName}</ThemedText>
          {isStudentUser(user) && user.university && (
            <ThemedText style={[styles.university, { color: colors.subText }]}>
              {user.university} {user.faculty}
            </ThemedText>
          )}
          <TouchableOpacity
            style={[styles.editButton, { borderColor: colors.primary }]}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Ionicons name="pencil" size={14} color={colors.primary} />
            <ThemedText style={[styles.editButtonText, { color: colors.primary }]}>
              編集
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* 統計セクション */}
        <TouchableOpacity
          style={[styles.statsContainer, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('MyApplications')}
          activeOpacity={0.7}
        >
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: colors.primary }]}>
              {isStudentUser(user) ? user.appliedTaskCount : 0}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.subText }]}>
              応募中
            </ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: colors.primary }]}>
              {isStudentUser(user) ? user.completedTaskCount : 0}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.subText }]}>
              完了済み
            </ThemedText>
          </View>
          <View style={styles.arrowContainer}>
            <ThemedText style={[styles.arrow, { color: colors.subText }]}>→</ThemedText>
          </View>
        </TouchableOpacity>

        {/* メニューセクション */}
        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('Favorites')}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemContent}>
            <Ionicons name="heart-outline" size={22} color={colors.primary} />
            <ThemedText style={styles.menuItemText}>お気に入り</ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.subText} />
        </TouchableOpacity>

        {/* プロフィール情報セクション */}
        <View style={[styles.infoSection, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>プロフィール情報</ThemedText>

          <View style={styles.infoRow}>
            <ThemedText style={[styles.infoLabel, { color: colors.subText }]}>
              メールアドレス
            </ThemedText>
            <ThemedText style={styles.infoValue}>{user.email}</ThemedText>
          </View>

          {isStudentUser(user) && user.year && (
            <View style={styles.infoRow}>
              <ThemedText style={[styles.infoLabel, { color: colors.subText }]}>
                学年
              </ThemedText>
              <ThemedText style={styles.infoValue}>{user.year}年生</ThemedText>
            </View>
          )}

          {isStudentUser(user) && user.bio && (
            <View style={styles.infoRow}>
              <ThemedText style={[styles.infoLabel, { color: colors.subText }]}>
                自己紹介
              </ThemedText>
              <ThemedText style={styles.infoValue}>{user.bio}</ThemedText>
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
  // ログイン済みユーザー用スタイル
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
  name: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  university: {
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
  },
  statItem: {
    flex: 1,
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
  statDivider: {
    width: 1,
    marginHorizontal: 16,
  },
  arrowContainer: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -10,
  },
  arrow: {
    fontSize: 20,
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
