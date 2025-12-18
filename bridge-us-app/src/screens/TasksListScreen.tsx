import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const mockTasks = Array.from({ length: 10 }).map((_, i) => ({
  id: `task-${i + 1}`,
  title: `おねがいタスク ${i + 1}`,
  company: `サンプル企業 ${i + 1}`,
}));

export default function TasksListScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <FlatList
        data={mockTasks}
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
