import { useEffect, useState } from 'react';
import { supabase, checkSupabaseConnection } from '../../lib/supabase';

export function SupabaseTest() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkConnection() {
      try {
        const isConnected = await checkSupabaseConnection();
        setStatus(isConnected ? 'connected' : 'error');
        if (!isConnected) {
          setError('Failed to connect to Supabase');
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
    </div>
  );
} 