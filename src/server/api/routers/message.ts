import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { messages } from "@/server/db/schema";
import { match } from "ts-pattern";
import EventEmitter, { on } from 'node:events';
import { eq } from "drizzle-orm";

// https://github.com/trpc/examples-next-sse-chat/blob/main/src/server/routers/channel.ts

// NOTE:
// will return some structured command type along with the result
// based on the command type frontned will render it out in some way

type EventMap<T> = Record<keyof T, any[]>;// eslint-disable-line
class IterableEventEmitter<T extends EventMap<T>> extends EventEmitter<T> {
  toIterable<TEventName extends keyof T & string>(
    eventName: TEventName,
    opts?: NonNullable<Parameters<typeof on>[2]>,
  ): AsyncIterable<T[TEventName]> {
    return on(this as any, eventName, opts) as any;// eslint-disable-line
  }
}

export interface MyEvents {
  newMessage: [message: Message];
}

export const ee = new IterableEventEmitter<MyEvents>();


type ParseResult =
  | {
    command: 'r';
    args: {
      x: number,
      y: number,
      w: number | undefined,
      z: number | undefined,
      zSign: "+" | "-" | undefined
    };
  }
  | null;

export function parseContent(content: string): ParseResult {
  const patterns: Record<string, RegExp> = {
    r: /^!r[ \t]+(\d+)d(\d+)(?:d(\d+))?(?:[ \t]*([+-])[ \t]*(\d+))?$/,
  };

  const entry = Object.entries(patterns).find(([_, pattern]) =>
    pattern.test(content)
  );

  if (!entry) return null;

  const [command, pattern] = entry;
  const match = content.match(pattern);

  if (!match) return null;

  // TODO ts-pattern for matching and then checks for argument types inside
  // TODO option for advantage
  if (command === "r" && match[1] && match[2]) {
    const x = parseInt(match[1], 10);
    const y = parseInt(match[2], 10);
    const w = match[3] ? parseInt(match[3]) : undefined
    const zSign = match[4] !== "+" && match[4] !== "-" ? undefined : match[4]
    const z = match[5] ? parseInt(match[5]) : undefined

    // TODO create some error type for result that will tell the user they fucked up
    // Should I check for this here or when I'm running the command?
    if (!w || (w && w < x)) {
      return {
        command,
        args: { x, y, w, z, zSign },
      };
    }
  }

  return null;
}

export const CommandResultSchema = z.discriminatedUnion("type",
  [
    z.object({
      type: z.literal("roll"),
      rolls: z.number().array(),
      drop: z.number().optional(),
      add: z.number().optional(),
      sign: z.enum(["+", "-"]).optional(),
      total: z.number()
    })
  ]
)

export type CommandResult = z.infer<typeof CommandResultSchema>

export type Message = {
  commandResult: {
    type: "roll";
    rolls: number[];
    total: number;
    drop?: number | undefined;
    add?: number | undefined;
    sign?: "+" | "-" | undefined;
  } | null;
  id: number;
  content: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    emailVerified: Date | null;
    image: string | null;
  };
}

function runCommand(result: ParseResult): CommandResult | null {
  return match(result)
    .with({ command: "r" }, ({ args }) => {
      const { x, y, w, zSign, z } = args;

      const buff = match(zSign)
        .with("+", () => z!)
        .with("-", () => -z!)
        .with(undefined, () => 0)
        .exhaustive()

      const rolls = Array.from({ length: x }, () => {
        return Math.ceil(Math.random() * y)
      })

      console.log(rolls)

      const indicesToRemove = w
        ? [...rolls]
          .map((value, index) => ({ value, index }))
          .sort((a, b) => a.value - b.value)
          .slice(0, w)
          .map(obj => obj.index)
        : [];

      console.log(indicesToRemove)

      const droppedRolls = rolls
        .filter((_, idx) => !indicesToRemove.includes(idx));

      console.log(droppedRolls)

      const total = droppedRolls
        .map(r => r + buff)
        .reduce((sum, val) => sum + val, 0);

      console.log(total)

      const result: CommandResult = {
        type: "roll",
        rolls: rolls,
        drop: w,
        add: z,
        sign: zSign,
        total: total
      }

      return result
    })
    .otherwise(() => null);
}

export const messageRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      content: z.string().min(1)
    }))
    .mutation(async ({ ctx, input }) => {
      let commandResult = null;
      const command = parseContent(input.content)

      if (command) {
        commandResult = runCommand(command)
      }

      const [inserted] = await ctx.db
        .insert(messages)
        .values({
          content: input.content,
          commandResult,
          createdById: ctx.session.user.id,
        })
        .returning();

      if (!inserted) {
        throw new Error("big problem :(")
      }

      const message = await ctx.db.query.messages.findFirst({
        where: (m, { eq }) => eq(m.id, inserted.id),
        with: { user: true },
      });

      if (!message) {
        throw new Error("big problem :(")
      }

      ee.emit("newMessage", { ...message, commandResult })
    }),

  getMessages: protectedProcedure.query(async ({ ctx }) => {
    const messages = await ctx.db.query.messages.findMany({
      with: { user: true },
      orderBy: (messages, { asc }) => [asc(messages.createdAt)],
    });

    const messagesWithResults: Message[] = messages.map(
      message => ({
        ...message,
        commandResult: message.commandResult
          ? CommandResultSchema.parse(message.commandResult)
          : null
      })
    )

    return messagesWithResults;
  }),

  messageUpdates: protectedProcedure
    .subscription(async function*(opts) {
      for await (const message of ee.toIterable("newMessage", {
        signal: opts.signal
      })) {
        yield* message
      }
    })
});

