import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { messages } from "@/server/db/schema";
import { match } from "ts-pattern";
import EventEmitter, { on } from 'node:events';

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

// !s <threshold> <modifier>
// we will display threshold and modifier
// roll a d20 and add modifier 
// meet or beat threshold (lower in this case)
// green on success, red on failure
// bright green or bright red for crit
// meeting the threehold exactly is a crit success

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
  | {
    command: 's';
    args: {
      threshold: number,
      modifier: number | undefined
    };
  }
  | null;

export function parseContent(content: string): ParseResult {
  const patterns: Record<string, RegExp> = {
    r: /^!r[ \t]+(\d+)d(\d+)(?:d(\d+))?(?:[ \t]*([+-])[ \t]*(\d+))?$/,
    s: /^!s[ \t]+(\d+)[ \t]*([+-]?\d+)?$/
  };

  const entry = Object.entries(patterns).find(([_, pattern]) =>
    pattern.test(content)
  );

  if (!entry) return null;

  const [command, pattern] = entry;
  const matches = content.match(pattern);

  if (!matches) return null;

  // TODO ts-pattern for matching and then checks for argument types inside
  // TODO advantage (does two rolls and selects better one)

  return match(command)
    .with("r", (command) => {
      if (matches[1] && matches[2]) {
        const x = parseInt(matches[1], 10);
        const y = parseInt(matches[2], 10);
        const w = matches[3] ? parseInt(matches[3]) : undefined
        const zSign = matches[4] !== "+" && matches[4] !== "-" ? undefined : matches[4]
        const z = matches[5] ? parseInt(matches[5]) : undefined

        // TODO create some error type for result that will tell the user they fucked up
        // Should I check for this here or when I'm running the command?
        if (!w || (w && w < x)) {
          const res: ParseResult = {
            command,
            args: { x, y, w, z, zSign },
          };
          return res
        }
      }
      return null
    })
    .with("s", (command) => {
      if (matches[1]) {
        const threshold = parseInt(matches[1], 10);
        const modifier = matches[2] ? parseInt(matches[2], 10) : undefined;

        const res: ParseResult = {
          command,
          args: { threshold, modifier }
        }
        return res
      }
      return null
    })
    .otherwise(() => null)
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
    }),
    z.object({
      type: z.literal("save"),
      roll: z.number(),
      modifier: z.number().optional(),
      threshold: z.number()
    })
  ]
)

export type CommandResult = z.infer<typeof CommandResultSchema>

export type Message = {
  commandResult: CommandResult | null;
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
    .with({ command: "s" }, ({ args: { threshold, modifier } }) => {
      const roll = Math.ceil(Math.random() * 20)

      const result: CommandResult = {
        type: "save",
        roll,
        modifier,
        threshold,
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

