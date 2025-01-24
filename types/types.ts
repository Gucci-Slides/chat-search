export interface Message {
  id: string
  conversationId: string
  username: string
  handle: string
  text: string
  date: Date
  mentions: string[]
  attachmentType: string | null
  pinned: boolean
  highlighted?: string
}

export interface Participant {
  username: string
  handle: string
}

export interface Conversation {
  id: string
  username: string
  handle: string
  lastMessage: string
  date: Date
  participants: Participant[]
}

