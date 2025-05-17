import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { messages } from "@/server/db/schema";

export const messageRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      content: z.string().min(1)
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(messages).values({
        content: input.content,
        createdById: ctx.session.user.id,
      });
    }),

  getMessages: protectedProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.query.messages.findMany({
      with: { user: true },
      orderBy: (messages, { asc }) => [asc(messages.createdAt)],
    });

    return post ?? null;
  }),
});

