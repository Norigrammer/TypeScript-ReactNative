import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  ActivityIndicator,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ThemedView from '../components/themed-view';
import ThemedText from '../components/themed-text';
import { getCurrentUser } from '../api/user';
import { User } from '../types/user';
import { Colors } from '../constants/theme';

export default function ProfileScreen({ navigation }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const fetchUser = useCallback(async () => {
    try {
      const data = await getCurrentUser();
      setUser(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUser();
    }, [fetchUser])
  );

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ThemedView>
    );
  }

  if (!user) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>ユーザー情報の取得に失敗しました。</ThemedText>
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
              {user.name.charAt(0)}
            </ThemedText>
          </View>
          <ThemedText style={styles.name}>{user.name}</ThemedText>
          {user.university && (
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
              {user.appliedTaskCount}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.subText }]}>
              応募中
            </ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: colors.primary }]}>
              {user.completedTaskCount}
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

          {user.year && (
            <View style={styles.infoRow}>
              <ThemedText style={[styles.infoLabel, { color: colors.subText }]}>
                学年
              </ThemedText>
              <ThemedText style={styles.infoValue}>{user.year}年生</ThemedText>
            </View>
          )}

          {user.bio && (
            <View style={styles.infoRow}>
              <ThemedText style={[styles.infoLabel, { color: colors.subText }]}>
                自己紹介
              </ThemedText>
              <ThemedText style={styles.infoValue}>{user.bio}</ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
  },
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
});
