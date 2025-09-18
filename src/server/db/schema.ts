import { relations, sql } from "drizzle-orm";
import { index, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

export const messages = pgTable(
  "message",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    content: d.varchar({ length: 256 }).notNull(),
    commandResult: d.jsonb(),
    createdById: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("created_by_idx").on(t.createdById)],
);

export const messagesRelations = relations(messages, ({ one }) => ({
  user: one(users, {
    fields: [messages.createdById],
    references: [users.id],
  }),
}));

export const users = pgTable("user", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }),
  email: d.varchar({ length: 255 }).notNull(),
  emailVerified: d
    .timestamp({
      mode: "date",
      withTimezone: true,
    })
    .default(sql`CURRENT_TIMESTAMP`),
  image: d.varchar({ length: 255 }),
}));

export const characters = pgTable("character", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  userId: d
    .varchar({ length: 255 })
    .notNull()
    .references(() => users.id),
  name: d.varchar({ length: 255 }).notNull(),
  portrait: d.varchar({ length: 500 }),
  region: d.varchar({ length: 100 }),
  status: d.varchar({ length: 100 }),
  religion: d.varchar({ length: 100 }),
  language: d.varchar({ length: 100 }),
  notes: d.text(),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
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

export const characterStats = pgTable("character_stats", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  characterId: d
    .integer()
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  vitMax: d.integer().notNull().default(0),
  vitCurrent: d.integer().notNull().default(0),
  dexMax: d.integer().notNull().default(0),
  dexCurrent: d.integer().notNull().default(0),
  wisMax: d.integer().notNull().default(0),
  wisCurrent: d.integer().notNull().default(0),
  chaMax: d.integer().notNull().default(0),
  chaCurrent: d.integer().notNull().default(0),
  hpMax: d.integer().notNull().default(0),
  hpCurrent: d.integer().notNull().default(0),
}));

export const characterStatsRelations = relations(characterStats, ({ one }) => ({
  character: one(characters, {
    fields: [characterStats.characterId],
    references: [characters.id],
  }),
}));

export const accounts = pgTable(
  "account",
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.varchar({ length: 255 }),
    scope: d.varchar({ length: 255 }),
    id_token: d.text(),
    session_state: d.varchar({ length: 255 }),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = pgTable(
  "session",
  (d) => ({
    sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [index("t_user_id_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = pgTable(
  "verification_token",
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

relations(users, ({ many }) => ({
  messages: many(messages),
  accounts: many(accounts),
  characters: many(characters),
}));

