# Scoreboard Management System

A modern Progressive Web App (PWA) built with SvelteKit for managing tournaments, teams, matches, and user authentication. It leverages modern technologies like SvelteKit, Drizzle ORM, Postgres, TailwindCSS, and authentication services for a robust, scalable, and secure experience. [**Visit the app**](https://score.ehtishamalik.com)

> ⚡ This application was originally created for [**Lycus Inc.**](https://www.lycusinc.com) to streamline and digitize their tournament management process.
> Designed with scalability in mind, it can be adapted for schools, sports clubs, and corporate events, offering organizers a seamless way to register teams, manage matches, and showcase live standings. Its intuitive interface ensures both administrators and participants have an engaging, user-friendly experience.

<img width="1344" height="676" alt="image" src="https://github.com/user-attachments/assets/748f9452-0a8c-404d-a374-9010b9af5f8b" />

## Features

- **Progressive Web App (PWA)** capabilities
  - Offline support via service workers
  - Installable on mobile and desktop devices
  - Push notifications support
  - Fast loading and responsive design
- User authentication (Google OAuth)
- Role-based access control (Admin, Committee, User)
- Tournament, team, and match management
- Standings and statistics API
- Dashboard for statistics
- Responsive UI with TailwindCSS

## Tech Stack

- SvelteKit
- TailwindCSS
- Drizzle ORM
- Postgres (Neon serverless recommended)
- Email/Password Auth
- Service Workers (PWA)
- Vite

## Getting Started

### Prerequisites

- Node.js (v22+ recommended)
- Bun JS runtime
- PostgreSQL database (Neon DB)

### Installation

1. Fork the repository.
2. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/scoreboard-management-system.git
   cd scoreboard-management-system
   ```
3. Install dependencies:
   ```bash
   bun install
   ```
4. Fill in the following environment variables in your `.env` file:
   - `DATABASE_URL` (Postgres connection string)
   - `BETTER_AUTH_SECRET` (authentication secret)
   - `PUBLIC_VAPID_KEY` and `PRIVATE_VAPID_KEY` (for push notifications)

### Database Setup

Run migrations:

```bash
bun run db:migrate
```

Seed the DB with mock Data:

```bash
bun run seed
```

## Development

Start the development server:

```bash
bun run dev
```

## Build & Preview

Build for production:

```bash
bun run build
```

Preview production build:

```bash
bun run preview
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

Uses secure authentication with OAuth. Supports Google authentication. Role-based access is enforced in API routes and UI components.

## API Endpoints

- `/api/standings/[id]`: Get tournament standings by ID
- `/api/matches`, `/api/teams`, `/api/tournaments`: Protected committee/admin routes
- `/api/users`: Protected admin route

## PWA Features

This application is built as a Progressive Web App, which means:

- Works offline or with poor internet connections
- Can be installed on home screens on mobile and desktop
- Loads quickly with a responsive design for all device sizes
- Updates automatically when new versions are deployed

## Environment Variables

- `DATABASE_URL`: NeonDB Postgres connection string
- `BETTER_AUTH_SECRET`: Auth secret
- `PUBLIC_VAPID_KEY`: Vapid key
- `PRIVATE_VAPID_KEY`: Vapid key

## Deployment

Configured for Vercel deployment via `@sveltejs/adapter-vercel`. See `svelte.config.js` for adapter settings.

## Default Accounts

#### You can login with any of the following demo accounts:

Default password is: password1234

### Admin User

- Email: admin@ehtishamalik.com

### Committee User

- Email: committee1@ehtishamalik.com
- Email: committee2@ehtishamalik.com

### Regular User

- Email: john.smith@example.com
- Email: emma.johnson@example.com

There are many regular users. You can see there emails from the admin panel.

## License

Copyright (c) 2026 ehtishamalik

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.
