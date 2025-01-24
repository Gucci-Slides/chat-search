'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorResponse {
  error: string;
  details?: string;
  status?: {
    conversations: boolean;
    messages: boolean;
  };
}

export default function MappingsPage() {
  const [mappings, setMappings] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchMappings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/search/mappings');
      const data = await response.json();
      
      if (!response.ok) {
        const errorData = data as ErrorResponse;
        throw new Error(
          `${errorData.error}${errorData.details ? `: ${errorData.details}` : ''}`
        );
      }
      
      setMappings(data.mappings);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch mappings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMappings();
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Search Mappings</h1>
        <Button 
          onClick={fetchMappings}
          disabled={loading}
        >
          Refresh Mappings
        </Button>
      </div>

      {loading && (
        <div className="text-center text-muted-foreground">
          Loading mappings...
        </div>
      )}

      {error && (
        <div className="p-4 text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      {mappings && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Conversations Index</h2>
            <pre className="p-4 bg-muted rounded-lg overflow-auto">
              {JSON.stringify(mappings.conversations, null, 2)}
            </pre>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Messages Index</h2>
            <pre className="p-4 bg-muted rounded-lg overflow-auto">
              {JSON.stringify(mappings.messages, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
} 