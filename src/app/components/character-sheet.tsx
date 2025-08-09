"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import CharacterCreationWizard from "./character-creation-wizard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { match, P } from "ts-pattern";

export default function CharacterSection() {
  const [mode, setMode] = useState<"list" | "wizard" | "sheet">("list");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: characters, refetch } = api.character.list.useQuery();
  const { data: character } = api.character.get.useQuery(
    { id: selectedId ?? 0 },
    { enabled: !!selectedId },
  );

  return (
    <div className="bg-card border-border flex h-full flex-col overflow-hidden border-r">
      {match({ mode, character })
        // 1) LIST VIEW
        .with({ mode: "list" }, () => (
          <>
            <header className="border-border flex items-center justify-between border-b px-2 py-2">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <h2 className="text-foreground text-lg font-bold">Characters</h2>
              </div>
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
            <header className="border-border flex items-center justify-between border-b px-2 py-2">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <h2 className="text-foreground text-lg font-bold">New Character</h2>
              </div>
              <button className="text-primary hover:underline" onClick={() => setMode("list")}>
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
            <header className="border-border flex items-center justify-between border-b px-2 py-2">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <button
                  className="text-primary hover:underline"
                  onClick={() => {
                    setMode("list");
                    setSelectedId(null);
                  }}
                >
                  ← Back
                </button>
              </div>
              <h2 className="text-foreground text-lg font-bold truncate">
                {character.name}
              </h2>
              <div className="w-6" />
            </header>
            <div className="flex-1 space-y-4 overflow-auto p-4">
              <Tabs defaultValue="identity" className="min-w-0 space-y-3">
                <TabsList className="w-full max-w-full overflow-x-auto whitespace-nowrap">
                  <TabsTrigger className="flex-none" value="identity">
                    Identity
                  </TabsTrigger>
                  <TabsTrigger className="flex-none" value="statistics">
                    Statistics
                  </TabsTrigger>
                  <TabsTrigger className="flex-none" value="inventory">
                    Inventory
                  </TabsTrigger>
                  <TabsTrigger className="flex-none" value="magic">
                    Magic
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="identity">
                  <div className="space-y-3">
                    <div className="bg-card/80 border-border rounded-lg border p-3 shadow-sm">
                      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Name
                      </div>
                      <div className="text-foreground mt-1 text-sm">{character.name}</div>
                    </div>
                    {character.region && (
                      <div className="bg-card/80 border-border rounded-lg border p-3 shadow-sm">
                        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Region
                        </div>
                        <div className="text-foreground mt-1 text-sm">{character.region}</div>
                      </div>
                    )}
                    {character.status && (
                      <div className="bg-card/80 border-border rounded-lg border p-3 shadow-sm">
                        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Status
                        </div>
                        <div className="text-foreground mt-1 text-sm">{character.status}</div>
                      </div>
                    )}
                    {character.religion && (
                      <div className="bg-card/80 border-border rounded-lg border p-3 shadow-sm">
                        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Religion
                        </div>
                        <div className="text-foreground mt-1 text-sm">{character.religion}</div>
                      </div>
                    )}
                    {character.language && (
                      <div className="bg-card/80 border-border rounded-lg border p-3 shadow-sm">
                        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Language
                        </div>
                        <div className="text-foreground mt-1 text-sm">{character.language}</div>
                      </div>
                    )}
                    {character.notes && (
                      <div className="bg-card/80 border-border rounded-lg border p-3 shadow-sm">
                        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Notes
                        </div>
                        <div className="text-foreground mt-1 text-sm break-words">{character.notes}</div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="statistics">
                  {character.stats ? (
                    <div className="grid grid-cols-2 gap-2">
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
                        <div
                          key={label}
                          className="bg-card/80 border-border rounded-lg border p-3 text-sm shadow-sm"
                        >
                          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {label}
                          </div>
                          <div className="text-foreground mt-1 font-semibold">
                            {val as string | number}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground">No stats found.</div>
                  )}
                </TabsContent>

                <TabsContent value="inventory">
                  <div className="space-y-3">
                    <div className="bg-card/80 border-border rounded-lg border p-3 shadow-sm">
                      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Coins
                      </div>
                      <div className="text-foreground mt-1 text-sm">
                        {(character.coinPurse?.gold ?? 0)}g, {(character.coinPurse?.silver ?? 0)}s, {(character.coinPurse?.copper ?? 0)}c, {(character.coinPurse?.platinum ?? 0)}p
                      </div>
                    </div>
                    <div className="bg-card/80 border-border rounded-lg border p-3 shadow-sm">
                      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Weapons
                      </div>
                      <div className="text-foreground mt-1 text-sm break-words">
                        {character.weapons?.map((w) => w.name).join(", ") || "None"}
                      </div>
                    </div>
                    <div className="bg-card/80 border-border rounded-lg border p-3 shadow-sm">
                      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Bags
                      </div>
                      <div className="text-foreground mt-1 text-sm break-words">
                        {character.bagTypes?.map((b) => b.bagName).join(", ") || "None"}
                      </div>
                    </div>
                    <div className="bg-card/80 border-border rounded-lg border p-3 shadow-sm">
                      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Items
                      </div>
                      <div className="text-foreground mt-1 text-sm break-words">
                        {character.inventorySlots
                          ?.map((i) => i.itemName)
                          .filter(Boolean)
                          .join(", ") || "None"}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="magic">
                  <div className="space-y-3">
                    <div className="bg-card/80 border-border rounded-lg border p-3 shadow-sm">
                      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Spells
                      </div>
                      <div className="text-foreground mt-1 text-sm break-words">
                        {character.spells?.map((s) => s.name).join(", ") || "None"}
                      </div>
                    </div>
                    <div className="bg-card/80 border-border rounded-lg border p-3 shadow-sm">
                      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Scrolls
                      </div>
                      <div className="text-foreground mt-1 text-sm break-words">
                        {character.scrolls?.map((s) => s.spellName).join(", ") || "None"}
                      </div>
                    </div>
                    <div className="bg-card/80 border-border rounded-lg border p-3 shadow-sm">
                      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Potions
                      </div>
                      <div className="text-foreground mt-1 text-sm break-words">
                        {character.potions?.map((p) => p.name).join(", ") || "None"}
                      </div>
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
