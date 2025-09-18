import { relations, sql } from "drizzle-orm";
import {
  uniqueIndex,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

export function baseColumns() {
  return {
    id: uuid("id").defaultRandom().primaryKey().notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", {
      withTimezone: true,
    }),
  };
}

export const messages = pgTable(
  "message",
  () => ({
    ...baseColumns(),
    content: varchar({ length: 256 }).notNull(),
    commandResult: jsonb(),
    createdById: uuid()
      .notNull()
      .references(() => users.id),
  }),
  (t) => [index("created_by_idx").on(t.createdById)],
);

export const messagesRelations = relations(messages, ({ one }) => ({
  user: one(users, {
    fields: [messages.createdById],
    references: [users.id],
  }),
}));

export const users = pgTable("user", () => ({
  ...baseColumns(),
  name: varchar({ length: 255 }),
  email: varchar({ length: 255 }).notNull(),
  emailVerified: timestamp({
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar({ length: 255 }),
}));

export const characters = pgTable("character", () => ({
  ...baseColumns(),
  userId: uuid()
    .notNull()
    .references(() => users.id),
  name: varchar({ length: 255 }).notNull(),
  portrait: varchar({ length: 500 }),
  region: varchar({ length: 100 }),
  status: varchar({ length: 100 }),
  religion: varchar({ length: 100 }),
  language: varchar({ length: 100 }),
  notes: text(),
}));

export const charactersRelations = relations(characters, ({ one }) => ({
  user: one(users, {
    fields: [characters.userId],
    references: [users.id],
  }),
  stats: one(characterStats, {
    fields: [characters.id],
    references: [characterStats.characterId],
  }),
}));

export const characterStats = pgTable("character_stats", () => ({
  ...baseColumns(),
  characterId: uuid()
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  vitMax: integer().notNull().default(0),
  vitCurrent: integer().notNull().default(0),
  dexMax: integer().notNull().default(0),
  dexCurrent: integer().notNull().default(0),
  wisMax: integer().notNull().default(0),
  wisCurrent: integer().notNull().default(0),
  chaMax: integer().notNull().default(0),
  chaCurrent: integer().notNull().default(0),
  hpMax: integer().notNull().default(0),
  hpCurrent: integer().notNull().default(0),
}));

export const characterStatsRelations = relations(characterStats, ({ one }) => ({
  character: one(characters, {
    fields: [characterStats.characterId],
    references: [characters.id],
  }),
}));

export const weaponClassEnum = pgEnum("weapon_class", [
  "Simple", // untrained weapons
  "Polearm",
  "Sword",
  "Dagger",
  "Axe",
  "Bow",
  "Hammer",
]);

export const handednessEnum = pgEnum("handedness", [
  "one_handed",
  "two_handed",
]);

export const traitTierEnum = pgEnum("trait_tier", [
  "untrained",
  "proficient",
  "mastered",
]);

export const weaponClasses = pgTable("weapon_classes", () => ({
  ...baseColumns(),
  name: weaponClassEnum("name").unique().notNull(),
  masteredBonusAttribute: varchar("mastered_bonus_attribute", {
    length: 16,
  }).notNull(),
  masteredBonusAmount: integer("mastered_bonus_amount").notNull().default(1),
}));
export const weaponClassesRelations = relations(weaponClasses, ({ many }) => ({
  weapons: many(weapons),
}));

export const weapons = pgTable("weapons", () => ({
  ...baseColumns(),
  name: varchar("name", { length: 128 }).notNull().unique(),
  classId: uuid("class_id")
    .notNull()
    .references(() => weaponClasses.id, { onDelete: "restrict" }),
  // damage roll specs
  dieCount: integer("die_count").notNull().default(1),
  dieFaces: integer("die_faces").notNull(), // e.g., 4, 6, 8, 10, 12
  reachYards: integer("reach_yards"), // melee reach, null for pure ranged
  rangeMinYards: integer("range_min_yards"), // null for melee
  rangeMaxYards: integer("range_max_yards"), // null for melee
  isRanged: boolean("is_ranged").notNull().default(false),
  handedness: handednessEnum("handedness"), // null allowed for "any" but we use 1H/2H
  // Notes for special rules (e.g., close-range disadvantage for longbow)
  rulesNotes: text("rules_notes"),
  // Optional tags if you want quick filtering
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
}));

export const weaponsRelations = relations(weapons, ({ one, many }) => ({
  traits: many(weaponTraits),
  class: one(weaponClasses, {
    fields: [weapons.classId],
    references: [weaponClasses.id],
  }),
}));

export const weaponTraits = pgTable("weapon_traits", () => ({
  ...baseColumns(),
  weaponId: uuid("weapon_id")
    .notNull()
    .references(() => weapons.id, { onDelete: "cascade" }),
  tier: traitTierEnum("tier").notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description").notNull(),
}));

export const weaponTraitsRelations = relations(weaponTraits, ({ one }) => ({
  weapon: one(weapons, {
    fields: [weaponTraits.weaponId],
    references: [weapons.id],
  }),
}));

export const accounts = pgTable(
  "account",
  () => ({
    userId: uuid()
      .notNull()
      .references(() => users.id),
    type: varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: varchar({ length: 255 }).notNull(),
    providerAccountId: varchar({ length: 255 }).notNull(),
    refresh_token: text(),
    access_token: text(),
    expires_at: integer(),
    token_type: varchar({ length: 255 }),
    scope: varchar({ length: 255 }),
    id_token: text(),
    session_state: varchar({ length: 255 }),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const characterWeaponSkill = pgTable(
  "character_weapon_skill",
  () => ({
    ...baseColumns(),
    characterId: uuid("character_id")
      .notNull()
      .references(() => characters.id, { onDelete: "cascade" }),
    weaponId: uuid("weapon_id")
      .notNull()
      .references(() => weapons.id, { onDelete: "cascade" }),
    tier: traitTierEnum("tier").notNull(), // "untrained" | "proficient" | "mastered"
  }),
  (t) => [
    // Prevent multiple active records for the same (character, weapon)
    uniqueIndex("cws_character_weapon_active_unique")
      .on(t.characterId, t.weaponId)
      .where(sql`${t.deletedAt} IS NULL`),

    // Helpful lookup indexes
    index("cws_character_id_idx").on(t.characterId),
    index("cws_weapon_id_idx").on(t.weaponId),
  ],
);

export const characterWeaponSkillRelations = relations(
  characterWeaponSkill,
  ({ one }) => ({
    character: one(characters, {
      fields: [characterWeaponSkill.characterId],
      references: [characters.id],
    }),
    weapon: one(weapons, {
      fields: [characterWeaponSkill.weaponId],
      references: [weapons.id],
    }),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = pgTable(
  "session",
  () => ({
    sessionToken: varchar({ length: 255 }).notNull().primaryKey(),
    userId: uuid()
      .notNull()
      .references(() => users.id),
    expires: timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [index("t_user_id_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = pgTable(
  "verification_token",
  () => ({
    identifier: varchar({ length: 255 }).notNull(),
    token: varchar({ length: 255 }).notNull(),
    expires: timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

relations(users, ({ many }) => ({
  messages: many(messages),
  accounts: many(accounts),
  characters: many(characters),
}));

