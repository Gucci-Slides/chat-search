export type SearchType = 'conversation' | 'message';

export interface SearchFilters {
  from?: string;
  mentions?: string;
  has?: string;
  before?: string;
  after?: string;
  during?: string;
  pinned?: boolean;
}

export async function performSearch(
  query: string,
  searchType: SearchType,
  filters?: SearchFilters
) {
  try {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        searchType,
        filters
      })
    });

    if (!response.ok) {
      throw new Error('Search request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
} 