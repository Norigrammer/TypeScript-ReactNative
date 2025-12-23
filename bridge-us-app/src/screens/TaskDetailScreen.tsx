import React, { useEffect, useState } from 'react';
import { StyleSheet, Button, Alert, ActivityIndicator, View } from 'react-native';
import ThemedView from '../components/themed-view';
import ThemedText from '../components/themed-text';
import { getTaskById, applyToTask, unapplyTask } from '../api/tasks';
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
      <ThemedView style={styles.container}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (!task) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>タスクが見つかりませんでした（ID: {taskId}）。</ThemedText>
      </ThemedView>
    );
  }

  const onToggleApply = async () => {
    try {
      if (task.applied) {
        await unapplyTask(task.id);
        setTask({ ...task, applied: false });
        Alert.alert('応募を取り消しました', `タスク: ${task.id}`);
      } else {
        await applyToTask(task.id);
        setTask({ ...task, applied: true });
        Alert.alert('応募しました', `タスク: ${task.id}`);
      }
    } catch {}
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>{task.title}</ThemedText>
      <ThemedText style={styles.sub}>{task.company}</ThemedText>
      {!!task.description && <ThemedText style={{ marginTop: 8 }}>{task.description}</ThemedText>}
      <View style={{ height: 16 }} />
      <Button title={task.applied ? '応募を取り消す' : 'このタスクに応募する'} onPress={onToggleApply} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 20, fontWeight: 'bold' },
  sub: { marginTop: 8 },
});
