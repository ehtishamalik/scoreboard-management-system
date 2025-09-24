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
- Responsive UI with TailwindCSS

## Tech Stack

- SvelteKit
- TailwindCSS
- Drizzle ORM
- Postgres (Neon serverless recommended)
- OAuth Authentication
- Service Workers (PWA)
- Vite

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Yarn or npm
- PostgreSQL database

### Installation

1. Fork the repository.
2. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/scoreboard-management-system.git
   cd scoreboard-management-system
   ```
3. Install dependencies:
   ```bash
   yarn install
   # or
   npm install
   ```
4. Fill in the following environment variables in your `.env` file:
   - `DATABASE_URL` (Postgres connection string)
   - `AUTH_SECRET` (authentication secret)
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

## Deployment

Configured for Vercel deployment via `@sveltejs/adapter-vercel`. See `svelte.config.js` for adapter settings.

## Default Accounts

#### You can login with any of the following demo accounts:

Default password is: password1234

### Admin User

- Email: hannahward@ehtishamalik.com

### Committee User

- Email: emilycooper@ehtishamalik.com
- Email: laurenscott@ehtishamalik.com

### Regular User

- Email: ethanparker@ehtishamalik.com
- Email: emmahughes@ehtishamalik.com

There are many regular users. You can see there emails from the admin panel.

## License

Copyright (c) 2025 ehtishamalik

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.
