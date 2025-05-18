import React, { useMemo, useState } from "react";

type CommandResult = {
  type: "roll";
  rolls: number[];
  total: number;
  drop?: number;
  add?: number;
  sign?: "+" | "-";
};

export function CommandResultDisplay({
  commandResult,
}: {
  commandResult: CommandResult;
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
            <span className="text-black text-sm">
              Modifier:{" "}
              <span className="font-mono">
                {modifier}
              </span>
            </span>
          )}
          {dropInfo && (
            <span className="text-black text-sm">
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
              droppedRollsIndicies.has(idx)
                ? <span key={idx} className="font-extralight">{roll}{", "}</span>
                : <span key={idx} className="font-extrabold">{roll}{", "}</span>
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

