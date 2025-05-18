
import type { RouterOutputs } from "@/trpc/react";
import React from "react";
import { CommandResultDisplay } from "./command-result";

// !s <threshold> <modifier>
// we will display threshold and modifier
// modify the roll, not the threshold
// meet or beat (lower in this case)
// green on success, red on failure
// bright green or bright red for crit
// meeting the threehold exactly is a crit success

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
        {message.commandResult && (
          <CommandResultDisplay
            commandResult={message.commandResult}
          />
        )}
      </div>
    </div>
  );
}
