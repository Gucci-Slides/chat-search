"use client"

import { formatDistanceToNow } from "date-fns"
import type { Message } from "@/types/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface MessageListProps extends React.HTMLAttributes<HTMLDivElement> {
  messages: Message[]
  onSelectMessage: (message: Message) => void
}

export function MessageList({ messages, onSelectMessage }: MessageListProps) {
  // Group messages by conversation
  const conversationMap = messages.reduce((acc, message) => {
    if (!acc[message.conversationId]) {
      acc[message.conversationId] = [];
    }
    acc[message.conversationId].push(message);
    return acc;
  }, {} as Record<string, Message[]>);

  // Get the most recent message and conversation partner for each conversation
  const conversationPreviews = Object.values(conversationMap).map(messages => {
    // Sort messages by date (most recent first)
    const sortedMessages = messages.sort((a, b) => b.date.getTime() - a.date.getTime());
    const latestMessage = sortedMessages[0];
    
    // Find the conversation partner (not sarah123)
    const conversationPartner = sortedMessages.find(msg => msg.handle !== 'sarah123');
    
    return {
      message: latestMessage,
      partner: conversationPartner ? {
        username: conversationPartner.username,
        handle: conversationPartner.handle
      } : null
    };
  });

  // Sort conversations by most recent message
  conversationPreviews.sort((a, b) => b.message.date.getTime() - a.message.date.getTime());

  return (
    <div className="divide-y">
      {conversationPreviews.map(({ message, partner }) => (
        <button
          key={message.id}
          className="flex w-full items-start gap-3 p-4 text-left hover:bg-muted/50"
          onClick={() => onSelectMessage(message)}
        >
          <Avatar className="mt-1">
            <AvatarImage src={`https://avatar.vercel.sh/${partner?.handle || message.handle}`} />
            <AvatarFallback>{(partner?.username || message.username)[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {partner?.username || message.username}
                </span>
                <span className="text-sm text-muted-foreground">
                  @{partner?.handle || message.handle}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(message.date, { addSuffix: true })}
              </span>
            </div>
            <div className="text-sm">
              <p className="text-muted-foreground truncate">
                {message.text}
              </p>
            </div>
            {message.attachmentType && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {message.attachmentType === 'image' && '🖼️'}
                {message.attachmentType === 'file' && '📄'}
                {message.attachmentType === 'link' && '🔗'}
                <span>{message.attachmentType}</span>
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}

