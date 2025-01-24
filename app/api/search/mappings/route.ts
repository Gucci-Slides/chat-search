import { NextResponse } from 'next/server';
import { client } from '@/lib/opensearch-client';

async function checkConnection() {
  try {
    const health = await client.cluster.health({});
    console.log('OpenSearch cluster health:', health.body);
    return true;
  } catch (error) {
    console.error('OpenSearch connection error:', error);
    return false;
  }
}

export async function GET() {
  try {
    // First check connection
    const isConnected = await checkConnection();
    if (!isConnected) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to connect to OpenSearch',
          details: 'Could not establish connection to OpenSearch cluster'
        },
        { status: 500 }
      );
    }

    console.log('Fetching mappings...');

    // Check if indices exist first
    const conversationsExists = await client.indices.exists({ index: 'conversations' });
    const messagesExists = await client.indices.exists({ index: 'messages' });

    if (!conversationsExists.body || !messagesExists.body) {
      return NextResponse.json(
        {
          success: false,
          error: 'Indices not found',
          details: 'One or both indices do not exist. Please run the setup first.',
          status: {
            conversations: conversationsExists.body,
            messages: messagesExists.body
          }
        },
        { status: 404 }
      );
    }

    // Get mappings for both indices
    const conversationsMappings = await client.indices.getMapping({
      index: 'conversations'
    });

    const messagesMappings = await client.indices.getMapping({
      index: 'messages'
    });

    return NextResponse.json({
      success: true,
      mappings: {
        conversations: conversationsMappings.body.conversations?.mappings,
        messages: messagesMappings.body.messages?.mappings
      }
    });
  } catch (error) {
    console.error('Failed to get mappings:', {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      message: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get mappings',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 