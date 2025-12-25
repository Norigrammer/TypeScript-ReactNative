import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedView from '../../components/themed-view';
import ThemedText from '../../components/themed-text';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { isCompanyUser } from '../../types/user';
import { Application, ApplicationStatus } from '../../types/application';
import {
  subscribeTaskApplications,
  approveApplication,
  rejectApplication,
} from '../../api/applications-firebase';

const COMPANY_PRIMARY = '#8b5cf6';

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: '審査中',
  approved: '承認済み',
  rejected: '見送り',
  completed: '完了',
};

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  pending: '#f59e0b',
  approved: '#10b981',
  rejected: '#6b7280',
  completed: '#3b82f6',
};

interface Props {
  route: {
    params: {
      taskId: string;
      taskTitle: string;
    };
  };
  navigation: any;
}

export default function TaskApplicationsScreen({ route, navigation }: Props) {
  const { taskId, taskTitle } = route.params;
  const { user } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [applications, setApplications] = useState<Application[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({ title: `応募者 - ${taskTitle}` });
  }, [navigation, taskTitle]);

  useEffect(() => {
    const unsubscribe = subscribeTaskApplications(taskId, (updatedApplications) => {
      setApplications(updatedApplications);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, [taskId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
  }, []);

  const handleApprove = async (application: Application) => {
    if (!user || !isCompanyUser(user)) return;

    Alert.alert(
      '応募を承認',
      `${application.studentName}さんの応募を承認しますか？承認するとチャットが開始されます。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '承認',
          onPress: async () => {
            setProcessingId(application.id);
            try {
              const chatRoomId = await approveApplication(
                application.id,
                user.id,
                user.companyName,
                taskId,
                taskTitle
              );
              Alert.alert('承認完了', 'チャットでメッセージを送りましょう', [
                {
                  text: 'チャットを開く',
                  onPress: () => navigation.navigate('Chat', {
                    screen: 'ChatRoom',
                    params: { chatRoomId, title: application.studentName },
                  }),
                },
                { text: '閉じる' },
              ]);
            } catch (err) {
              Alert.alert('エラー', '承認に失敗しました');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleReject = async (application: Application) => {
    if (!user || !isCompanyUser(user)) return;

    Alert.alert(
      '応募を見送り',
      `${application.studentName}さんの応募を見送りますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '見送り',
          style: 'destructive',
          onPress: async () => {
            setProcessingId(application.id);
            try {
              await rejectApplication(
                application.id,
                taskTitle,
                user.companyName
              );
            } catch (err) {
              Alert.alert('エラー', '処理に失敗しました');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const renderApplicationItem = ({ item }: { item: Application }) => {
    const isPending = item.status === 'pending';
    const isProcessing = processingId === item.id;

    return (
      <View style={[styles.applicationCard, { backgroundColor: colors.card }]}>
        <View style={styles.applicantHeader}>
          <View style={styles.applicantInfo}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <ThemedText style={styles.avatarText}>
                {item.studentName.charAt(0)}
              </ThemedText>
            </View>
            <View style={styles.applicantDetails}>
              <ThemedText style={styles.applicantName}>{item.studentName}</ThemedText>
              {item.studentUniversity && (
                <ThemedText style={[styles.applicantMeta, { color: colors.subText }]}>
                  {item.studentUniversity}
                  {item.studentYear && ` ${item.studentYear}年`}
                </ThemedText>
              )}
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}>
            <ThemedText style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
              {STATUS_LABELS[item.status]}
            </ThemedText>
          </View>
        </View>

        {item.message && (
          <View style={[styles.messageContainer, { backgroundColor: colors.background }]}>
            <ThemedText style={[styles.messageLabel, { color: colors.subText }]}>
              応募メッセージ
            </ThemedText>
            <ThemedText style={styles.messageText}>{item.message}</ThemedText>
          </View>
        )}

        <View style={styles.applicationMeta}>
          <Ionicons name="time-outline" size={14} color={colors.subText} />
          <ThemedText style={[styles.metaText, { color: colors.subText }]}>
            応募日: {new Date(item.appliedAt).toLocaleDateString('ja-JP')}
          </ThemedText>
        </View>

        {isPending && (
          <View style={styles.actionButtons}>
            {isProcessing ? (
              <ActivityIndicator color={COMPANY_PRIMARY} />
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.rejectButton, { borderColor: colors.border }]}
                  onPress={() => handleReject(item)}
                >
                  <Ionicons name="close" size={18} color="#6b7280" />
                  <ThemedText style={[styles.rejectButtonText, { color: '#6b7280' }]}>
                    見送り
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.approveButton, { backgroundColor: COMPANY_PRIMARY }]}
                  onPress={() => handleApprove(item)}
                >
                  <Ionicons name="checkmark" size={18} color="#fff" />
                  <ThemedText style={styles.approveButtonText}>承認</ThemedText>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.card }]}>
        <Ionicons name="people-outline" size={48} color={colors.subText} />
      </View>
      <ThemedText style={styles.emptyTitle}>応募者がいません</ThemedText>
      <ThemedText style={[styles.emptySubtitle, { color: colors.subText }]}>
        まだこのタスクへの応募はありません
      </ThemedText>
    </View>
  );

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COMPANY_PRIMARY} />
        </View>
      </ThemedView>
    );
  }

  const pendingCount = applications.filter((a) => a.status === 'pending').length;
  const approvedCount = applications.filter((a) => a.status === 'approved').length;

  return (
    <ThemedView style={styles.container}>
      {/* サマリーヘッダー */}
      {applications.length > 0 && (
        <View style={[styles.summaryHeader, { backgroundColor: colors.card }]}>
          <View style={styles.summaryItem}>
            <ThemedText style={[styles.summaryNumber, { color: '#f59e0b' }]}>
              {pendingCount}
            </ThemedText>
            <ThemedText style={[styles.summaryLabel, { color: colors.subText }]}>
              審査待ち
            </ThemedText>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryItem}>
            <ThemedText style={[styles.summaryNumber, { color: '#10b981' }]}>
              {approvedCount}
            </ThemedText>
            <ThemedText style={[styles.summaryLabel, { color: colors.subText }]}>
              承認済み
            </ThemedText>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryItem}>
            <ThemedText style={[styles.summaryNumber, { color: colors.text }]}>
              {applications.length}
            </ThemedText>
            <ThemedText style={[styles.summaryLabel, { color: colors.subText }]}>
              合計
            </ThemedText>
          </View>
        </View>
      )}

      <FlatList
        data={applications}
        renderItem={renderApplicationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          applications.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyList}
      />
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
  summaryHeader: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    marginHorizontal: 8,
  },
  listContent: {
    padding: 16,
  },
  emptyListContent: {
    flex: 1,
  },
  applicationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  applicantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  applicantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  applicantDetails: {
    flex: 1,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: '600',
  },
  applicantMeta: {
    fontSize: 13,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  messageContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  messageLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  applicationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  metaText: {
    fontSize: 13,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  approveButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
