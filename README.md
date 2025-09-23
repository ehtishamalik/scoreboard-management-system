# Lycus Score

Lycus Score is a SvelteKit web application for managing tournaments, teams, matches, and user authentication. It leverages modern technologies like SvelteKit, Drizzle ORM, Neon serverless Postgres, TailwindCSS, and Better Auth for a robust, scalable, and secure experience.

## Features

- User authentication (Google OAuth)
- Role-based access control (Admin, Committee, User)
- Tournament, team, and match management
- Standings and statistics API
- Responsive UI with TailwindCSS
- Service worker for offline support

## Tech Stack

- SvelteKit
- TailwindCSS
- Drizzle ORM
- Neon serverless Postgres
- Better Auth
- Vite

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Yarn or npm
- PostgreSQL database (Neon recommended)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ashafi-lycus/lycus_score.git
   cd lycus_score
   ```
2. Install dependencies:
   ```bash
   yarn install
   # or
   npm install
   ```
3. Fill in the following environment variables in your `.env` file:
   - `DATABASE_URL` (Postgres connection string)
   - `BETTER_AUTH_SECRET` (authentication secret)
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (for Google OAuth)

### Database Setup

Run migrations:

```bash
yarn db:migrate
# or
npm run db:migrate
```

## Development

Start the development server:

```bash
yarn dev
# or
npm run dev
```

## Build & Preview

Build for production:

```bash
yarn build
# or
npm run build
```

Preview production build:

```bash
yarn preview
# or
npm run preview
```

## Scripts

- `dev`: Start development server
- `build`: Build for production
- `preview`: Preview production build
- `db:migrate`: Run database migrations
- `db:push`: Push schema changes
- `db:generate`: Generate migration files
- `db:studio`: Open Drizzle Studio
- `lint`: Run Prettier and ESLint
- `format`: Format codebase

## Authentication

Uses Better Auth for secure authentication. Supports Google OAuth. Role-based access is enforced in API routes and UI components.

## API Endpoints

- `/api/standings/[id]`: Get tournament standings by ID
- `/api/matches`, `/api/teams`, `/api/tournaments`: Protected committee/admin routes
- `/api/users`: Protected admin route

## Environment Variables

- `DATABASE_URL`: Postgres connection string
- `BETTER_AUTH_SECRET`: Auth secret
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: Google OAuth credentials

## Deployment

Configured for Vercel via `@sveltejs/adapter-vercel`. See `svelte.config.js` for adapter settings.

## License

Proprietary and Confidential

Copyright (c) 2025 Lycus Inc. All Rights Reserved.

This is a private repository containing proprietary software. No permission is granted to copy, distribute, modify, or use this software in any way without explicit written permission from Lycus Inc. This software and its source code are protected by copyright law and international treaties.

Unauthorized access, reproduction, or distribution of this software, or any portion of it, may result in severe civil and criminal penalties.
