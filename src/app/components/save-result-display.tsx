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
        rollClass: "text-destructive font-extrabold",
        resultClass: "text-destructive font-semibold text-lg",
      }))
      .when(
        ({ roll, threshold }) => roll + (modifier ?? 0) === threshold,
        () => ({
          resultText: "Critical Success!",
          rollClass: "text-success font-extrabold",
          resultClass: "text-success font-semibold text-lg",
        }),
      )
      .when(
        ({ roll, threshold }) => roll + (modifier ?? 0) < threshold,
        () => ({
          resultText: "Success",
          rollClass: "text-success font-bold text-3xl",
          resultClass: "text-success font-semibold text-lg",
        }),
      )
      .otherwise(() => ({
        resultText: "Failure",
        rollClass: "text-destructive font-bold text-3xl",
        resultClass: "text-destructive font-semibold text-lg",
      }));
  }, [roll, threshold, modifier]);

  return (
    <div className="border-border bg-muted/40 mt-2 rounded border px-4 py-3">
      <div className="flex flex-col gap-1">
        <span className={`text-3xl ${rollClass}`}>
          {roll + (modifier ?? 0)}
        </span>
        <span className={resultClass}>{resultText}</span>
      </div>
    </div>
  );
}
