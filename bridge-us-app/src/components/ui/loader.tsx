import React from 'react';
import { ActivityIndicator, View, ViewProps } from 'react-native';

export default function Loader(props: ViewProps) {
  return (
    <View {...props} style={[{ flex: 1, alignItems: 'center', justifyContent: 'center' }, props.style]}>
      <ActivityIndicator />
    </View>
  );
}
