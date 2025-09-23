import {
	pgTable,
	text,
	timestamp,
	boolean,
	integer,
	date,
	pgEnum,
	varchar
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth-schema';
import { nanoid } from '../../helpers/nanoid';

export const MATCH_TYPE = pgEnum('match_type_enum', ['ROUNDROBIN', 'SEMIFINAL', 'FINAL']);

export const tournament = pgTable('tournament', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => nanoid()),
	name: varchar('name', { length: 192 }).notNull().unique(),
	slug: varchar('slug', { length: 255 }).notNull().unique(),
	startDate: date('start_date'),
	endDate: date('end_date'),
	isActive: boolean('is_active').default(true).notNull(),
	isFinalized: boolean('is_finalized').default(false).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull()
});

export const participation = pgTable('participation', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => nanoid()),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	tournamentId: text('tournament_id')
		.notNull()
		.references(() => tournament.id, { onDelete: 'cascade' }),
	joinedAt: timestamp('joined_at').defaultNow().notNull()
});

export const teams = pgTable('team', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => nanoid()),
	name: varchar('name', { length: 192 }).notNull(),
	participationPlayerOne: text('team_player_one')
		.notNull()
		.references(() => participation.id, { onDelete: 'cascade' }),
	participationPlayerTwo: text('team_player_two')
		.notNull()
		.references(() => participation.id, { onDelete: 'cascade' }),
	tournamentId: text('tournament_id')
		.notNull()
		.references(() => tournament.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const match = pgTable('match', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => nanoid()),
	tournamentId: text('tournament_id')
		.notNull()
		.references(() => tournament.id, { onDelete: 'cascade' }),
	team1Id: text('team1_id')
		.notNull()
		.references(() => teams.id, { onDelete: 'cascade' }),
	team2Id: text('team2_id')
		.notNull()
		.references(() => teams.id, { onDelete: 'cascade' }),
	team1Points: integer('team1_points').default(0).notNull(),
	team2Points: integer('team2_points').default(0).notNull(),
	winnerId: text('winner_id').references(() => teams.id, {
		onDelete: 'no action'
	}),
	playDate: date('played_date').notNull(),
	type: MATCH_TYPE('type').default('ROUNDROBIN').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull()
});

// -- RELATIONS --
// Defining relationships for easier querying with Drizzle ORM.

export const tournamentRelations = relations(tournament, ({ many }) => ({
	teams: many(teams),
	matches: many(match)
}));

export const userRelations = relations(user, ({ many }) => ({
	participations: many(participation)
}));

export const participationRelations = relations(participation, ({ one }) => ({
	user: one(user, {
		fields: [participation.userId],
		references: [user.id]
	}),
	tournament: one(tournament, {
		fields: [participation.tournamentId],
		references: [tournament.id]
	})
}));

export const teamRelations = relations(teams, ({ one }) => ({
	tournament: one(tournament, {
		fields: [teams.tournamentId],
		references: [tournament.id]
	}),
	participationPlayerOne: one(participation, {
		fields: [teams.participationPlayerOne],
		references: [participation.id],
		relationName: 'playerOne'
	}),
	participationPlayerTwo: one(participation, {
		fields: [teams.participationPlayerTwo],
		references: [participation.id],
		relationName: 'playerTwo'
	})
}));

export const matchRelations = relations(match, ({ one }) => ({
	tournament: one(tournament, {
		fields: [match.tournamentId],
		references: [tournament.id]
	}),
	team1: one(teams, {
		fields: [match.team1Id],
		references: [teams.id],
		relationName: 'team1'
	}),
	team2: one(teams, {
		fields: [match.team2Id],
		references: [teams.id],
		relationName: 'team2'
	}),
	winner: one(teams, {
		fields: [match.winnerId],
		references: [teams.id],
		relationName: 'winner'
	})
}));
