import { NextResponse } from 'next/server';
import { client } from '@/lib/opensearch-client';
import type { MappingProperty } from '@opensearch-project/opensearch/lib/api/types';

// Add connection check
async function checkConnection() {
  try {
    console.log('Attempting to connect to OpenSearch at:', process.env.OPENSEARCH_URL);
    const health = await client.cluster.health({});
    console.log('OpenSearch cluster health:', health.body);
    
    // Also check authentication
    const info = await client.info();
    console.log('OpenSearch info:', info.body);
    
    return true;
  } catch (error) {
    console.error('OpenSearch connection error:', {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      url: process.env.OPENSEARCH_URL,
      auth: {
        username: process.env.OPENSEARCH_USERNAME ? 'set' : 'not set',
        password: process.env.OPENSEARCH_PASSWORD ? 'set' : 'not set'
      }
    });
    return false;
  }
}

interface PropertyWithFields extends MappingProperty {
  fields?: {
    keyword: {
      type: 'keyword'
    }
  }
}

const MAPPINGS = {
  conversations: {
    mappings: {
      properties: {
        id: { type: 'keyword' as const },
        username: {
          type: 'text' as const,
          fields: {
            keyword: { type: 'keyword' as const }
          }
        },
        handle: {
          type: 'text' as const,
          fields: {
            keyword: { type: 'keyword' as const }
          }
        },
        lastMessage: { type: 'text' as const },
        date: { type: 'date' as const },
        participants: {
          type: 'nested' as const,
          properties: {
            username: {
              type: 'text' as const,
              fields: {
                keyword: { type: 'keyword' as const }
              }
            },
            handle: {
              type: 'text' as const,
              fields: {
                keyword: { type: 'keyword' as const }
              }
            }
          }
        }
      }
    }
  },
  messages: {
    mappings: {
      properties: {
        id: { type: 'keyword' as const },
        conversationId: { type: 'keyword' as const },
        username: {
          type: 'text' as const,
          fields: {
            keyword: { type: 'keyword' as const }
          }
        },
        handle: {
          type: 'text' as const,
          fields: {
            keyword: { type: 'keyword' as const }
          }
        },
        text: { type: 'text' as const },
        date: { type: 'date' as const },
        mentions: {
          type: 'text' as const,
          fields: {
            keyword: { type: 'keyword' as const }
          }
        },
        attachmentType: { type: 'keyword' as const },
        pinned: { type: 'boolean' as const }
      }
    }
  }
} as const;

export async function POST(request: Request) {
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

    console.log('Checking existing indices...');
    
    // Check if indices exist
    const conversationsExists = await client.indices.exists({ index: 'conversations' });
    const messagesExists = await client.indices.exists({ index: 'messages' });

    console.log('Indices status:', {
      conversationsExists: conversationsExists.body,
      messagesExists: messagesExists.body
    });

    // Delete existing indices if they exist
    if (conversationsExists.body) {
      console.log('Deleting existing conversations index...');
      await client.indices.delete({ index: 'conversations' });
    }
    if (messagesExists.body) {
      console.log('Deleting existing messages index...');
      await client.indices.delete({ index: 'messages' });
    }

    // Create indices with mappings
    console.log('Creating conversations index...');
    const conversationsResult = await client.indices.create({
      index: 'conversations',
      body: MAPPINGS.conversations as any
    });
    console.log('Conversations index created:', conversationsResult.body);

    console.log('Creating messages index...');
    const messagesResult = await client.indices.create({
      index: 'messages',
      body: MAPPINGS.messages as any
    });
    console.log('Messages index created:', messagesResult.body);

    // Verify the mappings were created correctly
    const verifyConversations = await client.indices.getMapping({ index: 'conversations' });
    const verifyMessages = await client.indices.getMapping({ index: 'messages' });

    return NextResponse.json({ 
      success: true,
      message: 'Search indices created successfully',
      verification: {
        conversations: verifyConversations.body,
        messages: verifyMessages.body
      }
    });
  } catch (error) {
    console.error('Failed to setup search indices:', {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      message: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to setup search indices',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 