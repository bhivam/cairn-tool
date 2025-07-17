"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import CharacterCreationWizard from "./character-creation-wizard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { match, P } from "ts-pattern";

export default function CharacterSection() {
  const [mode, setMode] = useState<"list" | "wizard" | "sheet">("list");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: characters, refetch } = api.character.list.useQuery();
  const deleteCharacter = api.character.delete.useMutation({
    onSuccess: () => refetch(),
  });
  const { data: character } = api.character.get.useQuery(
    { id: selectedId ?? 0 },
    { enabled: !!selectedId },
  );

  return (
    <div className="bg-card border-border flex h-full flex-col overflow-hidden rounded-lg border">
      {match({ mode, character })
        // 1) LIST VIEW
        .with({ mode: "list" }, () => (
          <>
            <header className="border-border flex items-center justify-between border-b px-4 py-2">
              <h2 className="text-foreground text-lg font-bold">Characters</h2>
              <button
                className="bg-primary text-primary-foreground hover:bg-primary/80 rounded px-3 py-1 transition"
                onClick={() => setMode("wizard")}
              >
                + Add New
              </button>
            </header>
            <div className="flex-1 space-y-3 overflow-auto p-4">
              {!characters || characters.length === 0 ? (
                <div className="text-muted-foreground text-center">
                  No characters found.
                </div>
              ) : (
                characters.map((c) => (
                  <button
                    key={c.id}
                    className="bg-background border-border text-foreground hover:bg-primary/10 flex w-full justify-between rounded border px-4 py-2 transition"
                    onClick={() => {
                      setSelectedId(c.id);
                      setMode("sheet");
                    }}
                  >
                    <span className="font-semibold">{c.name}</span>
                    <span className="text-muted-foreground text-sm">
                      {c.region}
                    </span>
                  </button>
                ))
              )}
            </div>
          </>
        ))
        // 2) WIZARD VIEW
        .with({ mode: "wizard" }, () => (
          <>
            <header className="border-border flex items-center justify-between border-b px-4 py-2">
              <h2 className="text-foreground text-lg font-bold">
                New Character
              </h2>
              <button
                className="text-primary hover:underline"
                onClick={() => setMode("list")}
              >
                Cancel
              </button>
            </header>
            <div className="flex-1 overflow-auto p-4">
              <CharacterCreationWizard
                onComplete={async () => {
                  await refetch();
                  setMode("list");
                }}
              />
            </div>
          </>
        ))
        // 3a) SHEET VIEW (loaded)
        .with({ mode: "sheet", character: P.nonNullable }, ({ character }) => (
          <>
            <header className="border-border flex items-center justify-between border-b px-4 py-2">
              <button
                className="text-primary hover:underline"
                onClick={() => {
                  setMode("list");
                  setSelectedId(null);
                }}
              >
                ← Back
              </button>
              <h2 className="text-foreground text-lg font-bold">
                {character.name}
              </h2>
              <button
                className="text-destructive hover:underline"
                onClick={() => {
                  if (confirm(`Delete ${character.name}?`)) {
                    deleteCharacter.mutate({ id: character.id });
                    setMode("list");
                    setSelectedId(null);
                  }
                }}
              >
                Delete
              </button>
            </header>
            <div className="flex-1 space-y-4 overflow-auto p-4">
              <Tabs defaultValue="identity" className="space-y-4">
                <TabsList className="border-border border-b">
                  <TabsTrigger value="identity">Identity</TabsTrigger>
                  <TabsTrigger value="statistics">Statistics</TabsTrigger>
                  <TabsTrigger value="inventory">Inventory</TabsTrigger>
                  <TabsTrigger value="magic">Magic</TabsTrigger>
                </TabsList>

                <TabsContent value="identity">
                  <div className="text-foreground space-y-2">
                    <div>
                      <b>Name:</b> {character.name}
                    </div>
                    {character.region && (
                      <div>
                        <b>Region:</b> {character.region}
                      </div>
                    )}
                    {character.status && (
                      <div>
                        <b>Status:</b> {character.status}
                      </div>
                    )}
                    {character.religion && (
                      <div>
                        <b>Religion:</b> {character.religion}
                      </div>
                    )}
                    {character.language && (
                      <div>
                        <b>Language:</b> {character.language}
                      </div>
                    )}
                    {character.notes && (
                      <div>
                        <b>Notes:</b> {character.notes}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="statistics">
                  {character.stats ? (
                    <div className="text-foreground space-y-2">
                      {[
                        [
                          "VIT",
                          character.stats.vitCurrent +
                            "/" +
                            character.stats.vitMax,
                        ],
                        [
                          "DEX",
                          character.stats.dexCurrent +
                            "/" +
                            character.stats.dexMax,
                        ],
                        [
                          "WIS",
                          character.stats.wisCurrent +
                            "/" +
                            character.stats.wisMax,
                        ],
                        [
                          "CHA",
                          character.stats.chaCurrent +
                            "/" +
                            character.stats.chaMax,
                        ],
                        [
                          "HP",
                          character.stats.hpCurrent +
                            "/" +
                            character.stats.hpMax,
                        ],
                        [
                          "AC",
                          character.stats.acCurrent +
                            "/" +
                            character.stats.acMax,
                        ],
                        ["Speed", character.stats.speed],
                        ["Agility", character.stats.agility],
                        ["Spell Level", character.stats.spellCastingLevel],
                        ["Wisdom Prog", character.stats.wisdomProgress + "/20"],
                      ].map(([label, val]) => (
                        <div key={label}>
                          <b>{label}:</b> {val}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground">No stats found.</div>
                  )}
                </TabsContent>

                <TabsContent value="inventory">
                  <div className="text-foreground space-y-2">
                    <div>
                      <b>Coins:</b> {character.coinPurse?.gold ?? 0}g,{" "}
                      {character.coinPurse?.silver ?? 0}s,{" "}
                      {character.coinPurse?.copper ?? 0}c,{" "}
                      {character.coinPurse?.platinum ?? 0}p
                    </div>
                    <div>
                      <b>Weapons:</b>{" "}
                      {character.weapons?.map((w) => w.name).join(", ") ||
                        "None"}
                    </div>
                    <div>
                      <b>Bags:</b>{" "}
                      {character.bagTypes?.map((b) => b.bagName).join(", ") ||
                        "None"}
                    </div>
                    <div>
                      <b>Items:</b>{" "}
                      {character.inventorySlots
                        ?.map((i) => i.itemName)
                        .filter(Boolean)
                        .join(", ") || "None"}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="magic">
                  <div className="text-foreground space-y-2">
                    <div>
                      <b>Spells:</b>{" "}
                      {character.spells?.map((s) => s.name).join(", ") ||
                        "None"}
                    </div>
                    <div>
                      <b>Scrolls:</b>{" "}
                      {character.scrolls?.map((s) => s.spellName).join(", ") ||
                        "None"}
                    </div>
                    <div>
                      <b>Potions:</b>{" "}
                      {character.potions?.map((p) => p.name).join(", ") ||
                        "None"}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        ))
        // 3b) SHEET VIEW (loading)
        .with({ mode: "sheet", character: P.nullish }, () => (
          <div className="text-muted-foreground flex flex-1 items-center justify-center">
            Loading character…
          </div>
        ))
        .exhaustive()}
    </div>
  );
}
