import type { RouterOutputs } from "@/trpc/react";
import React from "react";
import { RollResultDisplay } from "./roll-result-display";
import { match } from "ts-pattern";
import SaveResultDisplay from "./save-result-display";

export function Message({
  message,
}: {
  message: Exclude<RouterOutputs["message"]["getMessages"], null>[number];
}) {
  const avatar =
    message.user.image ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      message.user.email.toUpperCase(),
    )}&background=5865F2&color=fff`;

  return (
    <div className="flex items-start gap-3 px-4 py-2 transition-colors">
      <img
        src={avatar}
        alt={message.user.email}
        className="mt-1 h-10 w-10 rounded-full object-cover"
      />
      <div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground font-semibold">
            {message.user.name ?? message.user.email}
          </span>
          <span className="text-muted-foreground text-xs">
            {new Date(message.createdAt).toLocaleDateString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="text-foreground mt-1">{message.content}</div>
        {match(message.commandResult)
          .with({ type: "roll" }, (res) => (
            <RollResultDisplay commandResult={res} />
          ))
          .with({ type: "save" }, (res) => (
            <SaveResultDisplay commandResult={res} />
          ))
          .otherwise(() => null)}
      </div>
    </div>
  );
}
