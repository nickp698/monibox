import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LightTheme as C, Spacing, Radius } from '../theme';

type Props = {
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function EmptyState({ icon, title, message, actionLabel, onAction }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: Spacing.xl, paddingTop: 60 },
  icon: { fontSize: 48, marginBottom: Spacing.md },
  title: { fontSize: 20, fontWeight: '500', color: C.text, marginBottom: Spacing.sm },
  message: { fontSize: 14, color: C.text2, textAlign: 'center', lineHeight: 20, maxWidth: 280 },
  button: {
    marginTop: Spacing.lg,
    backgroundColor: C.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: Radius.sm,
  },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
