import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import ThemedView from '../components/themed-view';
import ThemedText from '../components/themed-text';
import { getTasks } from '../api/tasks';
import { Task } from '../types/task';

export default function TasksListScreen({ navigation }: any) {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getTasks();
        setTasks(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <ThemedView style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}> 
        <ActivityIndicator />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={tasks ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
          >
            <ThemedText style={styles.title}>{item.title}</ThemedText>
            <ThemedText style={styles.sub}>
              {item.company}{' '}
              {item.applied ? '（応募済み）' : ''}
            </ThemedText>
          </TouchableOpacity>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { padding: 16, borderRadius: 12, backgroundColor: '#f7f7f7', marginBottom: 12 },
  title: { fontSize: 16, fontWeight: 'bold' },
  sub: { marginTop: 4 },
});
