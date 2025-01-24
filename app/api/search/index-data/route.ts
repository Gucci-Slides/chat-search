import { NextResponse } from 'next/server';
import { client } from '@/lib/opensearch-client';

const TEST_CONVERSATIONS = [
  {
    id: '1',
    username: 'sarah',
    handle: 'sarah123',
    lastMessage: "Yes, let's meet at the coffee shop!",
    date: new Date('2024-01-17T11:30:00Z').toISOString(),
    participants: [
      { username: 'sarah', handle: 'sarah123' },
      { username: 'john', handle: 'john456' }
    ]
  },
  {
    id: '2',
    username: 'sarah',
    handle: 'sarah123',
    lastMessage: "The project deadline is next week",
    date: new Date('2024-01-17T14:45:00Z').toISOString(),
    participants: [
      { username: 'sarah', handle: 'sarah123' },
      { username: 'emma', handle: 'emma789' }
    ]
  }
];

const TEST_MESSAGES = [
  // Conversation 1: Movie and Coffee Chat
  {
    id: '1',
    conversationId: '1',
    username: 'sarah',
    handle: 'sarah123',
    text: 'Hey, how are you?',
    date: new Date('2024-01-17T10:00:00Z').toISOString(),
    mentions: [],
    attachmentType: null,
    pinned: false
  },
  {
    id: '2',
    conversationId: '1',
    username: 'john',
    handle: 'john456',
    text: "I'm good! How about you?",
    date: new Date('2024-01-17T10:05:00Z').toISOString(),
    mentions: ['sarah123'],
    attachmentType: null,
    pinned: false
  },
  {
    id: '3',
    conversationId: '1',
    username: 'sarah',
    handle: 'sarah123',
    text: "I'm doing great! Did you see the new movie?",
    date: new Date('2024-01-17T10:10:00Z').toISOString(),
    mentions: ['john456'],
    attachmentType: null,
    pinned: false
  },
  {
    id: '4',
    conversationId: '1',
    username: 'john',
    handle: 'john456',
    text: "Yes, it was amazing! We should watch the sequel together when it comes out!",
    date: new Date('2024-01-17T10:15:00Z').toISOString(),
    mentions: ['sarah123'],
    attachmentType: null,
    pinned: false
  },
  {
    id: '5',
    conversationId: '1',
    username: 'sarah',
    handle: 'sarah123',
    text: "That's a great idea! Want to grab coffee and discuss the movie?",
    date: new Date('2024-01-17T11:20:00Z').toISOString(),
    mentions: [],
    attachmentType: null,
    pinned: false
  },
  {
    id: '6',
    conversationId: '1',
    username: 'john',
    handle: 'john456',
    text: "Sure! How about tomorrow at 3pm at Starbucks?",
    date: new Date('2024-01-17T11:25:00Z').toISOString(),
    mentions: [],
    attachmentType: null,
    pinned: false
  },
  {
    id: '7',
    conversationId: '1',
    username: 'sarah',
    handle: 'sarah123',
    text: "Yes, let's meet at the coffee shop!",
    date: new Date('2024-01-17T11:30:00Z').toISOString(),
    mentions: [],
    attachmentType: null,
    pinned: true
  },

  // Conversation 2: Work Project Discussion
  {
    id: '8',
    conversationId: '2',
    username: 'emma',
    handle: 'emma789',
    text: "Hi Sarah, how's the project coming along?",
    date: new Date('2024-01-17T14:00:00Z').toISOString(),
    mentions: ['sarah123'],
    attachmentType: null,
    pinned: false
  },
  {
    id: '9',
    conversationId: '2',
    username: 'sarah',
    handle: 'sarah123',
    text: "Hi Emma! I've completed the initial designs",
    date: new Date('2024-01-17T14:10:00Z').toISOString(),
    mentions: [],
    attachmentType: 'image',
    pinned: false
  },
  {
    id: '10',
    conversationId: '2',
    username: 'sarah',
    handle: 'sarah123',
    text: "Here's the mockup for the landing page",
    date: new Date('2024-01-17T14:12:00Z').toISOString(),
    mentions: [],
    attachmentType: 'file',
    pinned: true
  },
  {
    id: '11',
    conversationId: '2',
    username: 'emma',
    handle: 'emma789',
    text: "These look great! Just a few minor tweaks needed",
    date: new Date('2024-01-17T14:30:00Z').toISOString(),
    mentions: [],
    attachmentType: null,
    pinned: false
  },
  {
    id: '12',
    conversationId: '2',
    username: 'emma',
    handle: 'emma789',
    text: "Can you adjust the color scheme to match our brand guidelines?",
    date: new Date('2024-01-17T14:35:00Z').toISOString(),
    mentions: ['sarah123'],
    attachmentType: 'link',
    pinned: false
  },
  {
    id: '13',
    conversationId: '2',
    username: 'sarah',
    handle: 'sarah123',
    text: "The project deadline is next week",
    date: new Date('2024-01-17T14:45:00Z').toISOString(),
    mentions: ['emma789'],
    attachmentType: null,
    pinned: false
  }
];

export async function POST() {
  try {
    // Index conversations
    const conversationOps = TEST_CONVERSATIONS.flatMap(doc => [
      { index: { _index: 'conversations', _id: doc.id } },
      doc
    ]);

    if (conversationOps.length > 0) {
      const { body: bulkConversationsResponse } = await client.bulk({
        refresh: true,
        body: conversationOps
      });
      console.log('Indexed conversations:', bulkConversationsResponse);
    }

    // Index messages
    const messageOps = TEST_MESSAGES.flatMap(doc => [
      { index: { _index: 'messages', _id: doc.id } },
      doc
    ]);

    if (messageOps.length > 0) {
      const { body: bulkMessagesResponse } = await client.bulk({
        refresh: true,
        body: messageOps
      });
      console.log('Indexed messages:', bulkMessagesResponse);
    }

    // Verify the indexed data
    const conversationsCount = await client.count({ index: 'conversations' });
    const messagesCount = await client.count({ index: 'messages' });

    return NextResponse.json({
      success: true,
      counts: {
        conversations: conversationsCount.body.count,
        messages: messagesCount.body.count
      }
    });
  } catch (error) {
    console.error('Failed to index test data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to index test data',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 