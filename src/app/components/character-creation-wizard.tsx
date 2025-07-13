"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { commonRegions, commonReligions, commonLanguages } from "@/server/db/seed";

type Step = "identity" | "stats" | "class" | "equipment" | "review";

interface CharacterData {
  name: string;
  portrait?: string;
  region: string;
  status: string;
  religion: string;
  language: string;
  notes: string;
}

interface StatsData {
  vit: number;
  dex: number;
  wis: number;
  cha: number;
  hp: number;
  ac: number;
  speed: number;
}

interface CharacterCreationWizardProps {
  onComplete?: () => void;
}

export default function CharacterCreationWizard({ onComplete }: CharacterCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>("identity");
  const [characterData, setCharacterData] = useState<CharacterData>({
    name: "",
    region: "",
    status: "",
    religion: "",
    language: "",
    notes: "",
  });
  const [statsData, setStatsData] = useState<StatsData>({
    vit: 0,
    dex: 0,
    wis: 0,
    cha: 0,
    hp: 0,
    ac: 0,
    speed: 30,
  });
  const [selectedClass, setSelectedClass] = useState("");
  const [characterId, setCharacterId] = useState<number | null>(null);

  // API calls
  const createCharacter = api.character.create.useMutation({
    onSuccess: (character) => {
      setCharacterId(character.id);
      setCurrentStep("stats");
    },
  });

  const rollStats = api.characterRolls.rollStats.useMutation({
    onSuccess: (result) => {
      const [vit, dex, wis, cha] = result.stats;
      setStatsData(prev => ({
        ...prev,
        vit: vit || 0,
        dex: dex || 0,
        wis: wis || 0,
        cha: cha || 0,
      }));
    },
  });

  const rollHP = api.characterRolls.rollHP.useMutation({
    onSuccess: (result) => {
      setStatsData(prev => ({
        ...prev,
        hp: result.hp,
      }));
    },
  });

  const rollAC = api.characterRolls.rollAC.useMutation({
    onSuccess: (result) => {
      setStatsData(prev => ({
        ...prev,
        ac: result.ac,
      }));
    },
  });

  const generateEquipment = api.characterRolls.generateStartingEquipment.useMutation({
    onSuccess: () => {
      setCurrentStep("review");
      if (onComplete) onComplete();
    },
  });

  const getClasses = api.characterRolls.getAvailableClasses.useQuery();

  const handleIdentitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!characterData.name.trim()) {
      alert("Name is required");
      return;
    }

    createCharacter.mutate({
      name: characterData.name.trim(),
      region: characterData.region.trim() || undefined,
      status: characterData.status.trim() || undefined,
      religion: characterData.religion.trim() || undefined,
      language: characterData.language.trim() || undefined,
      notes: characterData.notes.trim() || undefined,
    });
  };

  const handleStatsRoll = () => {
    if (!characterId) return;
    rollStats.mutate({ characterId });
  };

  const handleHPRoll = () => {
    if (!characterId || !selectedClass) return;
    rollHP.mutate({ characterId, className: selectedClass });
  };

  const handleACRoll = () => {
    if (!characterId || !selectedClass) return;
    rollAC.mutate({ characterId, className: selectedClass });
  };

  const handleClassSelect = (className: string) => {
    setSelectedClass(className);
    // Auto-roll HP and AC when class is selected
    if (characterId) {
      rollHP.mutate({ characterId, className });
      rollAC.mutate({ characterId, className });
    }
  };

  const handleEquipmentGenerate = () => {
    if (!characterId || !selectedClass) return;
    generateEquipment.mutate({ characterId, className: selectedClass });
  };

  const renderIdentityStep = () => (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Character Identity</h2>
      
      <form onSubmit={handleIdentitySubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            id="name"
            value={characterData.name}
            onChange={(e) => setCharacterData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter character name"
            required
          />
        </div>

        <div>
          <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
            Region
          </label>
          <select
            id="region"
            value={characterData.region}
            onChange={(e) => setCharacterData(prev => ({ ...prev, region: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a region</option>
            {commonRegions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
            <option value="custom">Custom...</option>
          </select>
          {characterData.region === "custom" && (
            <input
              type="text"
              placeholder="Enter custom region"
              className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setCharacterData(prev => ({ ...prev, region: e.target.value }))}
            />
          )}
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <input
            type="text"
            id="status"
            value={characterData.status}
            onChange={(e) => setCharacterData(prev => ({ ...prev, status: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter status"
          />
        </div>

        <div>
          <label htmlFor="religion" className="block text-sm font-medium text-gray-700 mb-1">
            Religion
          </label>
          <select
            id="religion"
            value={characterData.religion}
            onChange={(e) => setCharacterData(prev => ({ ...prev, religion: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a religion</option>
            {commonReligions.map(religion => (
              <option key={religion} value={religion}>{religion}</option>
            ))}
            <option value="custom">Custom...</option>
          </select>
          {characterData.religion === "custom" && (
            <input
              type="text"
              placeholder="Enter custom religion"
              className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setCharacterData(prev => ({ ...prev, religion: e.target.value }))}
            />
          )}
        </div>

        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
          <select
            id="language"
            value={characterData.language}
            onChange={(e) => setCharacterData(prev => ({ ...prev, language: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a language</option>
            {commonLanguages.map(language => (
              <option key={language} value={language}>{language}</option>
            ))}
            <option value="custom">Custom...</option>
          </select>
          {characterData.language === "custom" && (
            <input
              type="text"
              placeholder="Enter custom language"
              className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setCharacterData(prev => ({ ...prev, language: e.target.value }))}
            />
          )}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            value={characterData.notes}
            onChange={(e) => setCharacterData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter notes"
          />
        </div>

        <button
          type="submit"
          disabled={createCharacter.isPending}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createCharacter.isPending ? "Creating..." : "Create Character"}
        </button>
      </form>
    </div>
  );

  const renderStatsStep = () => (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Roll Statistics</h2>
      
      <div className="space-y-4">
        <div className="text-center">
          <button
            onClick={handleStatsRoll}
            disabled={rollStats.isPending}
            className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {rollStats.isPending ? "Rolling..." : "Roll Stats (3d6)"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gray-100 rounded-md">
            <div className="text-sm text-gray-600">VIT</div>
            <div className="text-2xl font-bold">{statsData.vit}</div>
          </div>
          <div className="text-center p-4 bg-gray-100 rounded-md">
            <div className="text-sm text-gray-600">DEX</div>
            <div className="text-2xl font-bold">{statsData.dex}</div>
          </div>
          <div className="text-center p-4 bg-gray-100 rounded-md">
            <div className="text-sm text-gray-600">WIS</div>
            <div className="text-2xl font-bold">{statsData.wis}</div>
          </div>
          <div className="text-center p-4 bg-gray-100 rounded-md">
            <div className="text-sm text-gray-600">CHA</div>
            <div className="text-2xl font-bold">{statsData.cha}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-100 rounded-md">
            <div className="text-sm text-gray-600">HP</div>
            <div className="text-xl font-bold">{statsData.hp}</div>
          </div>
          <div className="text-center p-4 bg-blue-100 rounded-md">
            <div className="text-sm text-gray-600">AC</div>
            <div className="text-xl font-bold">{statsData.ac}</div>
          </div>
          <div className="text-center p-4 bg-blue-100 rounded-md">
            <div className="text-sm text-gray-600">Speed</div>
            <div className="text-xl font-bold">{statsData.speed}</div>
          </div>
        </div>

        <button
          onClick={() => setCurrentStep("class")}
          disabled={statsData.vit === 0}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Class Selection
        </button>
      </div>
    </div>
  );

  const renderClassStep = () => (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Select Class</h2>
      
      <div className="space-y-4">
        {getClasses.data?.map((classInfo) => (
          <div
            key={classInfo.name}
            className={`p-4 border-2 rounded-md cursor-pointer transition-colors ${
              selectedClass === classInfo.name
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleClassSelect(classInfo.name)}
          >
            <h3 className="font-bold text-lg">{classInfo.name}</h3>
            <div className="text-sm text-gray-600">
              Starting HP: {classInfo.startingHP} | Starting AC: {classInfo.startingAC}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Weapons: {classInfo.startingWeapons.map(w => w.name).join(", ")}
            </div>
          </div>
        ))}

        {selectedClass && (
          <button
            onClick={handleEquipmentGenerate}
            disabled={generateEquipment.isPending}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generateEquipment.isPending ? "Generating..." : "Generate Starting Equipment"}
          </button>
        )}
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Character Review</h2>
      
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-bold text-lg mb-2">{characterData.name}</h3>
          <div className="text-sm text-gray-600">
            <div>Region: {characterData.region || "None"}</div>
            <div>Status: {characterData.status || "None"}</div>
            <div>Religion: {characterData.religion || "None"}</div>
            <div>Language: {characterData.language || "None"}</div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-bold text-lg mb-2">Statistics</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>VIT: {statsData.vit}</div>
            <div>DEX: {statsData.dex}</div>
            <div>WIS: {statsData.wis}</div>
            <div>CHA: {statsData.cha}</div>
            <div>HP: {statsData.hp}</div>
            <div>AC: {statsData.ac}</div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-bold text-lg mb-2">Class</h3>
          <div className="text-sm">{selectedClass}</div>
        </div>

        <div className="text-center">
          <div className="text-green-600 font-bold mb-4">
            Character created successfully!
          </div>
          <button
            onClick={() => window.location.href = "/"}
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Return to Main Page
          </button>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "identity":
        return renderIdentityStep();
      case "stats":
        return renderStatsStep();
      case "class":
        return renderClassStep();
      case "review":
        return renderReviewStep();
      default:
        return renderIdentityStep();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Character Creation Wizard
        </h1>
        
        {/* Progress indicator */}
        <div className="max-w-md mx-auto mb-8">
          <div className="flex items-center justify-between">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep === "identity" ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
            }`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-2 ${
              currentStep !== "identity" ? "bg-blue-600" : "bg-gray-300"
            }`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep === "stats" ? "bg-blue-600 text-white" : 
              currentStep === "class" || currentStep === "review" ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
            }`}>
              2
            </div>
            <div className={`flex-1 h-1 mx-2 ${
              currentStep === "class" || currentStep === "review" ? "bg-blue-600" : "bg-gray-300"
            }`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep === "class" ? "bg-blue-600 text-white" : 
              currentStep === "review" ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
            }`}>
              3
            </div>
            <div className={`flex-1 h-1 mx-2 ${
              currentStep === "review" ? "bg-blue-600" : "bg-gray-300"
            }`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep === "review" ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
            }`}>
              4
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Identity</span>
            <span>Stats</span>
            <span>Class</span>
            <span>Review</span>
          </div>
        </div>

        {renderCurrentStep()}
      </div>
    </div>
  );
} 