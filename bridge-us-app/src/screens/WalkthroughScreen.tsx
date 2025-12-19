import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WalkthroughScreen({ navigation }: any) {
  const onStart = async () => {
    try {
      await AsyncStorage.setItem('hasSeenWalkthrough', 'true');
    } catch {}
    navigation.replace('MainTabs');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bridge Us App へようこそ</Text>
      <Text style={styles.subtitle}>企業のタスクに参加して、社会との接点をつくろう！</Text>
      <Button title="はじめる" onPress={onStart} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 16 },
});
