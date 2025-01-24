import { NextResponse } from 'next/server';
import { client } from '@/lib/opensearch-client';

interface HealthCheckResults {
  ping: boolean;
  health: any;
  info: any;
  error: string | null;
}

export async function GET() {
  try {
    const results: HealthCheckResults = {
      ping: false,
      health: null,
      info: null,
      error: null
    };

    try {
      const pingResult = await client.ping();
      results.ping = pingResult.body;
    } catch (e) {
      console.error('Ping failed:', e);
    }

    try {
      const health = await client.cluster.health({});
      results.health = health.body;
    } catch (e) {
      console.error('Health check failed:', e);
    }

    try {
      const info = await client.info();
      results.info = info.body;
    } catch (e) {
      console.error('Info check failed:', e);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        error: 'Health check failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 