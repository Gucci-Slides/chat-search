# Chat Search UI

A modern chat interface with powerful search capabilities built with Next.js 14, OpenSearch, and Tailwind CSS.

## Features

- Real-time message search within conversations
- Conversation threading and organization
- Message attachments support (images, files, links)
- Mentions and pinned messages
- Dark mode support
- Responsive design

## Tech Stack

- Next.js 14
- OpenSearch
- TypeScript
- Tailwind CSS
- Shadcn/ui Components

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/chat-search-ui.git
cd chat-search-ui
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up OpenSearch:
```bash
docker-compose up -d
```

4. Set up environment variables:
```bash
cp .env.example .env.local
```

5. Run the development server:
```bash
npm run dev
# or
yarn dev
```

6. Initialize the search indices:
Visit `http://localhost:3000/setup` to set up the search indices and load test data.

## Environment Variables

Create a `.env.local` file with the following variables:

```env
OPENSEARCH_URL=https://localhost:9200
OPENSEARCH_USERNAME=admin
OPENSEARCH_PASSWORD=admin
```

## Development

The project structure follows Next.js 14 conventions:

```
/app                # Next.js app router pages
/components        # React components
/lib               # Utility functions and shared logic
/types             # TypeScript type definitions
/public            # Static assets
```

## License

MIT
