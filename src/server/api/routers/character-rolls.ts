import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { characters, characterStats, characterClasses, weapons, inventorySlots, coinPurses } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { rollStats, rollHP, rollAC, rollStartingGold, characterClasses as classData, startingEquipment } from "@/server/db/seed";

export const characterRollsRouter = createTRPCRouter({
  // Roll stats for a character (3d6 method)
  rollStats: protectedProcedure
    .input(z.object({
      characterId: z.number(),
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

      // Roll 4 stats (VIT, DEX, WIS, CHA)
      const rolledStats = rollStats();
      const [vit, dex, wis, cha] = rolledStats;

      // Update character stats
      const [updatedStats] = await ctx.db
        .update(characterStats)
        .set({
          vitMax: vit,
          vitCurrent: vit,
          dexMax: dex,
          dexCurrent: dex,
          wisMax: wis,
          wisCurrent: wis,
          chaMax: cha,
          chaCurrent: cha,
          agility: dex, // Auto-fill agility from DEX
        })
        .where(eq(characterStats.characterId, input.characterId))
        .returning();

      return {
        stats: rolledStats,
        updatedStats,
      };
    }),

  // Roll HP for a character
  rollHP: protectedProcedure
    .input(z.object({
      characterId: z.number(),
      className: z.string(),
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

      // Roll HP based on class
      const rolledHP = rollHP(input.className);

      // Update character stats
      const [updatedStats] = await ctx.db
        .update(characterStats)
        .set({
          hpMax: rolledHP,
          hpCurrent: rolledHP,
        })
        .where(eq(characterStats.characterId, input.characterId))
        .returning();

      return {
        hp: rolledHP,
        updatedStats,
      };
    }),

  // Roll AC for a character
  rollAC: protectedProcedure
    .input(z.object({
      characterId: z.number(),
      className: z.string(),
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

      // Roll AC based on class
      const rolledAC = rollAC(input.className);

      // Update character stats
      const [updatedStats] = await ctx.db
        .update(characterStats)
        .set({
          acMax: rolledAC,
          acCurrent: rolledAC,
        })
        .where(eq(characterStats.characterId, input.characterId))
        .returning();

      return {
        ac: rolledAC,
        updatedStats,
      };
    }),

  // Roll starting gold for a character
  rollStartingGold: protectedProcedure
    .input(z.object({
      characterId: z.number(),
      className: z.string(),
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

      // Roll starting gold based on class
      const rolledGold = rollStartingGold(input.className);

      // Update coin purse
      const [updatedPurse] = await ctx.db
        .update(coinPurses)
        .set({
          gold: rolledGold,
        })
        .where(eq(coinPurses.characterId, input.characterId))
        .returning();

      return {
        gold: rolledGold,
        updatedPurse,
      };
    }),

  // Generate starting equipment for a character
  generateStartingEquipment: protectedProcedure
    .input(z.object({
      characterId: z.number(),
      className: z.string(),
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

      // Get class data
      const classInfo = classData.find(c => c.name.toLowerCase() === input.className.toLowerCase());
      if (!classInfo) {
        throw new Error("Invalid class");
      }

      // Add class to character
      const [newClass] = await ctx.db
        .insert(characterClasses)
        .values({
          characterId: input.characterId,
          className: classInfo.name,
          level: 1,
        })
        .returning();

      // Add starting weapons
      const weaponPromises = classInfo.startingWeapons.map(weapon =>
        ctx.db.insert(weapons).values({
          characterId: input.characterId,
          name: weapon.name,
          damageDie: weapon.damageDie,
          proficiency: weapon.proficiency,
          traits: weapon.traits,
          equipped: false,
        }).returning()
      );

      const addedWeapons = await Promise.all(weaponPromises);

      // Add starting equipment to inventory
      const equipment = startingEquipment[input.className.toLowerCase() as keyof typeof startingEquipment] || [];
      const inventoryPromises = equipment.map((item, index) =>
        ctx.db.insert(inventorySlots).values({
          characterId: input.characterId,
          slotType: "bag",
          slotNumber: index + 1,
          itemName: item,
          itemDescription: `Starting equipment`,
          quantity: 1,
          isEquipped: false,
        }).returning()
      );

      const addedEquipment = await Promise.all(inventoryPromises);

      return {
        class: newClass,
        weapons: addedWeapons.flat(),
        equipment: addedEquipment.flat(),
      };
    }),

  // Auto-calculate agility from DEX
  autoCalculateAgility: protectedProcedure
    .input(z.object({
      characterId: z.number(),
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

      // Get current stats
      const currentStats = await ctx.db.query.characterStats.findFirst({
        where: eq(characterStats.characterId, input.characterId),
      });

      if (!currentStats) {
        throw new Error("Character stats not found");
      }

      // Auto-calculate agility from DEX
      const agility = currentStats.dexCurrent;

      // Update character stats
      const [updatedStats] = await ctx.db
        .update(characterStats)
        .set({ agility })
        .where(eq(characterStats.characterId, input.characterId))
        .returning();

      return {
        agility,
        updatedStats,
      };
    }),

  // Get available classes
  getAvailableClasses: protectedProcedure.query(async () => {
    return classData.map(c => ({
      name: c.name,
      startingHP: c.startingHP,
      startingAC: c.startingAC,
      startingWeapons: c.startingWeapons,
    }));
  }),

  // Get starting equipment for a class
  getStartingEquipment: protectedProcedure
    .input(z.object({ className: z.string() }))
    .query(async ({ input }) => {
      const equipment = startingEquipment[input.className.toLowerCase() as keyof typeof startingEquipment] || [];
      const classInfo = classData.find(c => c.name.toLowerCase() === input.className.toLowerCase());
      
      return {
        equipment,
        weapons: classInfo?.startingWeapons ?? [],
        startingHP: classInfo?.startingHP ?? 4,
        startingAC: classInfo?.startingAC ?? 1,
      };
    }),
}); 