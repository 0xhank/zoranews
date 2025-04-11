# Zora News - A News-Driven Memecoin Generator

## Monorepo Structure

This project is organized as a monorepo with the following packages:

- `packages/client`: React frontend application
- `packages/server`: tRPC server backend
- `packages/shared`: Shared types and utilities

## Development

### Prerequisites

- Node.js 16+
- pnpm 7+

### Setup

```bash
# Install dependencies
pnpm install

# Start development servers (client and server)
pnpm dev

# Start only the client
pnpm dev:client

# Start only the server
pnpm dev:server

# Build all packages
pnpm build
```

## Project Overview

An automated system that scrapes recent news articles, analyzes trending topics, and generates custom memecoins with AI-generated logos and descriptions.

### Features

- News scraping from popular sources
- Topic analysis to identify memeable content
- Memecoin generation based on trending topics
- AI-generated logos using DALL-E
- Smart contract creation and deployment

## License

MIT
