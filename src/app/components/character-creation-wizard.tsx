"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { commonRegions } from "@/server/db/seed";

type Step = "identity" | "stats" | "class" | "review";

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
    ac: 0,
    speed: 30,
  });
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [characterId, setCharacterId] = useState<number | null>(null);

  const createChar = api.character.create.useMutation({
    onSuccess: (charData) => {
      setStep("stats");
      setCharacterId(charData.id);
    },
  });
  const rollStats = api.characterRolls.rollStats.useMutation({
    onSuccess: (res) =>
      setStats((s) => ({
        ...s,
        vit: res.stats[0]!,
        dex: res.stats[1]!,
        wis: res.stats[2]!,
        cha: res.stats[3]!,
      })),
  });
  const rollHP = api.characterRolls.rollHP.useMutation({
    onSuccess: (res) => setStats((s) => ({ ...s, hp: res.hp })),
  });
  const rollAC = api.characterRolls.rollAC.useMutation({
    onSuccess: (res) => setStats((s) => ({ ...s, ac: res.ac })),
  });
  const genEquip = api.characterRolls.generateStartingEquipment.useMutation({
    onSuccess: () => {
      setStep("review");
      onComplete?.();
    },
  });
  const classesQ = api.characterRolls.getAvailableClasses.useQuery();

  // Handlers
  const handleIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!characterData.name.trim()) return;
    createChar.mutate({
      name: characterData.name,
      region: characterData.region || undefined,
      status: characterData.status || undefined,
      religion: characterData.religion || undefined,
      language: characterData.language || undefined,
      notes: characterData.notes || undefined,
    });
  };

  const handleRollStats = () => {
    if (!characterId) return;
    rollStats.mutate({ characterId });
  };

  const handleSelectClass = (cls: string) => {
    if (!characterId) return;
    setSelectedClass(cls);
    rollHP.mutate({ characterId, className: cls });
    rollAC.mutate({ characterId, className: cls });
  };
  const handleGenEquip = () => {
    if (!selectedClass || !characterId) return;
    genEquip.mutate({ characterId, className: selectedClass });
  };

  // Progress circles
  const steps: Step[] = ["identity", "stats", "class", "review"];
  const idx = steps.indexOf(step);

  return (
    <div className="bg-card border-border flex h-full flex-col overflow-hidden rounded-lg border">
      {/* HEADER */}
      <header className="border-border bg-background border-b px-4 py-3">
        <h2 className="text-foreground text-lg font-bold">
          Character Creation
        </h2>
      </header>

      {/* PROGRESS */}
      <div className="bg-background border-border border-b px-4 py-2">
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

      {/* CONTENT */}
      <div className="bg-background flex-1 overflow-auto px-6 py-4">
        {/* 1) IDENTITY */}
        {step === "identity" && (
          <form
            onSubmit={handleIdentity}
            className="mx-auto max-w-lg space-y-4"
          >
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

            {/* Status, Religion, Language, Notes similar */}
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

        {/* 2) STATS */}
        {step === "stats" && (
          <div className="mx-auto max-w-lg space-y-6">
            <button
              onClick={handleRollStats}
              disabled={rollStats.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/80 w-full rounded px-4 py-2 transition disabled:opacity-50"
            >
              {rollStats.isPending ? "Rolling..." : "Roll Stats"}
            </button>
            <div className="grid grid-cols-2 gap-4">
              {(["vit", "dex", "wis", "cha"] as const).map((attr) => (
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
        )}

        {/* 3) CLASS */}
        {step === "class" && (
          <div className="mx-auto max-w-lg space-y-6">
            {classesQ.data?.map((cls) => (
              <div
                key={cls.name}
                onClick={() => handleSelectClass(cls.name)}
                className={`cursor-pointer rounded border-2 p-4 transition ${
                  selectedClass === cls.name
                    ? "border-primary bg-primary/10"
                    : "border-input bg-background hover:border-border"
                } `}
              >
                <div className="text-foreground font-semibold">{cls.name}</div>
                <div className="text-muted-foreground text-sm">
                  HP {cls.startingHP} | AC {cls.startingAC}
                </div>
              </div>
            ))}
            <button
              onClick={handleGenEquip}
              disabled={!selectedClass || genEquip.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/80 w-full rounded px-4 py-2 transition disabled:opacity-50"
            >
              {genEquip.isPending
                ? "Generating…"
                : "Generate Starting Equipment"}
            </button>
          </div>
        )}

        {/* 4) REVIEW */}
        {step === "review" && (
          <div className="mx-auto max-w-lg space-y-6">
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
                {(["vit", "dex", "wis", "cha", "hp", "ac"] as const).map(
                  (k) => (
                    <div key={k} className="capitalize">
                      {k}: {stats[k]}
                    </div>
                  ),
                )}
              </div>
            </div>
            <div className="text-center">
              <button
                onClick={() => onComplete?.()}
                className="bg-primary text-primary-foreground hover:bg-primary/80 rounded px-6 py-2 transition"
              >
                Finish & Exit
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER NAV */}
      <footer className="border-border bg-background flex items-center justify-between border-t px-6 py-3">
        {step !== "identity" ? (
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
        ) : (
          <div />
        )}
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
            disabled={stats.vit === 0}
            className="bg-primary text-primary-foreground hover:bg-primary/80 rounded px-4 py-1 transition disabled:opacity-50"
          >
            Next
          </button>
        ) : step === "class" ? (
          <button
            onClick={handleGenEquip}
            disabled={!selectedClass || genEquip.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/80 rounded px-4 py-1 transition disabled:opacity-50"
          >
            {genEquip.isPending ? "Generating…" : "Next"}
          </button>
        ) : (
          <div />
        )}
      </footer>
    </div>
  );
}
