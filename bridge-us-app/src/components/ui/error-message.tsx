import React from 'react';
import { View, Text, ViewProps } from 'react-native';

export default function ErrorMessage({ children, ...props }: ViewProps & { children?: React.ReactNode }) {
  return (
    <View {...props} style={[{ padding: 12 }, props.style]}>
      <Text style={{ color: '#ef4444' }}>{children ?? '問題が発生しました。'}</Text>
    </View>
  );
}
