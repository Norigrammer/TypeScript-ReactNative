import React, { useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  View,
  RefreshControl,
  useColorScheme,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedView from '../components/themed-view';
import ThemedText from '../components/themed-text';
import ErrorView from '../components/ErrorView';
import { subscribeTasks } from '../api/tasks-firebase';
import { Task } from '../types/task';
import { Colors } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';

const CATEGORIES = ['すべて', 'データ入力', 'リサーチ', 'デザイン', 'ライティング', '翻訳'];

export default function TasksListScreen({ navigation }: any) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('すべて');
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeTasks(user?.id ?? null, (data) => {
      setTasks(data);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    // Firestore onSnapshot will push updates automatically
  };

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];

    return tasks.filter((task) => {
      // 公開中のタスクのみ表示（インデックス未作成時のフォールバック）
      if (task.status !== 'published') return false;

      const matchesSearch =
        searchQuery === '' ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.company.toLowerCase().includes(searchQuery.toLowerCase());

      const taskCategories = task.categories && task.categories.length > 0
        ? task.categories
        : (task.category ? [task.category] : []);
      const matchesCategory =
        selectedCategory === 'すべて' || taskCategories.includes(selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }, [tasks, searchQuery, selectedCategory]);

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ErrorView
          title="読み込みエラー"
          message={error}
          onRetry={() => {
            setLoading(true);
            setError(null);
          }}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* 検索バー */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.searchIcon}>🔍</ThemedText>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="タスクを検索..."
            placeholderTextColor={colors.subText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <ThemedText style={[styles.clearButton, { color: colors.subText }]}>✕</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* カテゴリフィルター */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.card,
                  },
                ]}
                onPress={() => setSelectedCategory(category)}
                activeOpacity={0.7}
              >
                <ThemedText
                  style={[
                    styles.filterChipText,
                    { color: isSelected ? '#ffffff' : colors.text },
                  ]}
                >
                  {category}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 結果件数 */}
      <View style={styles.resultCount}>
        <ThemedText style={[styles.resultCountText, { color: colors.subText }]}>
          {filteredTasks.length}件のタスク
        </ThemedText>
      </View>

      {/* タスク一覧 */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              該当するタスクがありません
            </ThemedText>
            <ThemedText style={[styles.emptySubText, { color: colors.subText }]}>
              検索条件を変更してください
            </ThemedText>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
            activeOpacity={0.7}
          >
            {/* ヘッダー: カテゴリ + 応募状態 + お気に入り */}
            <View style={styles.cardHeader}>
              <View style={styles.badgeContainer}>
                {(item.categories && item.categories.length > 0 ? item.categories : (item.category ? [item.category] : [])).map((cat) => (
                  <View key={cat} style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
                    <ThemedText style={[styles.categoryText, { color: colors.primary }]}>
                      {cat}
                    </ThemedText>
                  </View>
                ))}
                {item.applied && (
                  <View style={[styles.appliedBadge, { backgroundColor: '#10b98120' }]}>
                    <ThemedText style={styles.appliedText}>応募済み</ThemedText>
                  </View>
                )}
              </View>
              {item.favorited && (
                <Ionicons name="heart" size={18} color="#ef4444" />
              )}
            </View>

            {/* タイトル + 企業名 */}
            <ThemedText style={styles.title}>{item.title}</ThemedText>
            <ThemedText style={[styles.company, { color: colors.subText }]}>
              {item.company}
            </ThemedText>

            {/* フッター: 締切 + 報酬 */}
            <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
              {item.deadline && (
                <View style={styles.deadlineContainer}>
                  <ThemedText style={[styles.deadlineLabel, { color: colors.subText }]}>
                    締切
                  </ThemedText>
                  <ThemedText style={[styles.deadline, { color: colors.text }]}>
                    {item.deadline}
                  </ThemedText>
                </View>
              )}
              {item.reward && (
                <ThemedText style={[styles.reward, { color: colors.primary }]}>
                  {item.reward}
                </ThemedText>
              )}
            </View>
          </TouchableOpacity>
        )}
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
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  clearButton: {
    fontSize: 16,
    padding: 4,
  },
  filterSection: {
    paddingBottom: 8,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultCount: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  resultCountText: {
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  appliedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  appliedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  company: {
    fontSize: 14,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deadlineLabel: {
    fontSize: 12,
  },
  deadline: {
    fontSize: 14,
    fontWeight: '500',
  },
  reward: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
