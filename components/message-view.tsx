"use client"

import { Search } from 'lucide-react'
import { useState, useCallback, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { SearchResults } from "@/components/search-results"
import { cn } from "@/lib/utils"
import type { Message } from "@/types/types"

interface MessageViewProps {
  message: Message;
  onSearch?: (results: Message[]) => void;
}

export function MessageView({ message, onSearch }: MessageViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);

  // Fetch all messages in the conversation
  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            searchType: 'message',
            conversationId: message.conversationId
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch conversation');
        }

        const data = await response.json();
        const messages = data.hits.map((hit: any) => ({
          ...hit._source,
          date: new Date(hit._source.date)
        }));

        messages.sort((a: Message, b: Message) => a.date.getTime() - b.date.getTime());
        setConversationMessages(messages);
      } catch (error) {
        console.error('Failed to fetch conversation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [message.conversationId]);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          searchType: 'message',
          conversationId: message.conversationId
        })
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      const results = data.hits.map((hit: any) => ({
        ...hit._source,
        date: new Date(hit._source.date),
        highlighted: hit.highlight?.text?.[0]
      }));

      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Search failed:', error);
    }
  }, [message.conversationId]);

  const handleSelectSearchResult = (selectedMessage: Message) => {
    setShowResults(false);
    setSearchQuery('');
    setHighlightedMessageId(selectedMessage.id);
    
    // Remove highlight after animation
    setTimeout(() => {
      setHighlightedMessageId(null);
    }, 2000);

    // Scroll to message
    const messageElement = document.getElementById(`message-${selectedMessage.id}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={`https://avatar.vercel.sh/${message.handle}`} />
              <AvatarFallback>{message.username[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{message.username}</span>
                <span className="text-muted-foreground">@{message.handle}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {message.date.toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              placeholder="Search in conversation..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-md border bg-background shadow-md z-50">
              <SearchResults
                results={searchResults}
                onSelectMessage={handleSelectSearchResult}
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 p-6 overflow-auto">
        {loading ? (
          <div className="text-center text-muted-foreground">Loading conversation...</div>
        ) : (
          <div className="space-y-6">
            {conversationMessages.map((msg) => (
              <div 
                key={msg.id}
                id={`message-${msg.id}`}
                className={cn(
                  "flex gap-4 transition-colors duration-300",
                  msg.username === message.username ? "flex-row-reverse" : "",
                  highlightedMessageId === msg.id ? "bg-yellow-100 dark:bg-yellow-900/30 rounded-lg p-2" : ""
                )}
              >
                <Avatar className="mt-1">
                  <AvatarImage src={`https://avatar.vercel.sh/${msg.handle}`} />
                  <AvatarFallback>{msg.username[0]}</AvatarFallback>
                </Avatar>
                <div className={cn(
                  "flex flex-col",
                  msg.username === message.username ? "items-end" : "items-start"
                )}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{msg.username}</span>
                    <span className="text-muted-foreground">@{msg.handle}</span>
                    <span className="text-sm text-muted-foreground">
                      {msg.date.toLocaleTimeString()}
                    </span>
                    {msg.pinned && (
                      <span className="text-yellow-600">📌</span>
                    )}
                  </div>
                  <div className={cn(
                    "prose prose-sm max-w-none p-3 rounded-lg",
                    msg.username === message.username 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"
                  )}>
                    {msg.highlighted ? (
                      <p dangerouslySetInnerHTML={{ __html: msg.highlighted }} />
                    ) : (
                      <p>{msg.text}</p>
                    )}
                  </div>
                  {msg.attachmentType && (
                    <div className="mt-2 text-sm flex items-center gap-2">
                      {msg.attachmentType === 'image' && '🖼️'}
                      {msg.attachmentType === 'file' && '📄'}
                      {msg.attachmentType === 'link' && '🔗'}
                      <span>{msg.attachmentType}</span>
                    </div>
                  )}
                  {msg.mentions.length > 0 && (
                    <div className="mt-1 flex gap-1">
                      {msg.mentions.map((mention) => (
                        <span
                          key={mention}
                          className="text-sm text-blue-500"
                        >
                          @{mention}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

