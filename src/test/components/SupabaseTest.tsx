
import { useEffect, useState } from 'react';
import { supabase, checkSupabaseConnection } from '../../integrations/supabase/client';

export function SupabaseTest() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [envVars, setEnvVars] = useState({
    url: import.meta.env.VITE_SUPABASE_URL || 'Not set',
    key: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set (hidden)' : 'Not set'
  });

  useEffect(() => {
    async function checkConnection() {
      try {
        const isConnected = await checkSupabaseConnection();
        setStatus(isConnected ? 'connected' : 'error');
        if (!isConnected) {
          setError('Failed to connect to Supabase. Check your environment variables.');
        }
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    }

    checkConnection();
  }, []);

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-semibold mb-2">Supabase Connection Status</h2>
      {status === 'loading' && <p>Checking connection...</p>}
      {status === 'connected' && (
        <p className="text-green-600">Successfully connected to Supabase!</p>
      )}
      {status === 'error' && (
        <div>
          <p className="text-red-600">Failed to connect to Supabase</p>
          {error && <p className="text-sm text-gray-600 mt-1">{error}</p>}
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t">
        <h3 className="text-md font-medium mb-2">Environment Variables</h3>
        <ul className="text-sm">
          <li><strong>VITE_SUPABASE_URL:</strong> {envVars.url.substring(0, 10) === 'https://su' ? `${envVars.url.substring(0, 20)}...` : envVars.url}</li>
          <li><strong>VITE_SUPABASE_ANON_KEY:</strong> {envVars.key}</li>
        </ul>
        <p className="text-xs text-gray-500 mt-2">
          Make sure these environment variables are properly set in your .env file.
        </p>
      </div>
    </div>
  );
}
