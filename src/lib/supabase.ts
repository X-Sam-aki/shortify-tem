import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Get environment variables
const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create supabase client with type safety
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
});

// Helper function to check database connection and schema
export const checkDatabaseConnection = async () => {
  try {
    // Test database connection
    const { error: connError } = await supabase.from('product_cache').select('count', { count: 'exact', head: true });
    if (connError) throw connError;

    // Verify schema and tables
    const { data: tables, error: schemaError } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_schema')
      .eq('table_schema', 'public');
    
    if (schemaError) throw schemaError;

    // Verify required tables exist
    const requiredTables = ['product_cache', 'videos'];
    const missingTables = requiredTables.filter(
      table => !tables?.some(t => t.table_name === table)
    );

    if (missingTables.length > 0) {
      throw new Error(`Missing required tables: ${missingTables.join(', ')}`);
    }

    return {
      connected: true,
      tables: tables?.map(t => t.table_name) || [],
      error: null
    };
  } catch (err) {
    console.error('Database connection error:', err);
    return {
      connected: false,
      tables: [],
      error: err instanceof Error ? err.message : 'Failed to connect to database'
    };
  }
};

// Helper function to test write operations
export const testDatabaseWrite = async () => {
  try {
    // Test write operation
    const testData = {
      product_id: 'test-' + Date.now(),
      url: 'https://test.com',
      data: { test: true }
    };

    const { error: insertError } = await supabase
      .from('product_cache')
      .insert(testData);

    if (insertError) throw insertError;

    // Clean up test data
    const { error: deleteError } = await supabase
      .from('product_cache')
      .delete()
      .eq('product_id', testData.product_id);

    if (deleteError) throw deleteError;

    return { success: true, error: null };
  } catch (err) {
    console.error('Database write test error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to test database write operations'
    };
  }
};
