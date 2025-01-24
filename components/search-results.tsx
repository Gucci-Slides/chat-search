"use client"

import { formatDistanceToNow } from "date-fns"
import type { Message } from "@/types/types"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SearchResultsProps {
  results: Message[]
  onSelectMessage: (message: Message) => void
}

export function SearchResults({ results, onSelectMessage }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="p-2 text-center text-sm text-muted-foreground">
        No messages found
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-[300px]">
      <div className="py-1">
        {results.map((message) => (
          <button
            key={message.id}
            onClick={() => onSelectMessage(message)}
            className="flex flex-col w-full px-3 py-2 text-left hover:bg-muted/50 space-y-1"
          >
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{message.username}</span>
              <span className="text-muted-foreground">
                {formatDistanceToNow(message.date, { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {message.highlighted ? (
                <span dangerouslySetInnerHTML={{ __html: message.highlighted }} />
              ) : (
                message.text
              )}
            </p>
          </button>
        ))}
      </div>
    </ScrollArea>
  )
} 