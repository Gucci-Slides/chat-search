// // app/api/search/route.ts
import { NextResponse } from 'next/server';
import { client } from '@/lib/opensearch-client';

export async function POST(request: Request) {
  try {
    const isConnected = await client.ping();
    if (!isConnected.body) {
      console.error('Failed to connect to OpenSearch');
      return NextResponse.json(
        { error: 'Failed to connect to OpenSearch' },
        { status: 503 }
      );
    }

    const {
      query,
      searchType = 'message',
      filters = {},
      conversationId
    } = await request.json();

    // If we're searching for conversations, use the conversations index
    if (searchType === 'conversation') {
      const response = await client.search({
        index: 'conversations',
        body: {
          query: query ? {
            multi_match: {
              query,
              fields: ['username^2', 'handle', 'lastMessage'],
              fuzziness: 'AUTO'
            }
          } : {
            match_all: {}
          },
          sort: [{ date: { order: 'desc' } }],
          size: 20
        }
      });

      return NextResponse.json({
        hits: response.body.hits.hits,
        total: response.body.hits.total.value
      });
    }

    // If we're searching for messages
    const searchQuery = {
      bool: {
        must: [],
        filter: []
      }
    };

    // Add text search for messages
    if (query) {
      searchQuery.bool.must.push({
        multi_match: {
          query,
          fields: ['text^2', 'username', 'handle'],
          fuzziness: 'AUTO'
        }
      });
    }

    // If conversationId is provided, filter messages by conversation
    if (conversationId) {
      searchQuery.bool.filter.push({
        term: { conversationId }
      });
    }

    // Apply filters for message search
    if (filters.from) {
      searchQuery.bool.filter.push({
        term: { 'username.keyword': filters.from }
      });
    }

    if (filters.mentions) {
      searchQuery.bool.filter.push({
        term: { 'mentions.keyword': filters.mentions }
      });
    }

    if (filters.has) {
      searchQuery.bool.filter.push({
        term: { attachmentType: filters.has }
      });
    }

    if (filters.before || filters.after || filters.during) {
      const rangeQuery = { range: { date: {} } };
      if (filters.before) rangeQuery.range.date.lt = filters.before;
      if (filters.after) rangeQuery.range.date.gt = filters.after;
      if (filters.during) {
        rangeQuery.range.date.gte = filters.during;
        rangeQuery.range.date.lte = filters.during;
      }
      searchQuery.bool.filter.push(rangeQuery);
    }

    if (filters.pinned) {
      searchQuery.bool.filter.push({ term: { pinned: true } });
    }

    // Search messages
    const response = await client.search({
      index: 'messages',
      body: {
        query: searchQuery,
        sort: [{ date: { order: 'desc' } }],
        highlight: {
          fields: {
            text: {},
            lastMessage: {}
          },
          pre_tags: ['<strong>'],
          post_tags: ['</strong>']
        }
      }
    });

    return NextResponse.json({
      hits: response.body.hits.hits,
      total: response.body.hits.total.value
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}