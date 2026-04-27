import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://api.monibox.ai';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtdGlzcXp1Z3J3YXNscHVtcWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzOTk4NTYsImV4cCI6MjA5MDk3NTg1Nn0.WHZYddgODg88BvmFUX7zHcqyxbTDugl4keLm929_Hb8'; // Same key as web app

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ─── Auth Helpers ──────────────────────────────────────────────────────

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ─── EAV Data Store ──────────────────────────────────────────────────

/**
 * Monibox uses a single EAV (Entity-Attribute-Value) table: user_data
 * Schema: { id, user_id, category, data (jsonb), created_at, updated_at }
 *
 * Categories match the web app's stores:
 *   bank_account, credit_card, mortgage, loan, insurance_policy,
 *   bill, subscription, investment, pension, property, vehicle,
 *   pet, family_health, crypto_holding, stock_holding, bond_holding,
 *   next_of_kin, kyc_document, etc.
 */

export async function getUserData(category: string) {
  const { data, error } = await supabase
    .from('user_data')
    .select('*')
    .eq('category', category)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function upsertUserData(category: string, itemData: any, id?: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const record = {
    ...(id ? { id } : {}),
    user_id: user.id,
    category,
    data: itemData,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('user_data')
    .upsert(record)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteUserData(id: string) {
  const { error } = await supabase
    .from('user_data')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ─── Net Worth Calculation ───────────────────────────────────────────

export async function calculateNetWorth() {
  const user = await getCurrentUser();
  if (!user) return { assets: 0, liabilities: 0, netWorth: 0 };

  const { data } = await supabase
    .from('user_data')
    .select('category, data')
    .eq('user_id', user.id);

  if (!data) return { assets: 0, liabilities: 0, netWorth: 0 };

  let assets = 0;
  let liabilities = 0;

  for (const item of data) {
    const d = item.data;
    const val = parseFloat(d?.balance || d?.value || d?.current_value || d?.amount || '0');

    switch (item.category) {
      case 'bank_account':
      case 'investment':
      case 'pension':
      case 'property':
      case 'crypto_holding':
      case 'stock_holding':
      case 'bond_holding':
        assets += val;
        break;
      case 'mortgage':
      case 'loan':
      case 'credit_card':
        liabilities += val;
        break;
    }
  }

  return { assets, liabilities, netWorth: assets - liabilities };
}
