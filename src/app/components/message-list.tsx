
import { type RouterOutputs } from "@/trpc/react";
import type { RefObject } from "react";
import { match } from "ts-pattern";
import { Message } from "./message";

export default function MessageList({
  isPending,
  isError,
  messages,
  dummyDiv
}: {
  isPending: boolean;
  isError: boolean;
  messages: RouterOutputs["message"]["getMessages"] | undefined;
  dummyDiv: RefObject<HTMLDivElement | null>
}) {
  return match([isPending, isError])
    .with([true, true], () => (
      <div className="p-4 text-center text-red-500">Loading and Error!</div>
    ))
    .with([false, true], () => (
      <div className="p-4 text-center text-red-500">Error loading messages.</div>
    ))
    .with([true, false], () => (
      <div className="space-y-2 p-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-6 w-3/4 animate-pulse rounded bg-gray-200"
          />
        ))}
      </div>
    ))
    .with([false, false], () => (
      <div className="space-y-2 p-4">
        {messages && messages.length > 0 ? (
          messages.map(message =>
            <Message key={message.id} message={message} />
          )) : (
          <div className="text-gray-400">No messages yet.</div>
        )}
        <div ref={(el) => { dummyDiv.current = el }}></div>
      </div>
    ))
    .exhaustive();
}

