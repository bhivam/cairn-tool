import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { characters, characterStats, characterClasses, weapons, coinPurses } from "@/server/db/schema";
import { eq } from "drizzle-orm";

// Zod schemas for validation
const createCharacterSchema = z.object({
  name: z.string().min(1).max(255),
  portrait: z.string().optional(),
  region: z.string().max(100).optional(),
  status: z.string().max(100).optional(),
  religion: z.string().max(100).optional(),
  language: z.string().max(100).optional(),
  notes: z.string().optional(),
});

const updateCharacterSchema = createCharacterSchema.partial();

const statSchema = z.object({
  vitMax: z.number().min(0).max(20),
  vitCurrent: z.number().min(0).max(20),
  dexMax: z.number().min(0).max(20),
  dexCurrent: z.number().min(0).max(20),
  wisMax: z.number().min(0).max(20),
  wisCurrent: z.number().min(0).max(20),
  chaMax: z.number().min(0).max(20),
  chaCurrent: z.number().min(0).max(20),
  hpMax: z.number().min(0).max(10),
  hpCurrent: z.number().min(0).max(10),
  acMax: z.number().min(0).max(6),
  acCurrent: z.number().min(0).max(6),
  speed: z.number().min(0),
  agility: z.number().min(0).max(20),
  spellCastingLevel: z.number().min(0),
  wisdomProgress: z.number().min(0).max(20),
});



export const characterRouter = createTRPCRouter({
  // Create a new character
  create: protectedProcedure
    .input(createCharacterSchema)
    .mutation(async ({ ctx, input }) => {
      const [character] = await ctx.db
        .insert(characters)
        .values({
          ...input,
          userId: ctx.session.user.id,
        })
        .returning();

      if (!character) {
        throw new Error("Failed to create character");
      }

      // Create default stats record
      await ctx.db.insert(characterStats).values({
        characterId: character.id,
        vitMax: 0,
        vitCurrent: 0,
        dexMax: 0,
        dexCurrent: 0,
        wisMax: 0,
        wisCurrent: 0,
        chaMax: 0,
        chaCurrent: 0,
        hpMax: 0,
        hpCurrent: 0,
        acMax: 0,
        acCurrent: 0,
        speed: 0,
        agility: 0,
        spellCastingLevel: 0,
        wisdomProgress: 0,
      });

      // Create default coin purse
      await ctx.db.insert(coinPurses).values({
        characterId: character.id,
        gold: 0,
        silver: 0,
        copper: 0,
        platinum: 0,
      });

      return character;
    }),

  // Get all characters for the current user
  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.characters.findMany({
      where: eq(characters.userId, ctx.session.user.id),
      with: {
        stats: true,
        classes: true,
        weapons: true,
        inventorySlots: true,
        coinPurse: true,
        bagTypes: true,
        spells: true,
        scrolls: true,
        potions: true,
      },
    });
  }),

  // Get a specific character by ID
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const character = await ctx.db.query.characters.findFirst({
        where: eq(characters.id, input.id),
        with: {
          stats: true,
          classes: true,
          weapons: true,
          inventorySlots: true,
          coinPurse: true,
          bagTypes: true,
          spells: true,
          scrolls: true,
          potions: true,
        },
      });

      if (!character) {
        throw new Error("Character not found");
      }

      // Check if the character belongs to the current user
      if (character.userId !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      return character;
    }),

  // Update a character
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      data: updateCharacterSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if character exists and belongs to user
      const existingCharacter = await ctx.db.query.characters.findFirst({
        where: eq(characters.id, input.id),
      });

      if (!existingCharacter) {
        throw new Error("Character not found");
      }

      if (existingCharacter.userId !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      const [updatedCharacter] = await ctx.db
        .update(characters)
        .set({
          ...input.data,
          updatedAt: new Date(),
        })
        .where(eq(characters.id, input.id))
        .returning();

      return updatedCharacter;
    }),

  // Update character stats
  updateStats: protectedProcedure
    .input(z.object({
      characterId: z.number(),
      stats: statSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if character exists and belongs to user
      const existingCharacter = await ctx.db.query.characters.findFirst({
        where: eq(characters.id, input.characterId),
      });

      if (!existingCharacter) {
        throw new Error("Character not found");
      }

      if (existingCharacter.userId !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      const [updatedStats] = await ctx.db
        .update(characterStats)
        .set(input.stats)
        .where(eq(characterStats.characterId, input.characterId))
        .returning();

      return updatedStats;
    }),

  // Delete a character
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Check if character exists and belongs to user
      const existingCharacter = await ctx.db.query.characters.findFirst({
        where: eq(characters.id, input.id),
      });

      if (!existingCharacter) {
        throw new Error("Character not found");
      }

      if (existingCharacter.userId !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      await ctx.db.delete(characters).where(eq(characters.id, input.id));
      return { success: true };
    }),

  // Add a class to a character
  addClass: protectedProcedure
    .input(z.object({
      characterId: z.number(),
      className: z.string().min(1).max(100),
      level: z.number().min(1).default(1),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if character exists and belongs to user
      const existingCharacter = await ctx.db.query.characters.findFirst({
        where: eq(characters.id, input.characterId),
      });

      if (!existingCharacter) {
        throw new Error("Character not found");
      }

      if (existingCharacter.userId !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      const [newClass] = await ctx.db
        .insert(characterClasses)
        .values({
          characterId: input.characterId,
          className: input.className,
          level: input.level,
        })
        .returning();

      return newClass;
    }),

  // Remove a class from a character
  removeClass: protectedProcedure
    .input(z.object({
      characterId: z.number(),
      classId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if character exists and belongs to user
      const existingCharacter = await ctx.db.query.characters.findFirst({
        where: eq(characters.id, input.characterId),
      });

      if (!existingCharacter) {
        throw new Error("Character not found");
      }

      if (existingCharacter.userId !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      await ctx.db.delete(characterClasses).where(eq(characterClasses.id, input.classId));
      return { success: true };
    }),

  // Add a weapon to a character
  addWeapon: protectedProcedure
    .input(z.object({
      characterId: z.number(),
      name: z.string().min(1).max(100),
      damageDie: z.string().min(1).max(20),
      proficiency: z.string().min(1).max(50),
      traits: z.string().optional(),
      equipped: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if character exists and belongs to user
      const existingCharacter = await ctx.db.query.characters.findFirst({
        where: eq(characters.id, input.characterId),
      });

      if (!existingCharacter) {
        throw new Error("Character not found");
      }

      if (existingCharacter.userId !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      const [newWeapon] = await ctx.db
        .insert(weapons)
        .values({
          characterId: input.characterId,
          name: input.name,
          damageDie: input.damageDie,
          proficiency: input.proficiency,
          traits: input.traits,
          equipped: input.equipped,
        })
        .returning();

      return newWeapon;
    }),
}); 