import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedView from '../components/themed-view';
import ThemedText from '../components/themed-text';
import { Colors } from '../constants/theme';
import { getCompanyProfile } from '../api/users-firebase';
import { CompanyUser } from '../types/user';

const COMPANY_PRIMARY = '#8b5cf6';

interface Props {
  route: {
    params: {
      companyId: string;
    };
  };
  navigation: any;
}

export default function CompanyProfileViewScreen({ route, navigation }: Props) {
  const { companyId } = route.params;
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [company, setCompany] = useState<CompanyUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCompanyProfile = async () => {
      try {
        setLoading(true);
        const profile = await getCompanyProfile(companyId);
        if (profile) {
          setCompany(profile);
          navigation.setOptions({ title: profile.companyName });
        } else {
          setError('企業情報が見つかりません');
        }
      } catch (err) {
        setError('企業情報の読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadCompanyProfile();
  }, [companyId, navigation]);

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COMPANY_PRIMARY} />
        </View>
      </ThemedView>
    );
  }

  if (error || !company) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.subText} />
          <ThemedText style={[styles.errorText, { color: colors.subText }]}>
            {error ?? '企業情報が見つかりません'}
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ヘッダーセクション */}
        <View style={styles.headerSection}>
          <View style={[styles.avatar, { backgroundColor: COMPANY_PRIMARY }]}>
            {company.logoUrl ? (
              <ThemedText style={styles.avatarText}>
                {company.companyName.charAt(0)}
              </ThemedText>
            ) : (
              <Ionicons name="business" size={40} color="#fff" />
            )}
          </View>
          <ThemedText style={styles.companyName}>{company.companyName}</ThemedText>
          <View style={styles.statsRow}>
            <View style={[styles.statBadge, { backgroundColor: COMPANY_PRIMARY + '15' }]}>
              <Ionicons name="briefcase-outline" size={14} color={COMPANY_PRIMARY} />
              <ThemedText style={[styles.statText, { color: COMPANY_PRIMARY }]}>
                タスク {company.publishedTaskCount ?? 0}件
              </ThemedText>
            </View>
          </View>
        </View>

        {/* 企業情報セクション */}
        <View style={[styles.infoSection, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>企業情報</ThemedText>

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="person-outline" size={18} color={colors.subText} />
            </View>
            <View style={styles.infoContent}>
              <ThemedText style={[styles.infoLabel, { color: colors.subText }]}>
                担当者
              </ThemedText>
              <ThemedText style={styles.infoValue}>
                {company.representativeName}
              </ThemedText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="mail-outline" size={18} color={colors.subText} />
            </View>
            <View style={styles.infoContent}>
              <ThemedText style={[styles.infoLabel, { color: colors.subText }]}>
                連絡先
              </ThemedText>
              <ThemedText style={styles.infoValue}>{company.email}</ThemedText>
            </View>
          </View>
        </View>

        {/* 会社紹介セクション */}
        {company.description && (
          <View style={[styles.descriptionSection, { backgroundColor: colors.card }]}>
            <ThemedText style={styles.sectionTitle}>会社紹介</ThemedText>
            <ThemedText style={[styles.descriptionText, { color: colors.text }]}>
              {company.description}
            </ThemedText>
          </View>
        )}

        {/* 注意書き */}
        <View style={styles.noticeContainer}>
          <Ionicons name="information-circle-outline" size={16} color={colors.subText} />
          <ThemedText style={[styles.noticeText, { color: colors.subText }]}>
            タスクに応募すると、この企業からのメッセージを受け取ることができます
          </ThemedText>
        </View>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statText: {
    fontSize: 13,
    fontWeight: '500',
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoIconContainer: {
    width: 32,
    height: 24,
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
  },
  descriptionSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
  },
  noticeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
    gap: 8,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
});
