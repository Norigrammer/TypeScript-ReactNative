import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>プロフィール</Text>
      <Text style={styles.sub}>ユーザープロフィール機能は今後実装します。</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: 'bold' },
  sub: { marginTop: 6, color: '#666' },
});
