import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ThemedView from '../components/themed-view';
import ThemedText from '../components/themed-text';
import { Colors } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';

const YEAR_OPTIONS = [1, 2, 3, 4, 5, 6];

export default function EditProfileScreen() {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [university, setUniversity] = useState('');
  const [faculty, setFaculty] = useState('');
  const [year, setYear] = useState<number | undefined>(undefined);
  const [bio, setBio] = useState('');
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const navigation = useNavigation();

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setUniversity(user.university || '');
      setFaculty(user.faculty || '');
      setYear(user.year);
      setBio(user.bio || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('エラー', '名前を入力してください');
      return;
    }
    if (!email.trim()) {
      Alert.alert('エラー', 'メールアドレスを入力してください');
      return;
    }

    setSaving(true);
    try {
      updateUser({
        name: name.trim(),
        email: email.trim(),
        university: university.trim() || undefined,
        faculty: faculty.trim() || undefined,
        year,
        bio: bio.trim() || undefined,
      });
      Alert.alert('完了', 'プロフィールを更新しました', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('エラー', 'プロフィールの更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const renderYearSelector = () => (
    <View style={styles.yearContainer}>
      {YEAR_OPTIONS.map((y) => (
        <TouchableOpacity
          key={y}
          style={[
            styles.yearButton,
            {
              backgroundColor: year === y ? colors.tint : colors.card,
              borderColor: year === y ? colors.tint : colors.border,
            },
          ]}
          onPress={() => setYear(y)}
        >
          <Text
            style={[
              styles.yearButtonText,
              { color: year === y ? '#fff' : colors.text },
            ]}
          >
            {y}年
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (!user) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText>ログインが必要です</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formSection}>
            <ThemedText style={styles.label}>名前 *</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={name}
              onChangeText={setName}
              placeholder="名前を入力"
              placeholderTextColor={colors.tabIconDefault}
            />
          </View>

          <View style={styles.formSection}>
            <ThemedText style={styles.label}>メールアドレス *</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={email}
              onChangeText={setEmail}
              placeholder="メールアドレスを入力"
              placeholderTextColor={colors.tabIconDefault}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formSection}>
            <ThemedText style={styles.label}>大学</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={university}
              onChangeText={setUniversity}
              placeholder="大学名を入力"
              placeholderTextColor={colors.tabIconDefault}
            />
          </View>

          <View style={styles.formSection}>
            <ThemedText style={styles.label}>学部・学科</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={faculty}
              onChangeText={setFaculty}
              placeholder="学部・学科を入力"
              placeholderTextColor={colors.tabIconDefault}
            />
          </View>

          <View style={styles.formSection}>
            <ThemedText style={styles.label}>学年</ThemedText>
            {renderYearSelector()}
          </View>

          <View style={styles.formSection}>
            <View style={styles.labelRow}>
              <ThemedText style={styles.label}>自己紹介</ThemedText>
              <Text style={[styles.charCount, { color: colors.tabIconDefault }]}>
                {bio.length}/200
              </Text>
            </View>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={bio}
              onChangeText={(text) => setBio(text.slice(0, 200))}
              placeholder="自己紹介を入力"
              placeholderTextColor={colors.tabIconDefault}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.tint }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>保存する</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  formSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
  },
  yearContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  yearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  yearButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
