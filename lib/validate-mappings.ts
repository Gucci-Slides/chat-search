export function validateMappings(mappings: any) {
  const expectedFields = {
    conversations: [
      'id',
      'username',
      'handle',
      'lastMessage',
      'date',
      'participants'
    ],
    messages: [
      'id',
      'conversationId',
      'username',
      'handle',
      'text',
      'date',
      'mentions',
      'attachmentType',
      'pinned'
    ]
  };

  const errors: string[] = [];

  // Check conversations mapping
  const conversationsProps = mappings.conversations?.properties || {};
  expectedFields.conversations.forEach(field => {
    if (!conversationsProps[field]) {
      errors.push(`Missing field in conversations mapping: ${field}`);
    }
  });

  // Check messages mapping
  const messagesProps = mappings.messages?.properties || {};
  expectedFields.messages.forEach(field => {
    if (!messagesProps[field]) {
      errors.push(`Missing field in messages mapping: ${field}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
} 