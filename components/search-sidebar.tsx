"use client"

import * as React from "react"
import { Filter, Search } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { SearchFilters, type SearchFilters as SearchFiltersType } from "./search-filters"
import { MessageList } from "./message-list"
import type { Message } from "@/types/types"

interface SearchSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  onSelectMessage?: (message: Message) => void;
}

export function SearchSidebar({ className, onSelectMessage, ...props }: SearchSidebarProps) {
  const [search, setSearch] = React.useState("")
  const [filters, setFilters] = React.useState<SearchFiltersType>({})
  const [results, setResults] = React.useState<Message[]>([])
  const [loading, setLoading] = React.useState(true)

  // Initial fetch of messages
  React.useEffect(() => {
    const fetchInitialMessages = async () => {
      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            searchType: 'message'
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }

        const data = await response.json();
        const messages = data.hits.map((hit: any) => ({
          ...hit._source,
          date: new Date(hit._source.date),
          highlighted: hit.highlight?.text?.[0]
        }));

        setResults(messages);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialMessages();
  }, []);

  const performSearch = React.useCallback(async () => {
    if (!search && Object.keys(filters).length === 0) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: search,
          searchType: 'message',
          filters
        })
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      const messages = data.hits.map((hit: any) => ({
        ...hit._source,
        date: new Date(hit._source.date),
        highlighted: hit.highlight?.text?.[0]
      }));

      setResults(messages);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  }, [search, filters]);

  React.useEffect(() => {
    const debounce = setTimeout(performSearch, 300);
    return () => clearTimeout(debounce);
  }, [performSearch]);

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <div className="sticky top-0 z-10 border-b bg-background p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <SearchFilters filters={filters} onChange={setFilters} />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      {loading ? (
        <div className="p-4 text-center text-muted-foreground">
          Searching...
        </div>
      ) : (
        <MessageList
          messages={results}
          onSelectMessage={onSelectMessage || (() => {})}
        />
      )}
    </div>
  )
}

