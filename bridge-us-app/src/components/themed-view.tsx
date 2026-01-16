import React from 'react';
import { View, ViewProps } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';

export default function ThemedView({ style, ...props }: ViewProps) {
  const colors = useThemeColor();
  return <View {...props} style={[{ backgroundColor: colors.background }, style]} />;
}
