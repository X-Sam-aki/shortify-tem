
import { createClient } from '@supabase/supabase-js';

// Get environment variables or fallback to the ones from integrations folder
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://xhxkjhrmzhnvfnzxdhth.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoeGtqaHJtemhudmZuenhkaHRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyMTg4OTgsImV4cCI6MjA1ODc5NDg5OH0.LLQuTIfs_nNW0lGhm0VoBtsB2OEzHICu307Vat5wEqI";

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
