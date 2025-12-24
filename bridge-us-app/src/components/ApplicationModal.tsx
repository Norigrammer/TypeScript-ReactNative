import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

interface ApplicationModalProps {
  visible: boolean;
  taskTitle: string;
  companyName: string;
  onClose: () => void;
  onSubmit: (message: string) => Promise<void>;
}

export default function ApplicationModal({
  visible,
  taskTitle,
  companyName,
  onClose,
  onSubmit,
}: ApplicationModalProps) {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(message);
      setMessage('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setMessage('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <View
                style={[
                  styles.modalContainer,
                  { backgroundColor: colors.background },
                ]}
              >
                {/* ヘッダー */}
                <View style={styles.header}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: colors.primary + '15' },
                    ]}
                  >
                    <Ionicons name="paper-plane" size={24} color={colors.primary} />
                  </View>
                  <Text style={[styles.title, { color: colors.text }]}>
                    応募確認
                  </Text>
                </View>

                {/* タスク情報 */}
                <View
                  style={[
                    styles.taskInfo,
                    { backgroundColor: colors.card },
                  ]}
                >
                  <Text style={[styles.taskTitle, { color: colors.text }]}>
                    {taskTitle}
                  </Text>
                  <Text style={[styles.companyName, { color: colors.subText }]}>
                    {companyName}
                  </Text>
                </View>

                {/* 確認メッセージ */}
                <Text style={[styles.confirmText, { color: colors.text }]}>
                  このタスクに応募しますか？
                </Text>

                {/* メッセージ入力 */}
                <View style={styles.inputSection}>
                  <Text style={[styles.inputLabel, { color: colors.subText }]}>
                    応募メッセージ（任意）
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    placeholder="自己PRや意気込みを入力..."
                    placeholderTextColor={colors.subText}
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    numberOfLines={4}
                    maxLength={300}
                    textAlignVertical="top"
                    editable={!submitting}
                  />
                  <Text style={[styles.charCount, { color: colors.subText }]}>
                    {message.length}/300
                  </Text>
                </View>

                {/* ボタン */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.cancelButton,
                      { borderColor: colors.border },
                    ]}
                    onPress={handleClose}
                    disabled={submitting}
                  >
                    <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                      キャンセル
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.submitButton,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="checkmark" size={18} color="#fff" />
                        <Text style={styles.submitButtonText}>応募する</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  taskInfo: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
  },
  confirmText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  submitButton: {},
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
