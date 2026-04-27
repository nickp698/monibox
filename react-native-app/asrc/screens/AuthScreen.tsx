import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { signInWithEmail, signUpWithEmail } from '../services/supabase';
import { LightTheme as C, Spacing, Radius } from '../theme/colors';

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, fullName);
        Alert.alert('Check your email', 'We sent you a confirmation link.');
      } else {
        await signInWithEmail(email, password);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrap}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        {/* Logo */}
        <View style={styles.logoMark}>
          <Text style={styles.logoText}>M</Text>
        </View>
        <Text style={styles.title}>Monibox</Text>
        <Text style={styles.subtitle}>Your finances in one place</Text>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, !isSignUp && styles.tabActive]}
            onPress={() => setIsSignUp(false)}
          >
            <Text style={[styles.tabText, !isSignUp && styles.tabTextActive]}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, isSignUp && styles.tabActive]}
            onPress={() => setIsSignUp(true)}
          >
            <Text style={[styles.tabText, isSignUp && styles.tabTextActive]}>Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        {isSignUp && (
          <TextInput
            style={styles.input}
            placeholder="Full name"
            placeholderTextColor={C.text3}
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={C.text3}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={C.text3}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: '#1a2e23',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: 28,
    width: '100%',
    maxWidth: 420,
  },
  logoMark: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#1a2e23',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 10,
  },
  logoText: { color: '#fff', fontSize: 22, fontWeight: '300' },
  title: { textAlign: 'center', fontSize: 24, fontWeight: '400', color: C.text },
  subtitle: { textAlign: 'center', fontSize: 13, color: C.text2, marginTop: 4, marginBottom: 24 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: C.surface2,
    borderRadius: Radius.sm,
    padding: 4,
    marginBottom: 24,
  },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  tabActive: { backgroundColor: '#fff' },
  tabText: { fontSize: 14, fontWeight: '500', color: C.text2 },
  tabTextActive: { color: C.text },
  input: {
    backgroundColor: C.surface2,
    borderRadius: Radius.sm,
    padding: 14,
    fontSize: 15,
    color: C.text,
    marginBottom: 12,
  },
  button: {
    backgroundColor: C.accent,
    borderRadius: Radius.sm,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
