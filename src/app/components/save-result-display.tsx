import type { CommandResult } from "@/server/api/routers/message";
import React, { useMemo } from "react";
import { match } from "ts-pattern";

export default function SaveResultDisplay({
  commandResult,
}: {
  commandResult: Extract<CommandResult, { type: "save" }>;
}) {
  const { roll, threshold, modifier } = commandResult;

  const { resultText, rollClass, resultClass } = useMemo(() => {
    return match({ roll, threshold })
      .with({ roll: 20 }, () => ({
        resultText: "Critical Failure!",
        rollClass: "text-red-500 font-extrabold",
        resultClass: "text-red-500 font-semibold text-lg",
      }))
      .when(
        ({ roll, threshold }) => roll + (modifier ?? 0) === threshold,
        () => ({
          resultText: "Critical Success!",
          rollClass: "text-green-500 font-extrabold",
          resultClass: "text-green-500 font-semibold text-lg",
        })
      )
      .when(
        ({ roll, threshold }) => roll + (modifier ?? 0) < threshold,
        () => ({
          resultText: "Success",
          rollClass: "text-green-700 font-bold text-3xl",
          resultClass: "text-green-700 font-semibold text-lg",
        })
      )
      .otherwise(() => ({
        resultText: "Failure",
        rollClass: "text-red-700 font-bold text-3xl",
        resultClass: "text-red-700 font-semibold text-lg",
      }));
  }, [roll, threshold, modifier]);

  return (
    <div className="mt-2 border border-gray-200 rounded px-4 py-3">
      <div className="flex flex-col gap-1">
        <span className={`text-3xl ${rollClass}`}>{roll + (modifier ?? 0)}</span>
        <span className={resultClass}>{resultText}</span>
      </div>
    </div>
  );
}

