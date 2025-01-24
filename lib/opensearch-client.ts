import { Client } from '@opensearch-project/opensearch';

function getOpenSearchUrl() {
  if (process.env.NODE_ENV === 'production') {
    return process.env.OPENSEARCH_URL;
  }
  
  // For local development
  return 'http://localhost:9200';
}

export const client = new Client({
  node: getOpenSearchUrl(),
  ssl: {
    rejectUnauthorized: false
  },
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  },
  // Add request timeout
  requestTimeout: 5000,
  // Add connection retry
  maxRetries: 3,
  // Add connection pool settings
  suggestCompression: true,
  compression: 'gzip',
  // Debug mode
  // log: process.env.NODE_ENV === 'development' ? 'trace' : 'error'
}); 
