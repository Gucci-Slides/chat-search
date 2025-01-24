"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import type { Conversation } from "@/types/types"

interface ConversationListProps extends React.HTMLAttributes<HTMLDivElement> {
  onSelectConversation?: (conversation: Conversation) => void
}

export function ConversationList({ 
  className,
  onSelectConversation,
  ...props 
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            searchType: 'conversation'
          })
        })

        if (!response.ok) {
          throw new Error('Failed to fetch conversations')
        }

        const data = await response.json()
        
        const mappedConversations = data.hits.map((hit: any) => {
          const source = hit._source;
          return {
            id: source.id,
            username: source.username,
            handle: source.handle,
            lastMessage: source.lastMessage,
            date: new Date(source.date),
            participants: source.participants
          };
        });

        mappedConversations.sort((a, b) => b.date.getTime() - a.date.getTime());
        
        setConversations(mappedConversations);
      } catch (err) {
        console.error('Error fetching conversations:', err)
        setError(err instanceof Error ? err.message : 'Failed to load conversations')
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 text-muted-foreground">
        Loading conversations...
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-md">
        {error}
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      {conversations.length === 0 ? (
        <div className="text-center text-muted-foreground p-4">
          No conversations found
        </div>
      ) : (
        <div className="divide-y">
          {conversations.map((conversation) => {
            const otherParticipant = conversation.participants.find(
              p => p.handle !== 'sarah123' // Current user's handle
            );
            
            return (
              <button
                key={conversation.id}
                className="flex items-start gap-4 p-4 w-full hover:bg-muted/50 text-left"
                onClick={() => onSelectConversation?.(conversation)}
              >
                <Avatar>
                  <AvatarImage src={`https://avatar.vercel.sh/${otherParticipant?.handle || conversation.handle}`} />
                  <AvatarFallback>{otherParticipant?.username[0] || conversation.username[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {otherParticipant?.username || conversation.username}
                    </span>
                    <span className="text-muted-foreground">
                      @{otherParticipant?.handle || conversation.handle}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.lastMessage}
                  </p>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(conversation.date, { addSuffix: true })}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  )
}

