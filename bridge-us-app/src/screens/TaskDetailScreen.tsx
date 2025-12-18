import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';

export default function TaskDetailScreen({ route }: any) {
  const taskId = route?.params?.taskId ?? 'unknown';
  return (
    <View style={styles.container}>
      <Text style={styles.title}>タスク詳細</Text>
      <Text style={styles.sub}>ID: {taskId}</Text>
      <View style={{ height: 16 }} />
      <Button title="このタスクに応募する" onPress={() => Alert.alert('応募しました', `タスク: ${taskId}`)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 20, fontWeight: 'bold' },
  sub: { marginTop: 8, color: '#666' },
});
