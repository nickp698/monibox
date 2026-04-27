import { supabase, getCurrentUser, getUserData } from './supabase';
import { CATEGORIES } from '../theme';
import type { CategoryKey } from '../theme';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

/**
 * Gathers the user's vault data summary for Alfred's context
 */
async function getVaultContext(): Promise<string> {
  const categories = Object.keys(CATEGORIES) as CategoryKey[];
  const summaries: string[] = [];

  const results = await Promise.allSettled(
    categories.map(async (cat) => {
      const items = await getUserData(cat);
      return { cat, items };
    })
  );

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.items.length > 0) {
      const { cat, items } = result.value;
      const catLabel = CATEGORIES[cat]?.label || cat;
      const itemNames = items
        .slice(0, 10)
        .map((i: any) => {
          const d = i.data;
          const name = d?.name || d?.provider || d?.bank_name || d?.pet_name || d?.full_name || 'Untitled';
          const val = d?.balance || d?.value || d?.current_value || d?.cost || '';
          return val ? `${name} (£${val})` : name;
        })
        .join(', ');

      summaries.push(`${catLabel} (${items.length}): ${itemNames}`);
    }
  }

  return summaries.length > 0
    ? `User's vault data:\n${summaries.join('\n')}`
    : 'User has no vault data yet.';
}

/**
 * Calls the Supabase edge function for Alfred AI responses
 */
export async function sendToAlfred(
  userMessage: string,
  conversationHistory: Message[]
): Promise<string> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    // Build vault context on first message or every 5 messages
    let vaultContext = '';
    const userMsgCount = conversationHistory.filter((m) => m.role === 'user').length;
    if (userMsgCount === 0 || userMsgCount % 5 === 0) {
      vaultContext = await getVaultContext();
    }

    const { data, error } = await supabase.functions.invoke('alfred-chat', {
      body: {
        message: userMessage,
        history: conversationHistory.slice(-20),
        vaultContext,
        userProfile: {
          name: user.user_metadata?.full_name || 'User',
          email: user.email,
        },
      },
    });

    if (error) throw error;
    return data?.reply || data?.message || "I'm sorry, I couldn't process that. Please try again.";
  } catch (err: any) {
    console.error('Alfred error:', err);

    if (err.message?.includes('Not authenticated')) {
      return 'Please sign in to use Alfred.';
    }
    if (err.message?.includes('FunctionsFetchError') || err.message?.includes('Failed to fetch')) {
      return "I'm having trouble connecting to my brain right now. Please check your internet connection and try again.";
    }
    return "I apologise, I'm experiencing a temporary issue. Please try again in a moment.";
  }
}
g
