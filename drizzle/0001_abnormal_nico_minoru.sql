CREATE TABLE "character_weapon_skill" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"character_id" uuid NOT NULL,
	"weapon_id" uuid NOT NULL,
	"tier" "trait_tier" NOT NULL
);
--> statement-breakpoint
ALTER TABLE "character_weapon_skill" ADD CONSTRAINT "character_weapon_skill_character_id_character_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."character"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_weapon_skill" ADD CONSTRAINT "character_weapon_skill_weapon_id_weapons_id_fk" FOREIGN KEY ("weapon_id") REFERENCES "public"."weapons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cws_character_weapon_active_unique" ON "character_weapon_skill" USING btree ("character_id","weapon_id") WHERE "character_weapon_skill"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "cws_character_id_idx" ON "character_weapon_skill" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "cws_weapon_id_idx" ON "character_weapon_skill" USING btree ("weapon_id");