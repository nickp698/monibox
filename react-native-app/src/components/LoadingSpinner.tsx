import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { LightTheme as C, Spacing } from '../theme';

type Props = {
  message?: string;
  fullScreen?: boolean;
};

export default function LoadingSpinner({ message, fullScreen }: Props) {
  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <ActivityIndicator size="large" color={C.accent} />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.inline}>
      <ActivityIndicator size="small" color={C.accent} />
      {message && <Text style={styles.messageSmall}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.bg,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  message: { marginTop: Spacing.md, fontSize: 14, color: C.text2 },
  messageSmall: { marginLeft: Spacing.sm, fontSize: 13, color: C.text2 },
});
