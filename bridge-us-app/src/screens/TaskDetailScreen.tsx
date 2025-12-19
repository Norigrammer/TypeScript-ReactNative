import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';
import { getTaskById } from '../api/tasks';
import { Task } from '../types/task';

export default function TaskDetailScreen({ route }: any) {
  const taskId = route?.params?.taskId ?? 'unknown';
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getTaskById(taskId);
        setTask(data ?? null);
      } finally {
        setLoading(false);
      }
    })();
  }, [taskId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.container}>
        <Text>タスクが見つかりませんでした（ID: {taskId}）。</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{task.title}</Text>
      <Text style={styles.sub}>{task.company}</Text>
      {!!task.description && <Text style={{ marginTop: 8 }}>{task.description}</Text>}
      <View style={{ height: 16 }} />
      <Button title="このタスクに応募する" onPress={() => Alert.alert('応募しました', `タスク: ${task.id}`)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 20, fontWeight: 'bold' },
  sub: { marginTop: 8, color: '#666' },
});
