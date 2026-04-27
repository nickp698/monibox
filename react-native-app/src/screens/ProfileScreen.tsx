import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { LightTheme as C, Spacing, Radius } from '../theme/colors';

type ThemeMode = 'light' | 'dark' | 'system';

export default function ProfileScreen() {
  const { user } = useAuth();
  const { mode, setMode } = useTheme();
  const [showThemePicker, setShowThemePicker] = useState(false);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const themeModes: { key: ThemeMode; label: string }[] = [
    { key: 'system', label: 'System Default' },
    { key: 'light', label: 'Light' },
    { key: 'dark', label: 'Dark' },
  ];

  const handleExport = () => {
    Alert.alert(
      'Export Data',
      'This will prepare a CSV export of all your vault data.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => {
          // TODO: Implement CSV export via Supabase
          Alert.alert('Coming Soon', 'Data export will be available in the next update.');
        }},
      ]
    );
  };

  const handleSupport = () => {
    Linking.openURL('mailto:support@monibox.ai?subject=Help%20Request');
  };

  const handleSubscription = () => {
    // Open iOS subscription management
    Linking.openURL('https://apps.apple.com/account/subscriptions');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profile</Text>

        {/* User card */}
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.user_metadata?.full_name || 'U')[0].toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{user?.user_metadata?.full_name || 'User'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* Settings list */}
        <View style={styles.settingsCard}>
          {/* Appearance */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowThemePicker(!showThemePicker)}
          >
            <Text style={styles.settingText}>Appearance</Text>
            <Text style={styles.settingValue}>
              {themeModes.find((t) => t.key === mode)?.label}
            </Text>
          </TouchableOpacity>

          {showThemePicker && (
            <View style={styles.themePicker}>
              {themeModes.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.themeOption, mode === t.key && styles.themeOptionActive]}
                  onPress={() => {
                    setMode(t.key);
                    setShowThemePicker(false);
                  }}
                >
                  <Text style={[styles.themeOptionText, mode === t.key && styles.themeOptionTextActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingText}>Notifications</Text>
            <Text style={styles.settingValue}>On</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingText}>Currency</Text>
            <Text style={styles.settingValue}>GBP (\u00a3)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow} onPress={handleExport}>
            <Text style={styles.settingText}>Export Data</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow} onPress={handleSubscription}>
            <Text style={styles.settingText}>Manage Subscription</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingRow, styles.settingRowLast]} onPress={handleSupport}>
            <Text style={styles.settingText}>Help & Support</Text>
          </TouchableOpacity>
        </View>

        {/* App info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>Monibox v1.0.0</Text>
          <Text style={styles.infoSub}>Your personal finance vault</Text>
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: Spacing.lg },
  title: { fontSize: 26, fontWeight: '300', color: C.text, marginBottom: Spacing.lg },
  card: {
    backgroundColor: C.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '500' },
  name: { fontSize: 18, fontWeight: '500', color: C.text },
  email: { fontSize: 14, color: C.text2, marginTop: 4 },
  settingsCard: {
    backgroundColor: C.surface,
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  settingRowLast: { borderBottomWidth: 0 },
  settingText: { fontSize: 15, color: C.text },
  settingValue: { fontSize: 14, color: C.text3 },

  themePicker: {
    flexDirection: 'row',
    padding: Spacing.md,
    paddingTop: 0,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  themeOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    backgroundColor: C.surface2,
    alignItems: 'center',
  },
  themeOptionActive: { backgroundColor: C.accent },
  themeOptionText: { fontSize: 13, color: C.text2, fontWeight: '500' },
  themeOptionTextActive: { color: '#fff' },

  infoCard: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  infoText: { fontSize: 13, color: C.text3 },
  infoSub: { fontSize: 12, color: C.text3, marginTop: 2 },

  signOutBtn: {
    padding: Spacing.lg,
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: Radius.md,
  },
  signOutText: { color: C.red, fontSize: 15, fontWeight: '500' },
});
