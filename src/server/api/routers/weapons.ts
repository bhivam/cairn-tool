import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const weaponsRouter = createTRPCRouter({
  getWeapons: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.query.weapons.findMany({
      with: {
        traits: true,
      },
    });

    if (!result) throw new TRPCError({ code: "NOT_FOUND" });

    return result;
  }),
});

