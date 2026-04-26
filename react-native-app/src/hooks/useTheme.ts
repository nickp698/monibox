import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LightTheme, DarkTheme } from '../theme/colors';

type ThemeMode = 'light' | 'dark' | 'system';

type ThemeContextType = {
  colors: typeof LightTheme;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
};

const STORAGE_KEY = '@monibox_theme';

export function useThemeProvider() {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setModeState(stored);
      }
    });
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    AsyncStorage.setItem(STORAGE_KEY, newMode);
  }, []);

  const isDark =
    mode === 'dark' || (mode === 'system' && systemScheme === 'dark');

  const colors = isDark ? DarkTheme : LightTheme;

  return { colors, mode, isDark, setMode };
}

// Context for use in deeply nested components
export const ThemeContext = createContext<ThemeContextType>({
  colors: LightTheme,
  mode: 'system',
  isDark: false,
  setMode: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}
