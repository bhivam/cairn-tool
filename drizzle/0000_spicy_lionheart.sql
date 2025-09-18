CREATE TYPE "public"."handedness" AS ENUM('one_handed', 'two_handed');--> statement-breakpoint
CREATE TYPE "public"."trait_tier" AS ENUM('untrained', 'proficient', 'mastered');--> statement-breakpoint
CREATE TYPE "public"."weapon_class" AS ENUM('Simple', 'Polearm', 'Sword', 'Dagger', 'Axe', 'Bow', 'Hammer');--> statement-breakpoint
CREATE TABLE "account" (
	"userId" uuid NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "character_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"characterId" uuid NOT NULL,
	"vitMax" integer DEFAULT 0 NOT NULL,
	"vitCurrent" integer DEFAULT 0 NOT NULL,
	"dexMax" integer DEFAULT 0 NOT NULL,
	"dexCurrent" integer DEFAULT 0 NOT NULL,
	"wisMax" integer DEFAULT 0 NOT NULL,
	"wisCurrent" integer DEFAULT 0 NOT NULL,
	"chaMax" integer DEFAULT 0 NOT NULL,
	"chaCurrent" integer DEFAULT 0 NOT NULL,
	"hpMax" integer DEFAULT 0 NOT NULL,
	"hpCurrent" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"userId" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"portrait" varchar(500),
	"region" varchar(100),
	"status" varchar(100),
	"religion" varchar(100),
	"language" varchar(100),
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"content" varchar(256) NOT NULL,
	"commandResult" jsonb,
	"createdById" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" varchar(255) PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"emailVerified" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"image" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "verification_token" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "weapon_classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"name" "weapon_class" NOT NULL,
	"mastered_bonus_attribute" varchar(16) NOT NULL,
	"mastered_bonus_amount" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "weapon_classes_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "weapon_traits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"weapon_id" uuid NOT NULL,
	"tier" "trait_tier" NOT NULL,
	"name" varchar(128) NOT NULL,
	"description" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weapons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"name" varchar(128) NOT NULL,
	"class_id" uuid NOT NULL,
	"die_count" integer DEFAULT 1 NOT NULL,
	"die_faces" integer NOT NULL,
	"reach_yards" integer,
	"range_min_yards" integer,
	"range_max_yards" integer,
	"is_ranged" boolean DEFAULT false NOT NULL,
	"handedness" "handedness",
	"rules_notes" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	CONSTRAINT "weapons_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_stats" ADD CONSTRAINT "character_stats_characterId_character_id_fk" FOREIGN KEY ("characterId") REFERENCES "public"."character"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character" ADD CONSTRAINT "character_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_createdById_user_id_fk" FOREIGN KEY ("createdById") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weapon_traits" ADD CONSTRAINT "weapon_traits_weapon_id_weapons_id_fk" FOREIGN KEY ("weapon_id") REFERENCES "public"."weapons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weapons" ADD CONSTRAINT "weapons_class_id_weapon_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."weapon_classes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "created_by_idx" ON "message" USING btree ("createdById");--> statement-breakpoint
CREATE INDEX "t_user_id_idx" ON "session" USING btree ("userId");