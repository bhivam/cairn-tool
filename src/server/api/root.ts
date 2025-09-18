import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { messageRouter } from "./routers/message";
import { characterRouter } from "./routers/character";
import { weaponsRouter } from "./routers/weapons";

export const appRouter = createTRPCRouter({
  message: messageRouter,
  character: characterRouter,
  weapons: weaponsRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);

