export async function setupSearchIndices() {
  try {
    const response = await fetch('/api/search/setup', {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error('Failed to setup search indices');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Setup error:', error);
    throw error;
  }
} 