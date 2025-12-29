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
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ThemedView from '../components/themed-view';
import ThemedText from '../components/themed-text';
import { Colors } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { isStudentUser } from '../types/user';
import {
  STUDENT_AVATARS,
  getStudentAvatarSource,
  DEFAULT_STUDENT_AVATAR_ID,
} from '../constants/avatars';

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
  const [avatarId, setAvatarId] = useState<number>(DEFAULT_STUDENT_AVATAR_ID);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const navigation = useNavigation();

    useEffect(() => {
    if (user && isStudentUser(user)) {
      setName(user.name);
      setEmail(user.email);
      setUniversity(user.university || '');
      setFaculty(user.faculty || '');
      setYear(user.year);
      setBio(user.bio || '');
      setAvatarId(user.avatarId ?? DEFAULT_STUDENT_AVATAR_ID);
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
      await updateUser({
        name: name.trim(),
        email: email.trim(),
        university: university.trim() || undefined,
        faculty: faculty.trim() || undefined,
        year,
        bio: bio.trim() || undefined,
        avatarId,
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

  
  const renderAvatarSelector = () => (
    <View style={styles.avatarSection}>
      <View style={styles.currentAvatarContainer}>
        <Image
          source={getStudentAvatarSource(avatarId)}
          style={styles.currentAvatar}
        />
      </View>
      <ThemedText style={styles.avatarHint}>アイコンを選択</ThemedText>
      <View style={styles.avatarGrid}>
        {STUDENT_AVATARS.map((avatar) => (
          <TouchableOpacity
            key={avatar.id}
            style={[
              styles.avatarOption,
              {
                borderColor: avatarId === avatar.id ? colors.tint : colors.border,
                borderWidth: avatarId === avatar.id ? 3 : 1,
              },
            ]}
            onPress={() => setAvatarId(avatar.id)}
          >
            <Image source={avatar.source} style={styles.avatarOptionImage} />
            {avatarId === avatar.id && (
              <View style={[styles.avatarCheckmark, { backgroundColor: colors.tint }]}>
                <Ionicons name="checkmark" size={12} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

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
            <ThemedText style={styles.label}>プロフィールアイコン</ThemedText>
            {renderAvatarSelector()}
          </View>

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
  avatarSection: {
    alignItems: 'center',
  },
  currentAvatarContainer: {
    marginBottom: 12,
  },
  currentAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarHint: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 12,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  avatarOption: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
  },
  avatarOptionImage: {
    width: '100%',
    height: '100%',
  },
  avatarCheckmark: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
