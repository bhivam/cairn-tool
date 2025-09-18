import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { characters, characterStats } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { db } from "@/server/db";

const genericStatRoll = () =>
  Array.from({ length: 3 }, () => Math.floor(Math.random() * 6) + 1).reduce(
    (sum, roll) => sum + roll,
    0,
  );

const hpRoll = () => Math.floor(Math.random() * 10) + 1;

function rollStats() {
  return {
    vit: genericStatRoll(),
    dex: genericStatRoll(),
    wis: genericStatRoll(),
    cha: genericStatRoll(),
    hp: hpRoll(),
  };
}

async function getCharacter({
  characterId,
  userId,
}: {
  characterId: number;
  userId: string;
}) {
  const existingCharacter = await db.query.characters.findFirst({
    where: and(eq(characters.id, characterId), eq(characters.userId, userId)),
  });

  if (!existingCharacter) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }

  return existingCharacter;
}

async function checkCharacterExists(params: {
  characterId: number;
  userId: string;
}) {
  await getCharacter(params);
}

// TODO Completely Retarded
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
});

export const characterRouter = createTRPCRouter({
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
        throw new TRPCError({
          message: "Failed to create character",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      return character;
    }),

  rollStats: protectedProcedure
    .input(
      z.object({
        characterId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await checkCharacterExists({
        characterId: input.characterId,
        userId: ctx.session.user.id,
      });

      const rolledStats = rollStats();
      const { vit, dex, wis, cha, hp } = rolledStats;

      const [stats] = await ctx.db
        .insert(characterStats)
        .values({
          characterId: input.characterId,
          vitMax: vit,
          vitCurrent: vit,
          dexMax: dex,
          dexCurrent: dex,
          wisMax: wis,
          wisCurrent: wis,
          chaMax: cha,
          chaCurrent: cha,
          hpMax: hp,
          hpCurrent: hp,
        })
        .returning();

      console.log(stats);

      if (!stats) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      return {
        stats,
      };
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.characters.findMany({
      where: eq(characters.userId, ctx.session.user.id),
      with: {
        stats: true,
      },
    });
  }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const character = await ctx.db.query.characters.findFirst({
        where: eq(characters.id, input.id),
        with: {
          stats: true,
        },
      });

      if (!character) {
        throw new Error("Character not found");
      }

      if (character.userId !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      return character;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: updateCharacterSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
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

  updateStats: protectedProcedure
    .input(
      z.object({
        characterId: z.number(),
        stats: statSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
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

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
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
});

