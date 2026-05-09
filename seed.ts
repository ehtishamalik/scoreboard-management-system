import * as schema from './src/lib/server/db/schema';

import { neon } from '@neondatabase/serverless';
import { drizzle as drizzleHttp } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { betterAuth } from 'better-auth';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const db = drizzleHttp(neon(process.env.DATABASE_URL), { schema });

const PASSWORD = 'password1234';

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true
  }
});

// ======================================================
// SIMPLE LOGGER
// ======================================================

const log = {
  info: (msg: string, data?: any) => console.log(`ℹ️ ${msg}`, data ?? ''),
  success: (msg: string, data?: any) => console.log(`✅ ${msg}`, data ?? ''),
  warn: (msg: string, data?: any) => console.log(`⚠️ ${msg}`, data ?? ''),
  error: (msg: string, data?: any) => console.log(`❌ ${msg}`, data ?? '')
};

// ======================================================
// RETRY WRAPPER
// ======================================================

async function retry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: any;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      log.warn(`Retry attempt ${i + 1} failed`);
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }

  throw lastError;
}

// ======================================================
// PIPELINE STEP RUNNER
// ======================================================

async function step(name: string, fn: () => Promise<void>) {
  try {
    log.info(`Starting: ${name}`);
    await fn();
    log.success(`Finished: ${name}`);
  } catch (err) {
    log.error(`Failed: ${name}`, err);
    throw err;
  }
}

// ======================================================
// DATA
// ======================================================

const users = [
  { name: 'James Anderson', email: 'admin@ehtishamalik.com', role: 'ADMIN' },
  { name: 'Michael Thompson', email: 'committee1@ehtishamalik.com', role: 'COMMITTEE' },
  { name: 'Emily Roberts', email: 'committee2@ehtishamalik.com', role: 'COMMITTEE' },

  { name: 'John Smith', email: 'john.smith@example.com', role: 'USER' },
  { name: 'Emma Johnson', email: 'emma.johnson@example.com', role: 'USER' },
  { name: 'David Williams', email: 'david.williams@example.com', role: 'USER' },
  { name: 'Olivia Brown', email: 'olivia.brown@example.com', role: 'USER' },
  { name: 'William Jones', email: 'william.jones@example.com', role: 'USER' },
  { name: 'Sophia Miller', email: 'sophia.miller@example.com', role: 'USER' },
  { name: 'Daniel Davis', email: 'daniel.davis@example.com', role: 'USER' },
  { name: 'Isabella Wilson', email: 'isabella.wilson@example.com', role: 'USER' },
  { name: 'Matthew Taylor', email: 'matthew.taylor@example.com', role: 'USER' },
  { name: 'Ava Martinez', email: 'ava.martinez@example.com', role: 'USER' }
];

// ======================================================
// PIPELINE STATE
// ======================================================

const state: {
  users: Record<string, any>;
  participations: Record<string, string>;
  tournamentId?: string;
  teams: any[];
} = {
  users: {},
  participations: {},
  teams: []
};

// ======================================================
// STEP 1 - USERS (IDEMPOTENT)
// ======================================================

async function seedUsers() {
  for (const u of users) {
    await retry(async () => {
      const existing = await db.query.user.findFirst({
        where: eq(schema.user.email, u.email)
      });

      if (existing) {
        state.users[u.email] = existing;
        return;
      }

      const { user } = await auth.api.signUpEmail({
        body: {
          email: u.email,
          password: PASSWORD,
          name: u.name
        }
      });

      if (!user) throw new Error('User not found after creation');

      await db
        .update(schema.user)
        .set({ role: u.role as any, emailVerified: true })
        .where(eq(schema.user.id, user.id));

      state.users[u.email] = user;
    });
  }
}

// ======================================================
// STEP 2 - TOURNAMENT
// ======================================================

async function seedTournament() {
  const slug = 'summer-championship-2026';

  const existing = await db.query.tournament.findFirst({
    where: eq(schema.tournament.slug, slug)
  });

  if (existing) {
    state.tournamentId = existing.id;
    return;
  }

  const created = await db
    .insert(schema.tournament)
    .values({
      name: 'Summer Championship 2026',
      slug,
      startDate: '2026-06-01',
      endDate: '2026-06-30',
      isActive: true,
      isStarted: true
    })
    .returning();

  state.tournamentId = created[0].id;
}

// ======================================================
// STEP 3 - PARTICIPATIONS
// ======================================================

async function seedParticipations() {
  const userEmails = Object.keys(state.users);

  for (const email of userEmails) {
    const user = state.users[email];

    const existing = await db.query.participation.findFirst({
      where: eq(schema.participation.userId, user.id)
    });

    const participation =
      existing ??
      (
        await db
          .insert(schema.participation)
          .values({
            userId: user.id,
            tournamentId: state.tournamentId!
          })
          .returning()
      )[0];

    state.participations[email] = participation.id;
  }
}

// ======================================================
// STEP 4 - TEAMS
// ======================================================

async function seedTeams() {
  const exists = await db.query.teams.findMany();

  if (exists.length > 0) {
    state.teams = exists;
    return;
  }

  const teamData = [
    {
      name: 'Thunder Bolts',
      p1: 'john.smith@example.com',
      p2: 'emma.johnson@example.com'
    },
    {
      name: 'Shadow Wolves',
      p1: 'david.williams@example.com',
      p2: 'olivia.brown@example.com'
    },
    {
      name: 'Red Dragons',
      p1: 'william.jones@example.com',
      p2: 'sophia.miller@example.com'
    },
    {
      name: 'Blue Phoenix',
      p1: 'daniel.davis@example.com',
      p2: 'isabella.wilson@example.com'
    }
  ];

  for (const t of teamData) {
    const created = await db
      .insert(schema.teams)
      .values({
        name: t.name,
        participationPlayerOne: state.participations[t.p1],
        participationPlayerTwo: state.participations[t.p2],
        tournamentId: state.tournamentId!
      })
      .returning();

    state.teams.push(created[0]);
  }
}

// ======================================================
// STEP 5 - MATCHES
// ======================================================

async function seedMatches() {
  const exists = await db.query.match.findMany();
  if (exists.length > 0) return;

  await db.insert(schema.match).values([
    {
      tournamentId: state.tournamentId!,
      team1Id: state.teams[0].id,
      team2Id: state.teams[1].id,
      team1Points: 21,
      team2Points: 17,
      winnerId: state.teams[0].id,
      playDate: '2026-06-10'
    },
    {
      tournamentId: state.tournamentId!,
      team1Id: state.teams[2].id,
      team2Id: state.teams[3].id,
      team1Points: 18,
      team2Points: 21,
      winnerId: state.teams[3].id,
      playDate: '2026-06-11'
    }
  ]);
}

// ======================================================
// RUN PIPELINE
// ======================================================

async function run() {
  await step('Seed Users', seedUsers);
  await step('Seed Tournament', seedTournament);
  await step('Seed Participations', seedParticipations);
  await step('Seed Teams', seedTeams);
  await step('Seed Matches', seedMatches);

  log.success('🚀 Seed completed successfully');
}

run().catch((err) => {
  log.error('Seed crashed', err);
  process.exit(1);
});
