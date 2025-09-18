"use client";

import { useEffect, useRef, useState } from "react";
import { api, type RouterOutputs } from "@/trpc/react";
import { commonRegions } from "@/server/db/seed";
import { useMessageSender } from "@/app/providers/message-provider";
import { match } from "ts-pattern";

type Stats = RouterOutputs["character"]["rollStats"]["stats"];
type Step = "identity" | "stats" | "class" | "review";
const statsOrder = ["vit", "dex", "wis", "cha", "hp"] as const;
type RollingStatKey = (typeof statsOrder)[number];

interface CharacterData {
  name: string;
  region: string;
  status: string;
  religion: string;
  language: string;
  notes: string;
}

export default function CharacterCreationWizard({
  onComplete,
}: {
  onComplete?: () => void;
}) {
  const [step, setStep] = useState<Step>("identity");
  const [characterData, setCharacterData] = useState<CharacterData>({
    name: "",
    region: "",
    status: "",
    religion: "",
    language: "",
    notes: "",
  });
  const [stats, setStats] = useState({
    vit: 0,
    dex: 0,
    wis: 0,
    cha: 0,
    hp: 0,
  });
  const [characterId, setCharacterId] = useState<string | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [currentRollIndex, setCurrentRollIndex] = useState<number>(0);
  const precomputedStatsRef = useRef<Stats>(null);
  const timersRef = useRef<number[]>([]);

  const createChar = api.character.create.useMutation({
    onSuccess: (charData) => {
      setStep("stats");
      setCharacterId(charData.id);
    },
  });
  const rollStats = api.character.rollStats.useMutation({
    onSuccess: (res) => {
      precomputedStatsRef.current = res.stats;
    },
  });

  const weapons = api.weapons.getWeapons.useQuery();

  const { sendMessage: sendMessageViaContext } = useMessageSender();

  const handleIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!characterData.name.trim()) return;
    createChar.mutate({
      name: characterData.name,
      region: characterData.region ?? undefined,
      status: characterData.status ?? undefined,
      religion: characterData.religion ?? undefined,
      language: characterData.language ?? undefined,
      notes: characterData.notes ?? undefined,
    });
  };

  function animateNumber(
    statKey: RollingStatKey,
    finalValue: number,
    durationMs = 4500,
  ) {
    setIsRolling(true);
    const start = performance.now();
    const min = statKey === "hp" ? 1 : 3;
    const max = statKey === "hp" ? 10 : 18;
    let lastUpdate = start - 1000;
    const minInterval = 16;
    const maxInterval = 300;

    function step(now: number) {
      const elapsed = now - start;
      if (elapsed >= durationMs) {
        setStats((s) => ({ ...s, [statKey]: finalValue }));
        setIsRolling(false);
        const label = statKey.toUpperCase();
        const msg =
          statKey === "hp"
            ? `Rolled HP (1d10): ${finalValue}`
            : `Rolled ${label}: ${finalValue}`;
        void sendMessageViaContext(msg);
        setCurrentRollIndex((i) => i + 1);
        return;
      }
      const t = Math.min(1, Math.max(0, elapsed / durationMs));
      // Keep updates fast for most of the time, then slow dramatically near the end
      const eased = Math.pow(t, 8); // back-load the slowdown
      const interval = minInterval + eased * (maxInterval - minInterval);
      if (now - lastUpdate >= interval) {
        lastUpdate = now;
        const randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
        setStats((s) => ({ ...s, [statKey]: randomValue }));
      }
      const id = requestAnimationFrame(step);
      timersRef.current.push(id);
    }

    const id = requestAnimationFrame(step);
    timersRef.current.push(id);
  }

  const handleRollNext = async () => {
    if (!characterId || isRolling) return;
    if (!precomputedStatsRef.current)
      await rollStats.mutateAsync({ characterId });

    if (!precomputedStatsRef.current)
      throw new Error("precomputed stats must exist");

    const key = statsOrder[currentRollIndex];
    if (!key) return;
    let finalValue = 0;
    finalValue = precomputedStatsRef.current[`${key}Max`];
    animateNumber(key, finalValue);
  };

  // Instantly roll all stats without animation
  const handleQuickRollAll = async () => {
    if (!characterId) return;
    // Cancel any pending animations/timeouts
    for (const id of timersRef.current) {
      cancelAnimationFrame(id);
      clearTimeout(id as unknown as number);
    }
    timersRef.current = [];

    try {
      setIsRolling(true);
      const {
        stats: { vitMax, dexMax, wisMax, chaMax, hpMax },
      } = await rollStats.mutateAsync({ characterId });

      setStats({
        vit: vitMax,
        dex: dexMax,
        wis: wisMax,
        cha: chaMax,
        hp: hpMax,
      });

      setCurrentRollIndex(statsOrder.length);
    } catch {
    } finally {
      setIsRolling(false);
    }
  };

  useEffect(() => {
    return () => {
      for (const id of timersRef.current) {
        cancelAnimationFrame(id);
        clearTimeout(id as unknown as number);
      }
      timersRef.current = [];
    };
  }, []);

  // Progress circles
  const steps: Step[] = ["identity", "stats", "class", "review"];
  const idx = steps.indexOf(step);

  return (
    <div className="border-border flex h-full flex-col overflow-hidden">
      <div className="bg-background border-border border-b p-2">
        <div className="flex items-center">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${i <= idx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                {i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 ${i < idx ? "bg-primary" : "bg-muted"}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-background flex min-h-0 flex-1 flex-col overflow-auto p-2">
        {step === "identity" && (
          <form onSubmit={handleIdentity} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="text-foreground mb-1 block text-sm font-medium"
              >
                Name *
              </label>
              <input
                id="name"
                type="text"
                value={characterData.name}
                onChange={(e) =>
                  setCharacterData((p) => ({ ...p, name: e.target.value }))
                }
                className="border-input bg-background text-foreground focus:ring-primary w-full rounded border px-3 py-2 focus:ring-2 focus:outline-none"
                placeholder="Character name"
                required
              />
            </div>

            <div>
              <label
                htmlFor="region"
                className="text-foreground mb-1 block text-sm font-medium"
              >
                Region
              </label>
              <select
                id="region"
                value={characterData.region}
                onChange={(e) =>
                  setCharacterData((p) => ({ ...p, region: e.target.value }))
                }
                className="border-input bg-background text-foreground focus:ring-primary w-full rounded border px-3 py-2 focus:ring-2 focus:outline-none"
              >
                <option value="">Select a region</option>
                {commonRegions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {(["status", "religion", "language"] as const).map((field) => (
              <div key={field}>
                <label
                  htmlFor={field}
                  className="text-foreground mb-1 block text-sm font-medium"
                >
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  id={field}
                  type="text"
                  value={characterData[field]}
                  onChange={(e) =>
                    setCharacterData((p) => ({
                      ...p,
                      [field]: e.target.value,
                    }))
                  }
                  className="border-input bg-background text-foreground focus:ring-primary w-full rounded border px-3 py-2 focus:ring-2 focus:outline-none"
                  placeholder={`Enter ${field}`}
                />
              </div>
            ))}

            <div>
              <label
                htmlFor="notes"
                className="text-foreground mb-1 block text-sm font-medium"
              >
                Notes
              </label>
              <textarea
                id="notes"
                rows={3}
                value={characterData.notes}
                onChange={(e) =>
                  setCharacterData((p) => ({ ...p, notes: e.target.value }))
                }
                className="border-input bg-background text-foreground focus:ring-primary w-full rounded border px-3 py-2 focus:ring-2 focus:outline-none"
                placeholder="Enter any notes"
              />
            </div>
          </form>
        )}

        {step === "stats" && (
          <div className="flex w-full flex-1 flex-col">
            <div className="flex flex-1 flex-col gap-6">
              <button
                onClick={handleRollNext}
                disabled={isRolling || currentRollIndex >= statsOrder.length}
                className="bg-primary text-primary-foreground hover:bg-primary/80 w-full rounded px-4 py-2 transition disabled:opacity-50"
              >
                {currentRollIndex >= statsOrder.length
                  ? "All stats rolled"
                  : isRolling
                    ? "Rolling..."
                    : `Roll ${statsOrder[currentRollIndex]?.toUpperCase()}`}
              </button>
              <div className="grid grid-cols-2 gap-4">
                {(["vit", "dex", "wis", "cha", "hp"] as const).map((attr) => (
                  <div
                    key={attr}
                    className="bg-muted text-foreground rounded p-4 text-center"
                  >
                    <div className="text-sm capitalize">{attr}</div>
                    <div className="text-xl font-bold">{stats[attr]}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleQuickRollAll}
                disabled={isRolling || currentRollIndex >= statsOrder.length}
                className="text-muted-foreground hover:text-foreground/80 text-xs underline-offset-2 hover:underline"
                title="Quickly roll all stats instantly"
              >
                quick roll all stats
              </button>
            </div>
          </div>
        )}

        {step === "class" && (
          <div>
            {weapons.isLoading ? (
              "Loading..."
            ) : weapons.isError ? (
              "Error loading weapons..."
            ) : (
              <pre>{JSON.stringify(weapons.data, null, 2)}</pre>
            )}
          </div>
        )}

        {step === "review" && (
          <div className="space-y-6">
            <div className="bg-muted rounded p-4">
              <div className="text-foreground mb-2 font-bold">
                {characterData.name}
              </div>
              <div className="text-muted-foreground text-sm">
                Region: {characterData.region || "None"}
                <br />
                Status: {characterData.status || "None"}
              </div>
            </div>
            <div className="bg-muted rounded p-4">
              <div className="text-foreground mb-2 font-bold">Stats</div>
              <div className="text-foreground grid grid-cols-2 gap-2 text-sm">
                {statsOrder.map((k) => (
                  <div key={k} className="capitalize">
                    {k}: {stats[k]}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="border-border flex items-center justify-between border-t px-6 py-3">
        {match(step)
          .with("identity", () => (
            <button
              onClick={() =>
                setStep((s) => {
                  const prev = steps[Math.max(0, steps.indexOf(s) - 1)];
                  if (!prev) return s;
                  return prev;
                })
              }
              className="text-primary hover:underline"
            >
              Back
            </button>
          ))
          .otherwise(() => (
            <div />
          ))}
        {step === "identity" ? (
          <button
            onClick={handleIdentity}
            disabled={createChar.isPending || !characterData.name.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/80 rounded px-4 py-1 transition disabled:opacity-50"
          >
            {createChar.isPending ? "Creating…" : "Next"}
          </button>
        ) : step === "stats" ? (
          <button
            onClick={() => setStep("class")}
            disabled={
              !(stats.vit && stats.dex && stats.wis && stats.cha && stats.hp) ||
              isRolling
            }
            className="bg-primary text-primary-foreground hover:bg-primary/80 rounded px-4 py-1 transition disabled:opacity-50"
          >
            Next
          </button>
        ) : step === "class" ? (
          <button
            onClick={() => setStep("review")}
            className="bg-primary text-primary-foreground hover:bg-primary/80 rounded px-4 py-1 transition disabled:opacity-50"
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => onComplete?.()}
            className="bg-primary text-primary-foreground hover:bg-primary/80 rounded px-6 py-1 transition"
          >
            Finish & Exit
          </button>
        )}
      </footer>
    </div>
  );
}

