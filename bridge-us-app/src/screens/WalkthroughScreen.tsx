import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  useColorScheme,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

const { width } = Dimensions.get('window');

interface SlideData {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

const slides: SlideData[] = [
  {
    id: '1',
    icon: 'briefcase-outline',
    title: 'タスクを見つけよう',
    description: '企業が出した様々なタスクから、\n興味のあるものを探してみましょう',
  },
  {
    id: '2',
    icon: 'paper-plane-outline',
    title: '応募してチャレンジ',
    description: 'タスクに応募して、\n企業と一緒にプロジェクトを進めましょう',
  },
  {
    id: '3',
    icon: 'chatbubbles-outline',
    title: '企業とつながる',
    description: 'チャットで企業と直接やりとり、\n実践的な経験を積みましょう',
  },
  {
    id: '4',
    icon: 'trophy-outline',
    title: 'スキルアップ＆報酬',
    description: 'タスク完了で報酬ゲット！\n社会経験とスキルを手に入れよう',
  },
];

export default function WalkthroughScreen({ navigation }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const onFinish = async () => {
    try {
      await AsyncStorage.setItem('hasSeenWalkthrough', 'true');
    } catch {}
    navigation.replace('MainTabs');
  };

  const onNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      onFinish();
    }
  };

  const onSkip = () => {
    onFinish();
  };

  const renderSlide = ({ item }: { item: SlideData }) => (
    <View style={[styles.slide, { width }]}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: colors.primary + '15' },
        ]}
      >
        <Ionicons name={item.icon} size={80} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.description, { color: colors.subText }]}>
        {item.description}
      </Text>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.pagination}>
      {slides.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor:
                index === currentIndex ? colors.primary : colors.border,
              width: index === currentIndex ? 24 : 8,
            },
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* スキップボタン */}
      <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
        <Text style={[styles.skipText, { color: colors.subText }]}>
          スキップ
        </Text>
      </TouchableOpacity>

      {/* スライド */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      {/* ページネーション */}
      {renderPagination()}

      {/* 次へ/はじめるボタン */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={onNext}
        >
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? 'はじめる' : '次へ'}
          </Text>
          <Ionicons
            name={
              currentIndex === slides.length - 1
                ? 'checkmark'
                : 'arrow-forward'
            }
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    fontSize: 15,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
