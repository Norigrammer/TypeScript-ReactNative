import React from 'react';
import { Text, TextProps } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';

export default function ThemedText({ style, ...props }: TextProps) {
  const colors = useThemeColor();
  return <Text {...props} style={[{ color: colors.text }, style]} />;
}
