"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import CharacterCreationWizard from "./character-creation-wizard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CharacterSection() {
  const [mode, setMode] = useState<"list" | "wizard" | "sheet">("list");
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(null);

  // Fetch all characters for the user
  const { data: characters, refetch } = api.character.list.useQuery();
  const deleteCharacter = api.character.delete.useMutation({
    onSuccess: async () => {
      await refetch();
    },
  });

  // Fetch selected character details
  const { data: selectedCharacter } = api.character.get.useQuery(
    { id: selectedCharacterId ?? 0 },
    { enabled: !!selectedCharacterId }
  );

  // Character List UI
  if (mode === "list") {
    return (
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-gray-800">Characters</h2>
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            onClick={() => setMode("wizard")}
          >
            + Add New
          </button>
        </div>
        {(!characters || characters.length === 0) && (
          <div className="text-gray-500 text-center py-8">No characters found.</div>
        )}
        <div className="flex flex-col gap-2">
          {characters?.map((character) => (
            <button
              key={character.id}
              className="w-full text-left bg-white border border-gray-200 rounded px-4 py-2 hover:bg-blue-50 flex justify-between items-center"
              onClick={() => {
                setSelectedCharacterId(character.id);
                setMode("sheet");
              }}
            >
              <span className="font-semibold text-gray-800">{character.name}</span>
              <span className="text-xs text-gray-500">{character.region}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Character Creation Wizard UI
  if (mode === "wizard") {
    return (
      <div className="w-full max-w-sm">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-gray-800">Create Character</h2>
          <button
            className="text-blue-600 hover:underline"
            onClick={() => setMode("list")}
          >
            Back to List
          </button>
        </div>
        <CharacterCreationWizard
          onComplete={async () => {
            setMode("list");
            await refetch();
          }}
        />
      </div>
    );
  }

  // Character Sheet UI
  if (mode === "sheet" && selectedCharacter) {
    return (
      <div className="w-full max-w-sm flex flex-col gap-4">
        <div className="flex justify-between items-center mb-2">
          <button
            className="text-blue-600 hover:underline"
            onClick={() => {
              setMode("list");
              setSelectedCharacterId(null);
            }}
          >
            ← Back to List
          </button>
          <span className="font-bold text-lg text-gray-800">{selectedCharacter.name}</span>
          <button
            className="text-red-600 hover:underline text-sm"
            onClick={() => {
              if (window.confirm(`Delete ${selectedCharacter.name}?`)) {
                deleteCharacter.mutate({ id: selectedCharacter.id });
                setMode("list");
                setSelectedCharacterId(null);
              }
            }}
          >
            Delete
          </button>
        </div>
        <Tabs defaultValue="identity" className="w-full">
          <TabsList>
            <TabsTrigger value="identity">Identity</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="magic">Magic</TabsTrigger>
          </TabsList>
          <TabsContent value="identity">
            <div className="text-black space-y-2">
              <div><b>Name:</b> {selectedCharacter.name}</div>
              {selectedCharacter.region && <div><b>Region:</b> {selectedCharacter.region}</div>}
              {selectedCharacter.status && <div><b>Status:</b> {selectedCharacter.status}</div>}
              {selectedCharacter.religion && <div><b>Religion:</b> {selectedCharacter.religion}</div>}
              {selectedCharacter.language && <div><b>Language:</b> {selectedCharacter.language}</div>}
              {selectedCharacter.notes && <div><b>Notes:</b> {selectedCharacter.notes}</div>}
            </div>
          </TabsContent>
          <TabsContent value="statistics">
            {selectedCharacter.stats ? (
              <div className="text-black space-y-2">
                <div><b>VIT:</b> {selectedCharacter.stats.vitCurrent} / {selectedCharacter.stats.vitMax}</div>
                <div><b>DEX:</b> {selectedCharacter.stats.dexCurrent} / {selectedCharacter.stats.dexMax}</div>
                <div><b>WIS:</b> {selectedCharacter.stats.wisCurrent} / {selectedCharacter.stats.wisMax}</div>
                <div><b>CHA:</b> {selectedCharacter.stats.chaCurrent} / {selectedCharacter.stats.chaMax}</div>
                <div><b>HP:</b> {selectedCharacter.stats.hpCurrent} / {selectedCharacter.stats.hpMax}</div>
                <div><b>AC:</b> {selectedCharacter.stats.acCurrent} / {selectedCharacter.stats.acMax}</div>
                <div><b>Speed:</b> {selectedCharacter.stats.speed}</div>
                <div><b>Agility:</b> {selectedCharacter.stats.agility}</div>
                <div><b>Spell Casting Level:</b> {selectedCharacter.stats.spellCastingLevel}</div>
                <div><b>Wisdom Progress:</b> {selectedCharacter.stats.wisdomProgress} / 20</div>
              </div>
            ) : <div className="text-gray-500">No stats found.</div>}
          </TabsContent>
          <TabsContent value="inventory">
            <div className="text-black space-y-2">
              {/* Inventory slots, coin purse, bags, etc. */}
              <div><b>Coin Purse:</b> {selectedCharacter.coinPurse?.gold ?? 0}g, {selectedCharacter.coinPurse?.silver ?? 0}s, {selectedCharacter.coinPurse?.copper ?? 0}c, {selectedCharacter.coinPurse?.platinum ?? 0}p</div>
              <div><b>Weapons:</b> {selectedCharacter.weapons?.map(w => w.name).join(", ") || "None"}</div>
              <div><b>Bags:</b> {selectedCharacter.bagTypes?.map(b => b.bagName).join(", ") || "None"}</div>
              <div><b>Inventory:</b> {selectedCharacter.inventorySlots?.map(i => i.itemName).filter(Boolean).join(", ") || "None"}</div>
            </div>
          </TabsContent>
          <TabsContent value="magic">
            <div className="text-black space-y-2">
              <div><b>Spells:</b> {selectedCharacter.spells?.map(s => s.name).join(", ") || "None"}</div>
              <div><b>Scrolls:</b> {selectedCharacter.scrolls?.map(s => s.spellName).join(", ") || "None"}</div>
              <div><b>Potions:</b> {selectedCharacter.potions?.map(p => p.name).join(", ") || "None"}</div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Loading state for selected character
  if (mode === "sheet" && !selectedCharacter) {
    return <div className="text-center text-gray-500 py-8">Loading character...</div>;
  }

  return null;
}
