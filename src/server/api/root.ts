import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { messageRouter } from "./routers/message";
import { characterRouter } from "./routers/character";

export const appRouter = createTRPCRouter({
  message: messageRouter,
  character: characterRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);

