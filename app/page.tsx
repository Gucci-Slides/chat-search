"use client"

import { useState } from "react"
import { SearchSidebar } from "@/components/search-sidebar"
import { MessageView } from "@/components/message-view"
import type { Message } from "@/types/types"

export default function Home() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [searchResults, setSearchResults] = useState<Message[]>([])

  const handleConversationSearch = (results: Message[]) => {
    setSearchResults(results);
  };

  return (
    <div className="flex h-screen">
      <aside className="w-80 border-r">
        <SearchSidebar 
          className="h-full"
          onSelectMessage={setSelectedMessage}
        
        />
      </aside>
      <main className="flex-1">
        {selectedMessage ? (
          <MessageView 
            message={selectedMessage} 
            onSearch={handleConversationSearch}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a message to view details
          </div>
        )}
      </main>
    </div>
  )
}

