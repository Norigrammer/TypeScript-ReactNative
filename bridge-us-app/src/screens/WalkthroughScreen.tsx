import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

export default function WalkthroughScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bridge Us App へようこそ</Text>
      <Text style={styles.subtitle}>企業のタスクに参加して、社会との接点をつくろう！</Text>
      <Button title="はじめる" onPress={() => navigation.replace('MainTabs')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 16 },
});
