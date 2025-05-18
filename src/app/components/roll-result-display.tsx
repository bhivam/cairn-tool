import type { CommandResult } from "@/server/api/routers/message";
import React, { useMemo, useState } from "react";

export function RollResultDisplay({
  commandResult,
}: {
  commandResult: Extract<CommandResult, { type: "roll" }>;
}) {
  const [showDetails, setShowDetails] = useState(true);

  const modifier =
    commandResult.add !== undefined && commandResult.sign
      ? `${commandResult.sign}${commandResult.add}`
      : "";

  const dropInfo =
    commandResult.drop !== undefined
      ? `${commandResult.drop}`
      : "";

  const droppedRollsIndicies = useMemo(() => new Set<number>(
    commandResult.drop
      ? [...commandResult.rolls]
        .map((value, index) => ({ value, index }))
        .sort((a, b) => a.value - b.value)
        .slice(0, commandResult.drop)
        .map(obj => obj.index)
        .sort((a, b) => a - b)
      : []), [commandResult.rolls])

  // TODO up arrow for last command

  return (
    <div className="mt-2 border border-gray-200 rounded px-4 py-3">
      <div className="flex flex-col gap-1">
        <span className="text-black">
          <span className="font-bold text-3xl">
            {commandResult.total}{" "}
          </span>
          {modifier && (
            <span className="text-sm">
              Modifier:{" "}
              <span className="font-mono">
                {modifier}{" "}
              </span>
            </span>
          )}
          {dropInfo && (
            <span className="text-sm">
              Dropped:{" "}
              <span className="font-mono">
                {dropInfo}
              </span>
            </span>
          )}
        </span>

      </div>
      {showDetails && (
        <div className="mt-2 text-sm text-gray-600">
          <span className="font-semibold">Rolls:</span>{" "}
          <span className="font-mono">{
            commandResult.rolls.map((roll, idx) =>
              <span key={idx}>
                {
                  droppedRollsIndicies.has(idx)
                    ? <span className="font-extralight text-gray-400">{roll}</span>
                    : <span className="font-extrabold text-black">{roll}</span>
                }
                {
                  idx !== commandResult.rolls.length - 1 ? ", " : ""
                }
              </span>
            )
          }</span>
        </div>
      )}
      <button
        className="mt-2 text-xs text-indigo-500 hover:underline focus:outline-none"
        onClick={() => setShowDetails((v) => !v)}
        aria-expanded={showDetails}
        type="button"
      >
        {showDetails ? "Hide Rolls" : "Show all rolls"}
      </button>
    </div>
  );
}

