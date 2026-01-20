'use client';

import { useState } from 'react';

export default function TestAPIPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/profile', {
        credentials: 'include'
      });
      const data = await response.json();
      setResult({
        status: response.status,
        statusText: response.statusText,
        data
      });
    } catch (error: any) {
      setResult({
        error: error.message
      });
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace' }}>
      <h1>Test API Profile</h1>
      
      <button 
        onClick={testProfile} 
        disabled={loading}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          background: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: loading ? 'wait' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Tester /api/user/profile'}
      </button>

      {result && (
        <div style={{ marginTop: '20px' }}>
          <h2>Résultat :</h2>
          <pre style={{
            background: '#1e1e1e',
            color: '#d4d4d4',
            padding: '20px',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '14px'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
