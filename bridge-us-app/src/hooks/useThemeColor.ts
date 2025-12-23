import { useColorScheme } from 'react-native';
import { Colors } from '../constants/theme';

export function useThemeColor() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? Colors.dark : Colors.light;
  return theme;
}
