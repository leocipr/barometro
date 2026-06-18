import { Colors } from '../constants/theme';
import { useColorScheme } from './use-color-scheme';

export function useThemeColor(colorName: string) {
  const theme = useColorScheme()
  const colorScheme = theme ?? 'light'
  
  return Colors[colorScheme][colorName as keyof typeof Colors['light']];
}
