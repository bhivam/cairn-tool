// Seed data for character creation

// Common regions for character creation
export const commonRegions = [
  "The North",
  "The South",
  "The East",
  "The West",
  "The Mountains",
  "The Forest",
  "The Desert",
  "The Coast",
  "The Islands",
  "The City",
  "The Village",
  "The Wilderness",
];

// Common religions
export const commonReligions = [
  "The Old Faith",
  "The New Gods",
  "Nature Worship",
  "Ancestor Worship",
  "The Light",
  "The Dark",
  "The Balance",
  "No Religion",
];

// Common languages
export const commonLanguages = [
  "Common",
  "Elvish",
  "Dwarvish",
  "Orcish",
  "Goblin",
  "Draconic",
  "Celestial",
  "Infernal",
  "Abyssal",
  "Sylvan",
  "Undercommon",
];

// Character classes with their starting equipment
export const characterClasses = [
  {
    name: "Fighter",
    startingWeapons: [
      { name: "Sword", damageDie: "1d8", proficiency: "Trained", traits: "Versatile" },
      { name: "Bow", damageDie: "1d6", proficiency: "Trained", traits: "Ranged" },
    ],
    startingHP: 6,
    startingAC: 3,
  },
  {
    name: "Wizard",
    startingWeapons: [
      { name: "Staff", damageDie: "1d6", proficiency: "Trained", traits: "Two-handed" },
      { name: "Dagger", damageDie: "1d4", proficiency: "Trained", traits: "Light" },
    ],
    startingHP: 4,
    startingAC: 1,
  },
  {
    name: "Cleric",
    startingWeapons: [
      { name: "Mace", damageDie: "1d6", proficiency: "Trained", traits: "Bludgeoning" },
      { name: "Shield", damageDie: "1d4", proficiency: "Trained", traits: "Defensive" },
    ],
    startingHP: 5,
    startingAC: 2,
  },
  {
    name: "Rogue",
    startingWeapons: [
      { name: "Dagger", damageDie: "1d4", proficiency: "Trained", traits: "Light, Finesse" },
      { name: "Shortbow", damageDie: "1d6", proficiency: "Trained", traits: "Ranged" },
    ],
    startingHP: 4,
    startingAC: 2,
  },
  {
    name: "Ranger",
    startingWeapons: [
      { name: "Longbow", damageDie: "1d8", proficiency: "Trained", traits: "Ranged, Heavy" },
      { name: "Shortsword", damageDie: "1d6", proficiency: "Trained", traits: "Light, Finesse" },
    ],
    startingHP: 5,
    startingAC: 2,
  },
  {
    name: "Barbarian",
    startingWeapons: [
      { name: "Greataxe", damageDie: "1d12", proficiency: "Trained", traits: "Heavy, Two-handed" },
      { name: "Javelin", damageDie: "1d6", proficiency: "Trained", traits: "Thrown" },
    ],
    startingHP: 7,
    startingAC: 2,
  },
];

// Common spells for different schools
export const commonSpells = [
  // Cantrips (Level 0)
  { name: "Light", level: 0, school: "Evocation", description: "Creates a small light source" },
  { name: "Mage Hand", level: 0, school: "Conjuration", description: "Creates a spectral hand" },
  { name: "Prestidigitation", level: 0, school: "Transmutation", description: "Minor magical trick" },
  
  // Level 1 Spells
  { name: "Magic Missile", level: 1, school: "Evocation", description: "Three magical projectiles" },
  { name: "Cure Wounds", level: 1, school: "Evocation", description: "Heals a creature" },
  { name: "Sleep", level: 1, school: "Enchantment", description: "Puts creatures to sleep" },
  { name: "Shield", level: 1, school: "Abjuration", description: "Creates a magical barrier" },
  
  // Level 2 Spells
  { name: "Invisibility", level: 2, school: "Illusion", description: "Makes a creature invisible" },
  { name: "Fireball", level: 2, school: "Evocation", description: "Explosion of fire" },
  { name: "Hold Person", level: 2, school: "Enchantment", description: "Paralyzes a humanoid" },
];

// Common potions
export const commonPotions = [
  { name: "Healing Potion", effect: "Restores 2d4+2 hit points" },
  { name: "Potion of Strength", effect: "Grants advantage on Strength checks for 1 hour" },
  { name: "Potion of Invisibility", effect: "Makes the drinker invisible for 1 hour" },
  { name: "Potion of Flying", effect: "Allows the drinker to fly for 1 hour" },
];

// Starting equipment packages
export const startingEquipment = {
  fighter: [
    "Chain mail",
    "Shield",
    "Adventuring gear",
    "Rations (3 days)",
    "Waterskin",
  ],
  wizard: [
    "Scholar's pack",
    "Spellbook",
    "Arcane focus",
    "Rations (3 days)",
    "Waterskin",
  ],
  cleric: [
    "Chain mail",
    "Holy symbol",
    "Priest's pack",
    "Rations (3 days)",
    "Waterskin",
  ],
  rogue: [
    "Leather armor",
    "Thieves' tools",
    "Burglar's pack",
    "Rations (3 days)",
    "Waterskin",
  ],
  ranger: [
    "Leather armor",
    "Explorer's pack",
    "Rations (3 days)",
    "Waterskin",
  ],
  barbarian: [
    "Hide armor",
    "Explorer's pack",
    "Rations (3 days)",
    "Waterskin",
  ],
};

// Starting gold ranges by class
export const startingGold = {
  fighter: { min: 50, max: 200 },
  wizard: { min: 20, max: 100 },
  cleric: { min: 30, max: 150 },
  rogue: { min: 40, max: 180 },
  ranger: { min: 35, max: 160 },
  barbarian: { min: 45, max: 190 },
};

// Function to roll starting gold
export function rollStartingGold(className: string): number {
  const goldRange = startingGold[className as keyof typeof startingGold];
  if (!goldRange) return 50; // Default fallback
  
  return Math.floor(Math.random() * (goldRange.max - goldRange.min + 1)) + goldRange.min;
}

// Function to roll stats (3d6 method)
export function rollStats(): number[] {
  return Array.from({ length: 4 }, () => {
    const rolls = Array.from({ length: 3 }, () => Math.floor(Math.random() * 6) + 1);
    return rolls.reduce((sum, roll) => sum + roll, 0);
  });
}

// Function to roll HP (1d6 + class modifier)
export function rollHP(className: string): number {
  const baseHP = Math.floor(Math.random() * 6) + 1;
  const classHP = characterClasses.find(c => c.name.toLowerCase() === className.toLowerCase())?.startingHP ?? 4;
  return Math.max(1, baseHP + classHP - 4); // Ensure minimum 1 HP
}

// Function to roll AC (1d6 + class modifier)
export function rollAC(className: string): number {
  const baseAC = Math.floor(Math.random() * 6) + 1;
  const classAC = characterClasses.find(c => c.name.toLowerCase() === className.toLowerCase())?.startingAC ?? 1;
  return Math.max(0, Math.min(6, baseAC + classAC - 1)); // Ensure 0-6 range
} 