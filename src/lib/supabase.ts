import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export a helper function to check if Supabase is connected
export const checkSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('profiles').select('count', { count: 'exact' }).limit(1);
    return !error;
  } catch (err) {
    console.error('Supabase connection error:', err);
    return false;
  }
};
