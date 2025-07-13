import { relations, sql } from "drizzle-orm";
import { index, pgTableCreator, primaryKey } from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

export const createTable = pgTableCreator((name) => `cairn-tool_${name}`);

export const messages = createTable(
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
  (t) => [
    index("created_by_idx").on(t.createdById),
  ],
);

export const messagesRelations = relations(messages, ({ one }) => ({
  user: one(users, {
    fields: [messages.createdById],
    references: [users.id]
  })
}))

export const users = createTable("user", (d) => ({
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

// Character Identity
export const characters = createTable("character", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  userId: d
    .varchar({ length: 255 })
    .notNull()
    .references(() => users.id),
  name: d.varchar({ length: 255 }).notNull(),
  portrait: d.varchar({ length: 500 }), // URL to uploaded image
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

// Character Statistics
export const characterStats = createTable("character_stats", (d) => ({
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
  acMax: d.integer().notNull().default(0),
  acCurrent: d.integer().notNull().default(0),
  speed: d.integer().notNull().default(0),
  agility: d.integer().notNull().default(0), // Auto-filled from DEX
  spellCastingLevel: d.integer().notNull().default(0),
  wisdomProgress: d.integer().notNull().default(0), // 0-20 for progress bar
}));

// Character Classes (for multiclass support)
export const characterClasses = createTable("character_class", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  characterId: d
    .integer()
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  className: d.varchar({ length: 100 }).notNull(),
  level: d.integer().notNull().default(1),
}));

// Weapons
export const weapons = createTable("weapon", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  characterId: d
    .integer()
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  name: d.varchar({ length: 100 }).notNull(),
  damageDie: d.varchar({ length: 20 }).notNull(), // e.g., "1d6", "2d4"
  proficiency: d.varchar({ length: 50 }).notNull(), // "Trained", "Expert", etc.
  traits: d.text(), // JSON string of weapon traits
  equipped: d.boolean().notNull().default(false),
}));

// Inventory System
export const inventorySlots = createTable("inventory_slot", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  characterId: d
    .integer()
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  slotType: d.varchar({ length: 50 }).notNull(), // "hand", "pocket", "belt", "bag", "negligence"
  slotNumber: d.integer().notNull(), // 1, 2, 3, etc.
  itemName: d.varchar({ length: 255 }),
  itemDescription: d.text(),
  quantity: d.integer().notNull().default(1),
  isEquipped: d.boolean().notNull().default(false),
}));

// Coin Purse
export const coinPurses = createTable("coin_purse", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  characterId: d
    .integer()
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  gold: d.integer().notNull().default(0),
  silver: d.integer().notNull().default(0),
  copper: d.integer().notNull().default(0),
  platinum: d.integer().notNull().default(0),
}));

// Bag Types
export const bagTypes = createTable("bag_type", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  characterId: d
    .integer()
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  bagName: d.varchar({ length: 100 }).notNull(), // "Backpack", "Saddlebag", etc.
  slotCount: d.integer().notNull().default(0),
  location: d.varchar({ length: 100 }), // "carrying", "house", "mule", "courier"
}));

// Magic System
export const spells = createTable("spell", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  characterId: d
    .integer()
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  name: d.varchar({ length: 255 }).notNull(),
  level: d.integer().notNull().default(0),
  school: d.varchar({ length: 100 }),
  description: d.text(),
  isPrepared: d.boolean().notNull().default(false),
}));

export const scrolls = createTable("scroll", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  characterId: d
    .integer()
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  spellName: d.varchar({ length: 255 }).notNull(),
  level: d.integer().notNull().default(0),
  quantity: d.integer().notNull().default(1),
}));

export const potions = createTable("potion", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  characterId: d
    .integer()
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  name: d.varchar({ length: 255 }).notNull(),
  effect: d.text(),
  quantity: d.integer().notNull().default(1),
}));

export const accounts = createTable(
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

export const sessions = createTable(
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

export const verificationTokens = createTable(
  "verification_token",
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

// Character Relations
export const charactersRelations = relations(characters, ({ one, many }) => ({
  user: one(users, {
    fields: [characters.userId],
    references: [users.id]
  }),
  stats: one(characterStats, {
    fields: [characters.id],
    references: [characterStats.characterId]
  }),
  classes: many(characterClasses),
  weapons: many(weapons),
  inventorySlots: many(inventorySlots),
  coinPurse: one(coinPurses, {
    fields: [characters.id],
    references: [coinPurses.characterId]
  }),
  bagTypes: many(bagTypes),
  spells: many(spells),
  scrolls: many(scrolls),
  potions: many(potions),
}));

export const characterStatsRelations = relations(characterStats, ({ one }) => ({
  character: one(characters, {
    fields: [characterStats.characterId],
    references: [characters.id]
  })
}));

export const characterClassesRelations = relations(characterClasses, ({ one }) => ({
  character: one(characters, {
    fields: [characterClasses.characterId],
    references: [characters.id]
  })
}));

export const weaponsRelations = relations(weapons, ({ one }) => ({
  character: one(characters, {
    fields: [weapons.characterId],
    references: [characters.id]
  })
}));

export const inventorySlotsRelations = relations(inventorySlots, ({ one }) => ({
  character: one(characters, {
    fields: [inventorySlots.characterId],
    references: [characters.id]
  })
}));

export const coinPursesRelations = relations(coinPurses, ({ one }) => ({
  character: one(characters, {
    fields: [coinPurses.characterId],
    references: [characters.id]
  })
}));

export const bagTypesRelations = relations(bagTypes, ({ one }) => ({
  character: one(characters, {
    fields: [bagTypes.characterId],
    references: [characters.id]
  })
}));

export const spellsRelations = relations(spells, ({ one }) => ({
  character: one(characters, {
    fields: [spells.characterId],
    references: [characters.id]
  })
}));

export const scrollsRelations = relations(scrolls, ({ one }) => ({
  character: one(characters, {
    fields: [scrolls.characterId],
    references: [characters.id]
  })
}));

export const potionsRelations = relations(potions, ({ one }) => ({
  character: one(characters, {
    fields: [potions.characterId],
    references: [characters.id]
  })
}));

// Update users relations to include characters
relations(users, ({ many }) => ({
  messages: many(messages),
  accounts: many(accounts),
  characters: many(characters),
}));
