
import type { RouterOutputs } from "@/trpc/react";
import React from "react";
import { RollResultDisplay } from "./roll-result-display";
import { match } from "ts-pattern";
import SaveResultDisplay from "./save-result-display";

export function Message({ message }:
  { message: Exclude<RouterOutputs["message"]["getMessages"], null>[number] }) {
  const avatar =
    message.user.image ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      message.user.email.toUpperCase()
    )}&background=5865F2&color=fff`;

  return (
    <div className="flex items-start gap-3 py-2 px-4 transition-colors">
      <img
        src={avatar}
        alt={message.user.email}
        className="w-10 h-10 rounded-full object-cover mt-1"
      />
      <div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-400">
            {message.user.name ?? message.user.email}
          </span>
          <span className="text-xs text-gray-400">
            {
              new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            }
          </span>
        </div>
        <div className="text-black mt-1">
          {message.content}
        </div>
        {
          // TODO add a view calculation button that shows details
          // make it output
          match(message.commandResult)
            .with(
              { type: "roll" },
              (res) => <RollResultDisplay commandResult={res} />
            )
            .with(
              { type: "save" },
              (res) => <SaveResultDisplay commandResult={res} />
            )
            .otherwise(() => null)
        }
      </div>
    </div>
  );
}
