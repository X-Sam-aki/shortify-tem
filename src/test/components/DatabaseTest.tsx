import { useEffect, useState } from 'react';
import { checkDatabaseConnection, testDatabaseWrite } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export function DatabaseTest() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [tables, setTables] = useState<string[]>([]);
  const [writeTestStatus, setWriteTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [writeTestError, setWriteTestError] = useState<string | null>(null);

  const runConnectionTest = async () => {
    setStatus('loading');
    setError(null);
    
    const result = await checkDatabaseConnection();
    
    if (result.connected) {
      setTables(result.tables);
      setStatus('connected');
    } else {
      setError(result.error || 'Unknown error occurred');
      setStatus('error');
    }
  };

  const runWriteTest = async () => {
    setWriteTestStatus('testing');
    setWriteTestError(null);

    const result = await testDatabaseWrite();

    if (result.success) {
      setWriteTestStatus('success');
    } else {
      setWriteTestError(result.error || 'Unknown error occurred');
      setWriteTestStatus('error');
    }
  };

  useEffect(() => {
    runConnectionTest();
  }, []);

  return (
    <div className="p-6 border rounded-lg space-y-6 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Database Connection Status</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={runConnectionTest}
          disabled={status === 'loading'}
          className="min-w-[100px]"
        >
          {status === 'loading' ? (
            <span className="animate-spin mr-2">⌛</span>
          ) : (
            <span className="mr-2">🔄</span>
          )}
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          {status === 'loading' && (
            <span className="text-yellow-500 animate-spin">⌛</span>
          )}
          {status === 'connected' && (
            <span className="text-green-500">✅</span>
          )}
          {status === 'error' && (
            <span className="text-red-500">❌</span>
          )}
          <span className={
            status === 'loading' ? 'text-yellow-600' :
            status === 'connected' ? 'text-green-600' :
            'text-red-600'
          }>
            {status === 'loading' ? 'Testing connection...' :
             status === 'connected' ? 'Connected to database' :
             'Connection failed'}
          </span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
            {error}
          </div>
        )}

        {/* Tables List */}
        {status === 'connected' && (
          <div className="space-y-2">
            <h3 className="font-medium">Available Tables:</h3>
            <ul className="list-disc list-inside space-y-1">
              {tables.map(table => (
                <li key={table} className="text-gray-700">{table}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Write Test */}
        {status === 'connected' && (
          <div className="space-y-2 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Database Write Test</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={runWriteTest}
                disabled={writeTestStatus === 'testing'}
                className="min-w-[100px]"
              >
                {writeTestStatus === 'testing' ? (
                  <span className="animate-spin mr-2">⌛</span>
                ) : (
                  'Test Write'
                )}
              </Button>
            </div>

            {writeTestStatus !== 'idle' && (
              <div className="flex items-center space-x-2">
                {writeTestStatus === 'testing' && (
                  <span className="text-yellow-500 animate-spin">⌛</span>
                )}
                {writeTestStatus === 'success' && (
                  <span className="text-green-500">✅</span>
                )}
                {writeTestStatus === 'error' && (
                  <span className="text-red-500">❌</span>
                )}
                <span className={
                  writeTestStatus === 'testing' ? 'text-yellow-600' :
                  writeTestStatus === 'success' ? 'text-green-600' :
                  'text-red-600'
                }>
                  {writeTestStatus === 'testing' ? 'Testing write operations...' :
                   writeTestStatus === 'success' ? 'Write test successful' :
                   'Write test failed'}
                </span>
              </div>
            )}

            {writeTestError && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
                {writeTestError}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 