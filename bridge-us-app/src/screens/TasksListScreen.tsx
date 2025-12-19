import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
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
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}> 
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.sub}>{item.company}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  card: { padding: 16, borderRadius: 12, backgroundColor: '#f7f7f7', marginBottom: 12 },
  title: { fontSize: 16, fontWeight: 'bold' },
  sub: { marginTop: 4, color: '#666' },
});
