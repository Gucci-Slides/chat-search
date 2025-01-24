'use client';

import { useState } from 'react';
import { setupSearchIndices } from '@/lib/setup-search';
import { Button } from '@/components/ui/button';

export default function SetupPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSetup = async () => {
    setStatus('loading');
    try {
      await setupSearchIndices();
      // Index test data after setting up indices
      const response = await fetch('/api/search/index-data', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to index test data');
      }
      
      const result = await response.json();
      setStatus('success');
      setMessage(`Search indices created and test data indexed successfully. 
        Indexed ${result.counts.conversations} conversations and ${result.counts.messages} messages.`);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Setup failed');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Search Setup</h1>
      <Button 
        onClick={handleSetup}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? 'Setting up...' : 'Setup Search Indices & Index Test Data'}
      </Button>
      {message && (
        <p className={`mt-4 ${status === 'error' ? 'text-red-500' : 'text-green-500'}`}>
          {message}
        </p>
      )}
    </div>
  );
} 