"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

export interface SearchFilters {
  from?: string;
  mentions?: string;
  has?: string;
  before?: string;
  during?: string;
  after?: string;
  pinned?: boolean;
}

interface SearchFiltersProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
}

export function SearchFilters({ filters, onChange }: SearchFiltersProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="from">from:</Label>
        <Input
          id="from"
          placeholder="username"
          value={filters.from || ''}
          onChange={(e) => onChange({ ...filters, from: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mentions">mentions:</Label>
        <Input
          id="mentions"
          placeholder="username"
          value={filters.mentions || ''}
          onChange={(e) => onChange({ ...filters, mentions: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="has">has:</Label>
        <Input
          id="has"
          placeholder="link, embed or file"
          value={filters.has || ''}
          onChange={(e) => onChange({ ...filters, has: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="before">before:</Label>
        <Input
          id="before"
          type="date"
          value={filters.before || ''}
          onChange={(e) => onChange({ ...filters, before: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="during">during:</Label>
        <Input
          id="during"
          type="date"
          value={filters.during || ''}
          onChange={(e) => onChange({ ...filters, during: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="after">after:</Label>
        <Input
          id="after"
          type="date"
          value={filters.after || ''}
          onChange={(e) => onChange({ ...filters, after: e.target.value })}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="pinned"
          checked={filters.pinned || false}
          onCheckedChange={(checked) => onChange({ ...filters, pinned: checked })}
        />
        <Label htmlFor="pinned">Show pinned only</Label>
      </div>
    </div>
  )
}

