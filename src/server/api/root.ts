import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { messageRouter } from "./routers/message";
import { characterRouter } from "./routers/character";
import { characterRollsRouter } from "./routers/character-rolls";

export const appRouter = createTRPCRouter({
  message: messageRouter,
  character: characterRouter,
  characterRolls: characterRollsRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
