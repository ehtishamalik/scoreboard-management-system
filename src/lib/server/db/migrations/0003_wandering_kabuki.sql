CREATE TABLE "match_series" (
	"id" text PRIMARY KEY NOT NULL,
	"tournament_id" text NOT NULL,
	"team1_id" text NOT NULL,
	"team2_id" text NOT NULL,
	"type" "match_type_enum" DEFAULT 'SEMIFINAL' NOT NULL,
	"winner_id" text,
	"game1_team1_points" integer DEFAULT 0 NOT NULL,
	"game1_team2_points" integer DEFAULT 0 NOT NULL,
	"game2_team1_points" integer DEFAULT 0 NOT NULL,
	"game2_team2_points" integer DEFAULT 0 NOT NULL,
	"game3_team1_points" integer DEFAULT 0 NOT NULL,
	"game3_team2_points" integer DEFAULT 0 NOT NULL,
	"played_date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "match_series" ADD CONSTRAINT "match_series_tournament_id_tournament_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournament"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_series" ADD CONSTRAINT "match_series_team1_id_team_id_fk" FOREIGN KEY ("team1_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_series" ADD CONSTRAINT "match_series_team2_id_team_id_fk" FOREIGN KEY ("team2_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_series" ADD CONSTRAINT "match_series_winner_id_team_id_fk" FOREIGN KEY ("winner_id") REFERENCES "public"."team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match" DROP COLUMN "type";