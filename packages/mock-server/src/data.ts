/**
 * Mock data for the Foundry VTT mock server.
 * Provides realistic dummy data matching Foundry VTT data structures.
 */

// Import types from shared package using relative path
import type {
  FoundryActor,
  FoundryScene,
  FoundryCombat,
  FoundryJournal,
  FoundryMacro,
  FoundryActiveEffect,
  FoundryFolder,
  FoundryRollTable,
  WorldInfo,
  CompendiumResult,
  ModuleInfoMessage,
} from '../../shared/dist/index.js';

// ============================================================
// Actor IDs (consistent references)
// ============================================================
export const ACTOR_IDS = {
  kaelith: 'actor_kaelith_001',
  thrain: 'actor_thrain_002',
  lyra: 'actor_lyra_003',
  goblinBoss: 'actor_goblinBoss_005',
} as const;

// ============================================================
// Token IDs
// ============================================================
export const TOKEN_IDS = {
  kaelith: 'tok_kaelith_001',
  thrain: 'tok_thrain_002',
  lyra: 'tok_lyra_003',
  barkeeper: 'tok_barkeep_004',
  goblinBoss: 'tok_goblinBoss_006',
} as const;

// ============================================================
// Scene IDs
// ============================================================
export const SCENE_IDS = {
  tavern: 'scene_tavern_001',
  forest: 'scene_forest_002',
} as const;

// ============================================================
// User IDs
// ============================================================
export const USER_IDS = {
  gm: 'user_gm_001',
  sarah: 'user_player_001',
  marcus: 'user_player_002',
  elena: 'user_player_003',
} as const;

// ============================================================
// Item data for actors
// ============================================================

const kaelithItems = [
  {
    _id: 'item_quarterstaff_001',
    name: 'Quarterstaff',
    type: 'weapon',
    img: 'systems/dnd5e/icons/weapons/staves/quarterstaff.webp',
    system: {
      ability: 'str',
      actionType: 'mwak',
      damage: { parts: [['1d6', 'bludgeoning']], versatile: '1d8' },
      proficient: true,
      equipped: true,
      price: { value: 0.2, denomination: 'gp' },
      weight: 4,
      rarity: 'common',
    },
  },
  {
    _id: 'item_spellbook_001',
    name: 'Spellbook',
    type: 'equipment',
    img: 'systems/dnd5e/icons/items/books/book-purple.webp',
    system: {
      equipped: true,
      rarity: 'common',
      weight: 3,
      price: { value: 15, denomination: 'gp' },
      description: { value: '<p>A leather-bound spellbook filled with arcane notation and diagrams.</p>' },
    },
  },
  {
    _id: 'item_magearmor_001',
    name: 'Mage Armor',
    type: 'spell',
    img: 'systems/dnd5e/icons/spells/protect-blue-3.jpg',
    system: {
      level: 1,
      school: 'abj',
      components: { vocal: true, somatic: true, material: true },
      materials: { value: 'a piece of cured leather', consumed: false },
      preparation: { mode: 'prepared', prepared: true },
      description: { value: '<p>You touch a willing creature who isn\'t wearing armor, and a protective magical force surrounds it until the spell ends. The target\'s base AC becomes 13 + its Dexterity modifier.</p>' },
      activation: { type: 'action', cost: 1 },
      duration: { value: 8, units: 'hour' },
      target: { value: 1, type: 'creature' },
      range: { value: 5, units: 'touch' },
    },
  },
  {
    _id: 'item_firebolt_001',
    name: 'Fire Bolt',
    type: 'spell',
    img: 'systems/dnd5e/icons/spells/fire-red-2.jpg',
    system: {
      level: 0,
      school: 'evo',
      components: { vocal: true, somatic: true },
      preparation: { mode: 'prepared', prepared: true },
      description: { value: '<p>You hurl a mote of fire at a creature or object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 fire damage.</p>' },
      activation: { type: 'action', cost: 1 },
      target: { type: 'creature', value: 1 },
      range: { value: 120, units: 'ft' },
      damage: { parts: [['1d10', 'fire']] },
    },
  },
  {
    _id: 'item_shield_001',
    name: 'Shield',
    type: 'spell',
    img: 'systems/dnd5e/icons/spells/protect-blue-2.jpg',
    system: {
      level: 1,
      school: 'abj',
      components: { vocal: true, somatic: true },
      preparation: { mode: 'prepared', prepared: true },
      description: { value: '<p>An invisible barrier appears and protects you. Until the start of your next turn, you have a +5 bonus to AC.</p>' },
      activation: { type: 'reaction', cost: 1 },
      duration: { value: 1, units: 'round' },
      target: { type: 'self', value: 1 },
    },
  },
  {
    _id: 'item_magicmissile_001',
    name: 'Magic Missile',
    type: 'spell',
    img: 'systems/dnd5e/icons/spells/missile-blue-1.jpg',
    system: {
      level: 1,
      school: 'evo',
      components: { vocal: true, somatic: true },
      preparation: { mode: 'prepared', prepared: true },
      description: { value: '<p>You create three glowing darts of magical force. Each dart hits a creature of your choice that you can see within range. Each dart deals 1d4+1 force damage.</p>' },
      activation: { type: 'action', cost: 1 },
      target: { type: 'creature', value: 3 },
      range: { value: 120, units: 'ft' },
      damage: { parts: [['1d4+1', 'force']] },
    },
  },
  {
    _id: 'item_detectmagic_001',
    name: 'Detect Magic',
    type: 'spell',
    img: 'systems/dnd5e/icons/spells/enchant-blue-3.jpg',
    system: {
      level: 1,
      school: 'div',
      components: { vocal: true, somatic: true },
      preparation: { mode: 'prepared', prepared: true },
      ritual: true,
      description: { value: '<p>For the duration, you sense the presence of magic within 30 feet of you.</p>' },
      activation: { type: 'action', cost: 1 },
      duration: { value: 10, units: 'minute' },
      target: { type: 'self', value: 1 },
      range: { value: 30, units: 'ft' },
    },
  },
  {
    _id: 'item_arcaneRecovery_001',
    name: 'Arcane Recovery',
    type: 'feat',
    img: 'systems/dnd5e/icons/skills/blue_17.jpg',
    system: {
      description: { value: '<p>You have learned to regain some of your magical energy by studying your spellbook. Once per day when you finish a short rest, you can choose expended spell slots to recover. The spell slots can have a combined level that is equal to or less than half your wizard level (rounded up), and none of the slots can be 6th level or higher.</p>' },
      activation: { type: 'special', cost: 1 },
      uses: { value: 1, max: 1, per: 'lr', recovery: '1' },
    },
  },
  {
    _id: 'item_robe_001',
    name: 'Traveler\'s Robes',
    type: 'equipment',
    img: 'systems/dnd5e/icons/items/equipment/robes.webp',
    system: {
      equipped: true,
      armor: { type: 'clothing', value: 10, dex: null },
      rarity: 'common',
      weight: 4,
      price: { value: 1, denomination: 'gp' },
    },
  },
  {
    _id: 'item_componentPouch_001',
    name: 'Component Pouch',
    type: 'equipment',
    img: 'systems/dnd5e/icons/items/equipment/pouch.webp',
    system: {
      equipped: true,
      rarity: 'common',
      weight: 2,
      price: { value: 25, denomination: 'gp' },
    },
  },
  {
    _id: 'item_healingPotion_001',
    name: 'Potion of Healing',
    type: 'consumable',
    img: 'systems/dnd5e/icons/items/potions/potion-red.webp',
    system: {
      uses: { value: 2, max: 2, per: null },
      activation: { type: 'action', cost: 1 },
      damage: { parts: [['2d4+2', 'healing']] },
      rarity: 'common',
      weight: 0.5,
      price: { value: 50, denomination: 'gp' },
      description: { value: '<p>You regain 2d4 + 2 hit points when you drink this potion.</p>' },
    },
  },
  {
    _id: 'item_scrollFireball_001',
    name: 'Scroll of Fireball',
    type: 'consumable',
    img: 'systems/dnd5e/icons/items/scrolls/scroll-fire.webp',
    system: {
      level: 3,
      school: 'evo',
      activation: { type: 'action', cost: 1 },
      uses: { value: 1, max: 1, per: null },
      rarity: 'uncommon',
      weight: 0,
      price: { value: 200, denomination: 'gp' },
      description: { value: '<p>A scroll inscribed with the Fireball spell. Casting the scroll consumes it.</p>' },
    },
  },
  {
    _id: 'item_scrollMistyStep_001',
    name: 'Scroll of Misty Step',
    type: 'consumable',
    img: 'systems/dnd5e/icons/items/scrolls/scroll-arcane.webp',
    system: {
      level: 2,
      school: 'con',
      activation: { type: 'bonus', cost: 1 },
      uses: { value: 1, max: 1, per: null },
      rarity: 'uncommon',
      weight: 0,
      price: { value: 150, denomination: 'gp' },
      description: { value: '<p>Briefly surrounded by silvery mist, you teleport up to 30 feet to an unoccupied space that you can see.</p>' },
    },
  },
];

const thrainItems = [
  {
    _id: 'item_warhammer_001',
    name: 'Warhammer',
    type: 'weapon',
    img: 'systems/dnd5e/icons/weapons/hammers/warhammer.webp',
    system: {
      ability: 'str',
      actionType: 'mwak',
      damage: { parts: [['1d8', 'bludgeoning']], versatile: '1d10' },
      proficient: true,
      equipped: true,
      properties: { ver: true },
      price: { value: 15, denomination: 'gp' },
      weight: 2,
      rarity: 'common',
    },
  },
  {
    _id: 'item_chainmail_001',
    name: 'Chain Mail',
    type: 'equipment',
    img: 'systems/dnd5e/icons/items/equipment/chainmail.webp',
    system: {
      equipped: true,
      armor: { type: 'heavy', value: 16, dex: 0 },
      stealthDisadvantage: true,
      strength: 13,
      rarity: 'common',
      weight: 55,
      price: { value: 75, denomination: 'gp' },
    },
  },
  {
    _id: 'item_shieldEquip_001',
    name: 'Shield',
    type: 'equipment',
    img: 'systems/dnd5e/icons/items/equipment/shield.webp',
    system: {
      equipped: true,
      armor: { type: 'shield', value: 2, dex: null },
      rarity: 'common',
      weight: 6,
      price: { value: 10, denomination: 'gp' },
    },
  },
  {
    _id: 'item_secondWind_001',
    name: 'Second Wind',
    type: 'feat',
    img: 'systems/dnd5e/icons/skills/red_29.jpg',
    system: {
      description: { value: '<p>You have a limited well of stamina that you can draw on to protect yourself from harm. On your turn, you can use a bonus action to regain hit points equal to 1d10 + your fighter level.</p>' },
      activation: { type: 'bonus', cost: 1 },
      uses: { value: 1, max: 1, per: 'sr', recovery: '1' },
    },
  },
  {
    _id: 'item_actionSurge_001',
    name: 'Action Surge',
    type: 'feat',
    img: 'systems/dnd5e/icons/skills/red_12.jpg',
    system: {
      description: { value: '<p>Starting at 2nd level, you can push yourself beyond your normal limits for a moment. On your turn, you can take one additional action on top of your regular action and a possible bonus action.</p>' },
      activation: { type: 'special', cost: 1 },
      uses: { value: 1, max: 1, per: 'sr', recovery: '1' },
    },
  },
  {
    _id: 'item_fightingStyle_001',
    name: 'Fighting Style: Defense',
    type: 'feat',
    img: 'systems/dnd5e/icons/skills/red_03.jpg',
    system: {
      description: { value: '<p>While you are wearing armor, you gain a +1 bonus to AC.</p>' },
      passiveEffects: { bonus: { ac: 1 } },
    },
  },
  {
    _id: 'item_greataxe_001',
    name: 'Greataxe',
    type: 'weapon',
    img: 'systems/dnd5e/icons/weapons/axes/greataxe.webp',
    system: {
      ability: 'str',
      actionType: 'mwak',
      damage: { parts: [['1d12', 'slashing']] },
      proficient: true,
      equipped: false,
      properties: { hvy: true, two: true },
      price: { value: 30, denomination: 'gp' },
      weight: 7,
      rarity: 'common',
    },
  },
  {
    _id: 'item_handaxe_001',
    name: 'Handaxe',
    type: 'weapon',
    img: 'systems/dnd5e/icons/weapons/axes/handaxe.webp',
    system: {
      ability: 'str',
      actionType: 'mwak',
      damage: { parts: [['1d6', 'slashing']] },
      proficient: true,
      equipped: false,
      properties: { lgt: true, thr: true },
      range: { value: 20, long: 60 },
      price: { value: 5, denomination: 'gp' },
      weight: 2,
      rarity: 'common',
    },
  },
  {
    _id: 'item_explorerPack_001',
    name: 'Explorer\'s Pack',
    type: 'backpack',
    img: 'systems/dnd5e/icons/items/equipment/backpack.webp',
    system: {
      equipped: true,
      weight: 10,
      price: { value: 10, denomination: 'gp' },
      description: { value: '<p>Includes a backpack, a bedroll, a mess kit, a tinderbox, 10 torches, 10 days of rations, and a waterskin. The pack also has 50 feet of hempen rope strapped to the side of it.</p>' },
    },
  },
];

const lyraItems = [
  {
    _id: 'item_rapier_001',
    name: 'Rapier',
    type: 'weapon',
    img: 'systems/dnd5e/icons/weapons/swords/rapier.webp',
    system: {
      ability: 'dex',
      actionType: 'mwak',
      damage: { parts: [['1d8', 'piercing']] },
      proficient: true,
      equipped: true,
      properties: { fin: true },
      price: { value: 25, denomination: 'gp' },
      weight: 2,
      rarity: 'common',
    },
  },
  {
    _id: 'item_shortbow_001',
    name: 'Shortbow',
    type: 'weapon',
    img: 'systems/dnd5e/icons/weapons/ranged/shortbow.webp',
    system: {
      ability: 'dex',
      actionType: 'rwak',
      damage: { parts: [['1d6', 'piercing']] },
      proficient: true,
      equipped: false,
      properties: { amm: true, two: true },
      range: { value: 80, long: 320 },
      price: { value: 25, denomination: 'gp' },
      weight: 2,
      rarity: 'common',
    },
  },
  {
    _id: 'item_leatherArmor_001',
    name: 'Studded Leather Armor',
    type: 'equipment',
    img: 'systems/dnd5e/icons/items/equipment/studded-leather.webp',
    system: {
      equipped: true,
      armor: { type: 'light', value: 12, dex: null },
      rarity: 'common',
      weight: 13,
      price: { value: 45, denomination: 'gp' },
    },
  },
  {
    _id: 'item_sneakAttack_001',
    name: 'Sneak Attack',
    type: 'feat',
    img: 'systems/dnd5e/icons/skills/green_02.jpg',
    system: {
      description: { value: '<p>Beginning at 1st level, you know how to strike subtly and exploit a foe\'s distraction. Once per turn, you can deal an extra 3d6 damage to one creature you hit with an attack if you have advantage on the attack roll.</p>' },
      damage: { parts: [['3d6', '']] },
      activation: { type: 'special', cost: 0 },
    },
  },
  {
    _id: 'item_cunningAction_001',
    name: 'Cunning Action',
    type: 'feat',
    img: 'systems/dnd5e/icons/skills/green_13.jpg',
    system: {
      description: { value: '<p>Starting at 2nd level, your quickness and agility allow you to move and act quickly. You can take a bonus action on each of your turns in combat to take the Dash, Disengage, or Hide action.</p>' },
      activation: { type: 'bonus', cost: 1 },
    },
  },
  {
    _id: 'item_thievesCant_001',
    name: 'Thieves\' Cant',
    type: 'feat',
    img: 'systems/dnd5e/icons/skills/green_20.jpg',
    system: {
      description: { value: '<p>During your rogue training you learned thieves\' cant, a secret mix of dialect, jargon, and code that allows you to hide messages in seemingly normal conversation.</p>' },
    },
  },
  {
    _id: 'item_thievesTools_001',
    name: 'Thieves\' Tools',
    type: 'tool',
    img: 'systems/dnd5e/icons/items/tools/thieves-tools.webp',
    system: {
      proficient: true,
      ability: 'dex',
      weight: 1,
      price: { value: 25, denomination: 'gp' },
      description: { value: '<p>This set of tools includes a small file, a set of lock picks, a small mirror mounted on a metal handle, a set of narrow-bladed scissors, and a pair of pliers.</p>' },
    },
  },
  {
    _id: 'item_dagger_001',
    name: 'Dagger',
    type: 'weapon',
    img: 'systems/dnd5e/icons/weapons/simple/dagger.webp',
    system: {
      ability: 'str',
      actionType: 'mwak',
      damage: { parts: [['1d4', 'piercing']] },
      proficient: true,
      equipped: false,
      properties: { fin: true, lgt: true, thr: true },
      range: { value: 20, long: 60 },
      price: { value: 2, denomination: 'gp' },
      weight: 1,
      rarity: 'common',
    },
  },
  {
    _id: 'item_burglarPack_001',
    name: 'Burglar\'s Pack',
    type: 'backpack',
    img: 'systems/dnd5e/icons/items/equipment/backpack.webp',
    system: {
      equipped: true,
      weight: 10,
      price: { value: 16, denomination: 'gp' },
      description: { value: '<p>Includes a backpack, a bag of 1,000 ball bearings, 10 feet of string, a bell, 5 candles, a crowbar, a hammer, 10 pitons, a hooded lantern, 2 flasks of oil, 5 days rations, a tinderbox, and a waterskin. The pack also has 50 feet of hempen rope.</p>' },
    },
  },
  {
    _id: 'item_steadyAim_001',
    name: 'Steady Aim',
    type: 'feat',
    img: 'systems/dnd5e/icons/skills/green_08.jpg',
    system: {
      description: { value: '<p>As a bonus action, you give yourself advantage on your next attack roll on the current turn. You can use this bonus action only if you haven\'t moved during this turn, and after you use it, your speed is 0 until the end of the current turn.</p>' },
      activation: { type: 'bonus', cost: 1 },
    },
  },
];

// ============================================================
// Actors
// ============================================================

export const ACTORS: FoundryActor[] = [
  {
    _id: ACTOR_IDS.kaelith,
    name: 'Kaelith Sturmsang',
    type: 'character',
    img: 'icons/svg/mystery-man.svg',
    system: {
      abilities: {
        str: { value: 8, proficient: 0 },
        dex: { value: 14, proficient: 0 },
        con: { value: 13, proficient: 0 },
        int: { value: 18, proficient: 1 },
        wis: { value: 12, proficient: 0 },
        cha: { value: 10, proficient: 0 },
      },
      attributes: {
        hp: { value: 32, max: 38, temp: 0, tempmax: 0 },
        ac: { value: 12, flat: null, calc: 'default' },
        init: { value: 2, bonus: 0 },
        speed: { value: 30, special: '' },
        death: { success: 0, failure: 0 },
        exhaustion: 0,
        prof: 3,
      },
      details: {
        race: 'Human',
        background: 'Sage',
        alignment: 'Neutral Good',
        xp: { value: 6500, max: 14000 },
        level: 5,
        class: 'Wizard',
        appearance: 'A tall, lean human with sharp features, dark hair streaked with silver, and piercing blue eyes. Wears dark traveler\'s robes embroidered with faint arcane sigils.',
        biography: { value: '<p>Kaelith was once a librarian at the Academy of Stars in Waterdeep. When strange dreams of a burning city began haunting her sleep, she left her quiet life to uncover their meaning.</p>' },
      },
      skills: {
        arcana: { value: 4, proficient: true },
        history: { value: 4, proficient: true },
        investigation: { value: 4, proficient: false },
        perception: { value: 1, proficient: false },
        insight: { value: 1, proficient: false },
        religion: { value: 4, proficient: false },
      },
      spells: {
        spell1: { value: 4, max: 4, override: null },
        spell2: { value: 3, max: 3, override: null },
        spell3: { value: 2, max: 2, override: null },
      },
      resources: {
        primary: { value: 1, max: 1, sr: false, lr: true, label: 'Arcane Recovery' },
      },
    },
    items: kaelithItems as unknown as FoundryActor['items'],
    ownership: { default: 0, user_gm_001: 3, user_player_001: 3 },
  },
  {
    _id: ACTOR_IDS.thrain,
    name: 'Thrain Eisenbart',
    type: 'character',
    img: 'icons/svg/mystery-man.svg',
    system: {
      abilities: {
        str: { value: 16, proficient: 1 },
        dex: { value: 12, proficient: 0 },
        con: { value: 16, proficient: 0 },
        int: { value: 10, proficient: 0 },
        wis: { value: 13, proficient: 0 },
        cha: { value: 8, proficient: 0 },
      },
      attributes: {
        hp: { value: 44, max: 52, temp: 0, tempmax: 0 },
        ac: { value: 18, flat: null, calc: 'default' },
        init: { value: 1, bonus: 0 },
        speed: { value: 25, special: '' },
        death: { success: 0, failure: 0 },
        exhaustion: 0,
        prof: 3,
      },
      details: {
        race: 'Hill Dwarf',
        background: 'Soldier',
        alignment: 'Lawful Good',
        xp: { value: 6500, max: 14000 },
        level: 5,
        class: 'Fighter',
        appearance: 'A stout, broad-shouldered dwarf with a thick braided beard of dark auburn hair. His face is weathered from years of campaign life, and his iron-gray eyes hold a steady, unflinching gaze. Bears a prominent scar across his left cheek.',
        biography: { value: '<p>Thrain comes from a long line of warriors who served in the dwarven legions of Citadel Adbar. After his unit was decimated by a dragon attack, he wandered south seeking purpose — and vengeance.</p>' },
      },
      skills: {
        athletics: { value: 6, proficient: true },
        perception: { value: 4, proficient: true },
        intimidation: { value: 2, proficient: true },
        survival: { value: 1, proficient: false },
        insight: { value: 1, proficient: false },
      },
      traits: {
        size: 'medium',
        senses: { darkvision: 60 },
      },
      resources: {
        primary: { value: 1, max: 1, sr: true, lr: true, label: 'Second Wind' },
        secondary: { value: 1, max: 1, sr: true, lr: true, label: 'Action Surge' },
      },
    },
    items: thrainItems as unknown as FoundryActor['items'],
    ownership: { default: 0, user_gm_001: 3, user_player_002: 3 },
  },
  {
    _id: ACTOR_IDS.lyra,
    name: 'Lyra Nachtwind',
    type: 'character',
    img: 'icons/svg/mystery-man.svg',
    system: {
      abilities: {
        str: { value: 10, proficient: 0 },
        dex: { value: 18, proficient: 1 },
        con: { value: 14, proficient: 0 },
        int: { value: 13, proficient: 0 },
        wis: { value: 12, proficient: 0 },
        cha: { value: 16, proficient: 0 },
      },
      attributes: {
        hp: { value: 35, max: 38, temp: 0, tempmax: 0 },
        ac: { value: 15, flat: null, calc: 'default' },
        init: { value: 4, bonus: 0 },
        speed: { value: 35, special: '' },
        death: { success: 0, failure: 0 },
        exhaustion: 0,
        prof: 3,
      },
      details: {
        race: 'Wood Elf',
        background: 'Criminal',
        alignment: 'Chaotic Neutral',
        xp: { value: 6500, max: 14000 },
        level: 5,
        class: 'Rogue',
        appearance: 'A lithe, graceful wood elf with tawny skin and chestnut hair worn in a loose braid. Her green eyes are sharp and watchful. She moves with the silent grace of someone accustomed to shadows.',
        biography: { value: '<p>Lyra grew up on the streets of Baldur\'s Gate, learning to survive by her wits and quick fingers. She joined a thieves\' guild as a teenager, but a botched heist forced her to flee the city. Now she uses her skills for the party — for a fair share of the loot.</p>' },
      },
      skills: {
        acrobatics: { value: 7, proficient: true },
        stealth: { value: 10, proficient: true },
        investigation: { value: 4, proficient: true },
        perception: { value: 4, proficient: true },
        sleightOfHand: { value: 7, proficient: true },
        deception: { value: 3, proficient: false },
        insight: { value: 1, proficient: false },
      },
      traits: {
        size: 'medium',
        senses: { darkvision: 60 },
      },
      resources: {},
    },
    items: lyraItems as unknown as FoundryActor['items'],
    ownership: { default: 0, user_gm_001: 3, user_player_003: 3 },
  },
];

// ============================================================
// Tokens (on active scene: tavern)
// ============================================================

export const TOKENS = [
  {
    _id: TOKEN_IDS.kaelith,
    name: 'Kaelith Sturmsang',
    actorId: ACTOR_IDS.kaelith,
    x: 5,
    y: 7,
    img: 'icons/svg/mystery-man.svg',
    width: 1,
    height: 1,
    hidden: false,
    disposition: 1,
  },
  {
    _id: TOKEN_IDS.thrain,
    name: 'Thrain Eisenbart',
    actorId: ACTOR_IDS.thrain,
    x: 8,
    y: 5,
    img: 'icons/svg/mystery-man.svg',
    width: 1,
    height: 1,
    hidden: false,
    disposition: 1,
  },
  {
    _id: TOKEN_IDS.lyra,
    name: 'Lyra Nachtwind',
    actorId: ACTOR_IDS.lyra,
    x: 3,
    y: 10,
    img: 'icons/svg/mystery-man.svg',
    width: 1,
    height: 1,
    hidden: false,
    disposition: 1,
  },
  {
    _id: TOKEN_IDS.barkeeper,
    name: 'Barkeeper Hilde',
    actorId: '',
    x: 12,
    y: 6,
    img: 'icons/svg/mystery-man.svg',
    width: 1,
    height: 1,
    hidden: false,
    disposition: 0,
  },
];

// ============================================================
// Scenes
// ============================================================

export const SCENES: FoundryScene[] = [
  {
    _id: SCENE_IDS.tavern,
    name: 'Tavern zur Goldenen Krone',
    img: 'scenes/tavern-background.webp',
    active: true,
    width: 20,
    height: 15,
    grid: 100,
    tokens: TOKENS,
  },
  {
    _id: SCENE_IDS.forest,
    name: 'Dunkler Wald des Schreckens',
    img: 'scenes/dark-forest-background.webp',
    active: false,
    width: 30,
    height: 25,
    grid: 100,
    tokens: [],
  },
];

// ============================================================
// Combat
// ============================================================

export const COMBAT: FoundryCombat = {
  _id: 'combat_001',
  active: true,
  round: 2,
  turn: 1,
  combatants: [
    {
      _id: 'combatant_001',
      name: 'Lyra Nachtwind',
      tokenId: TOKEN_IDS.lyra,
      actorId: ACTOR_IDS.lyra,
      initiative: 22,
      hidden: false,
    },
    {
      _id: 'combatant_002',
      name: 'Goblin Archer',
      tokenId: 'tok_goblin_005',
      actorId: 'actor_goblin_004',
      initiative: 17,
      hidden: false,
    },
    {
      _id: 'combatant_003',
      name: 'Kaelith Sturmsang',
      tokenId: TOKEN_IDS.kaelith,
      actorId: ACTOR_IDS.kaelith,
      initiative: 14,
      hidden: false,
    },
    {
      _id: 'combatant_004',
      name: 'Goblin Boss',
      tokenId: TOKEN_IDS.goblinBoss,
      actorId: ACTOR_IDS.goblinBoss,
      initiative: 12,
      hidden: false,
    },
    {
      _id: 'combatant_005',
      name: 'Thrain Eisenbart',
      tokenId: TOKEN_IDS.thrain,
      actorId: ACTOR_IDS.thrain,
      initiative: 9,
      hidden: false,
    },
  ],
};

// ============================================================
// Journals
// ============================================================

export const JOURNALS: FoundryJournal[] = [
  {
    _id: 'journal_quest_001',
    name: 'Quest: Die Verlorene Stadt Aethonias',
    folder: 'folder_quests',
    content: `<h1>Die Verlorene Stadt Aethonias</h1>
<h2>Das Rätsel</h2>
<p>Die legendäre Stadt Aethonias, einst ein Zentrum arcane Macht und Wissen, verschwand vor Jahrhunderten spurlos. Jetzt haben die Abenteurer eine alte Karte gefunden, die den Weg dorthin zeigen soll.</p>
<h2>Hinweise</h2>
<ul>
<li>Ein Fragment einer Sternkarte wurde in der Ruine des Schwarzen Turms gefunden</li>
<li>Der Händler Oldrin behauptet, ein Amulett zu besitzen, das als Schlüssel dient</li>
<li>Die Elfen von Silbermund wissen mehr, als sie preisgeben</li>
</ul>
<h2>Belohnung</h2>
<p>Magister Orvyn hat eine Belohnung von 500 Goldstücken und einen magischen Gegenstand aus seiner Sammlung versprochen.</p>
<h2>Gefahren</h2>
<p>Man sagt, die Stadt werde von Konstrukten bewacht, die seit Jahrhunderten ihre Wache halten. Außerdem haben Goblinkriegsbands das Gebiet nördlich der Stadt besetzt.</p>`,
  },
  {
    _id: 'journal_notes_001',
    name: 'Notizen Session 12',
    folder: 'folder_sessions',
    content: `<h1>Session 12 — Kampf in der Taverne</h1>
<h2>Zusammenfassung</h2>
<p>Die Gruppe kehrte zur <em>Taverne zur Goldenen Krone</em> zurück, um Informationen über die verschwundene Stadt zu sammeln. Dort wurden sie von einer Goblin-Überfallgruppe überrascht.</p>
<h3>Wichtige Ereignisse</h3>
<ol>
<li><strong>Lyra</strong> entdeckte die Goblins, bevor sie angreifen konnten — Vorstellungsbattle gewonnen</li>
<li><strong>Thrain</strong> erlitt 8 Schaden im ersten Kampfrund (jetzt bei 44/52 HP)</li>
<li><strong>Kaelith</strong> wirkt <em>Feuerball</em> auf die Goblins im Eingangsbereich</li>
<li>2 von 5 Goblins wurden besiegt, der Goblinboss ist schwer verletzt</li>
</ol>
<h3>Ausstehend</h3>
<ul>
<li>Befragung des Goblinbosses nach dem Kampf</li>
<li>Informationen über Oldrin und das Amulett</li>
<li>Kaeliths Traum muss noch gedeutet werden</li>
</ul>
<h3>Loot</h3>
<p>Noch kein Loot gesammelt — Goblinboss trägt möglicherweise eine Karte.</p>`,
  },
  {
    _id: 'journal_npc_001',
    name: 'NPC: Magister Orvyn',
    folder: 'folder_npcs',
    content: `<h1>Magister Orvyn</h1>
<h2>Steckbrief</h2>
<table>
<tr><td><strong>Rasse:</strong></td><td>Mensch (älter, ca. 65 Jahre)</td></tr>
<tr><td><strong>Klasse:</strong></td><td>Mage (ehemalig), jetzt Gelehrter</td></tr>
<tr><td><strong>Alignment:</strong></td><td>Lawful Neutral</td></tr>
<tr><td><strong>Standort:</strong></td><td>Seine Bibliothek in der Altstadt</td></tr>
</table>
<h2>Beschreibung</h2>
<p>Ein grauhaariger, gebrechlich wirkender Mann mit scharfen Augen unter buschigen Augenbrauen. Er trägt stets einen smaragdgrünen Umhang und eine geheimnisvolle Brosche in Drachenform.</p>
<h2>Motivation</h2>
<p>Orvyn sucht seit 30 Jahren nach Aethonias. Er glaubt, dass dort ein uraltes Artefakt ruht, das die einzige Chance ist, die bevorstehende Bedrohung aus der Schattenwelt abzuwehren.</p>
<h2>Geheimnisse</h2>
<ul>
<li>Er war selbst einmal Abenteurer — sein alter Name war "Orvyn der Flammenbrecher"</li>
<li>Er weiß, dass die Goblins nicht zufällig hier sind — sie suchen dasselbe Artefakt</li>
<li>Seine Brosche ist tatsächlich der zweite Schlüssel zu Aethonias</li>
</ul>`,
  },
];

// ============================================================
// Compendium Packs
// ============================================================

export const COMPENDIUM_PACKS = [
  {
    id: 'dnd5e.spells',
    label: 'D&D 5e Spells',
    type: 'Item',
    system: 'dnd5e',
  },
  {
    id: 'dnd5e.monsters',
    label: 'D&D 5e Monsters',
    type: 'Actor',
    system: 'dnd5e',
  },
  {
    id: 'dnd5e.items',
    label: 'D&D 5e Items',
    type: 'Item',
    system: 'dnd5e',
  },
];

// ============================================================
// Compendium Search Results
// ============================================================

export const COMPENDIUM_SEARCH_RESULTS: CompendiumResult[] = [
  {
    pack: 'dnd5e.spells',
    packLabel: 'D&D 5e Spells',
    id: 'spell_fireball_001',
    name: 'Fireball',
    type: 'spell',
    img: 'systems/dnd5e/icons/spells/fire-red-2.jpg',
    system: {
      level: 3,
      school: 'evo',
      components: { vocal: true, somatic: true, material: true },
      materials: { value: 'a tiny ball of bat guano and sulfur', consumed: false },
      description: { value: '<p>A bright streak flashes from your pointing finger to a point you choose within range then blossoms with a low roar into an explosion of flame. Each creature in a 20-foot radius sphere must make a Dexterity saving throw. A target takes 8d6 fire damage on a failed save, or half as much damage on a successful one.</p>' },
      activation: { type: 'action', cost: 1 },
      duration: { value: null, units: 'inst' },
      target: { type: 'sphere', value: 20, units: 'ft' },
      range: { value: 150, units: 'ft' },
      damage: { parts: [['8d6', 'fire']] },
      save: { ability: 'dex', dc: null, scaling: 'spell' },
    },
  },
  {
    pack: 'dnd5e.monsters',
    packLabel: 'D&D 5e Monsters',
    id: 'monster_goblin_001',
    name: 'Goblin',
    type: 'npc',
    img: 'systems/dnd5e/icons/monsters/goblin.webp',
    system: {
      abilities: {
        str: { value: 8 },
        dex: { value: 14 },
        con: { value: 10 },
        int: { value: 10 },
        wis: { value: 8 },
        cha: { value: 8 },
      },
      attributes: {
        hp: { value: 7, max: 7 },
        ac: { value: 15 },
        speed: { value: 30 },
      },
      details: { cr: 0.25, type: 'humanoid', xp: 50 },
    },
  },
  {
    pack: 'dnd5e.items',
    packLabel: 'D&D 5e Items',
    id: 'item_longsword_001',
    name: 'Longsword',
    type: 'weapon',
    img: 'systems/dnd5e/icons/weapons/swords/longsword.webp',
    system: {
      ability: 'str',
      actionType: 'mwak',
      damage: { parts: [['1d8', 'slashing']], versatile: '1d10' },
      proficient: true,
      properties: { ver: true },
      price: { value: 15, denomination: 'gp' },
      weight: 3,
      rarity: 'common',
      description: { value: '<p>The longsword is a versatile weapon that can be wielded in one or two hands.</p>' },
    },
  },
  {
    pack: 'dnd5e.spells',
    packLabel: 'D&D 5e Spells',
    id: 'spell_healingWord_001',
    name: 'Healing Word',
    type: 'spell',
    img: 'systems/dnd5e/icons/spells/heal-green-1.jpg',
    system: {
      level: 1,
      school: 'evo',
      components: { vocal: true },
      description: { value: '<p>A creature of your choice that you can see within range regains hit points equal to 1d4 + your spellcasting ability modifier.</p>' },
      activation: { type: 'bonus', cost: 1 },
      target: { type: 'creature', value: 1 },
      range: { value: 60, units: 'ft' },
      damage: { parts: [['1d4', 'healing']] },
    },
  },
  {
    pack: 'dnd5e.monsters',
    packLabel: 'D&D 5e Monsters',
    id: 'monster_skeleton_001',
    name: 'Skeleton',
    type: 'npc',
    img: 'systems/dnd5e/icons/monsters/skeleton.webp',
    system: {
      abilities: {
        str: { value: 10 },
        dex: { value: 14 },
        con: { value: 15 },
        int: { value: 6 },
        wis: { value: 8 },
        cha: { value: 5 },
      },
      attributes: {
        hp: { value: 13, max: 13 },
        ac: { value: 13 },
        speed: { value: 30 },
      },
      details: { cr: 0.25, type: 'undead', xp: 50 },
    },
  },
];

// ============================================================
// World Info
// ============================================================

export const WORLD_INFO: WorldInfo = {
  id: 'world_in_ember_001',
  name: 'World in Ember',
  system: 'dnd5e',
  systemVersion: '5.3',
  foundryVersion: '14.363',
  title: 'World in Ember',
  description: 'A dark fantasy campaign set in a world threatened by an ancient evil awakening beneath the ashes of a fallen civilization.',
  users: [
    { id: 'user_gm_001', name: 'Dungeon Master', role: 4 },
    { id: 'user_player_001', name: 'Sarah', role: 1 },
    { id: 'user_player_002', name: 'Marcus', role: 1 },
    { id: 'user_player_003', name: 'Elena', role: 1 },
  ],
};

// ============================================================
// Module Info (sent on connect)
// ============================================================

export const MODULE_INFO: ModuleInfoMessage = {
  type: 'module-info',
  id: 'module-info-connect',
  data: {
    worldId: WORLD_INFO.id,
    worldName: WORLD_INFO.name,
    systemId: 'dnd5e',
    systemVersion: '5.3',
    foundryVersion: '14.363',
    userId: 'user_gm_001',
    userName: 'Dungeon Master',
    connectedAt: new Date().toISOString(),
  },
};

// ============================================================
// Macros
// ============================================================

export const MACROS: FoundryMacro[] = [
  {
    _id: 'macro_initiative_001',
    name: 'Show Initiative',
    type: 'script',
    command: `// Display initiative order for the current combat
const combat = game.combat;
if (!combat) return ui.notifications.warn("No active combat");
const html = combat.combatants.map(c => \`\${c.name}: \${c.initiative}\`).join('<br>');
new Dialog({ title: "Initiative Order", content: html, buttons: { ok: { label: "Close" } } }).render(true);`,
    author: 'user_gm_001',
  },
  {
    _id: 'macro_healAll_001',
    name: 'Heal All',
    type: 'script',
    command: `// Heal all player characters to full HP
for (const actor of game.actors.filter(a => a.type === 'character')) {
  const hp = actor.system.attributes.hp;
  await actor.update({ 'system.attributes.hp.value': hp.max });
  ui.notifications.info(\`\${actor.name} healed to \${hp.max} HP\`);
}`,
    author: 'user_gm_001',
  },
  {
    _id: 'macro_weather_001',
    name: 'Weather Check',
    type: 'script',
    command: `// Roll for random weather
const weathers = ['Clear skies', 'Overcast', 'Light rain', 'Heavy rain', 'Thunderstorm', 'Fog', 'Snow', 'Strong wind'];
const roll = Math.floor(Math.random() * weathers.length);
ChatMessage.create({ content: \`🌤 Weather: \${weathers[roll]}\`, speaker: { alias: "Weather" } });`,
    author: 'user_gm_001',
  },
];

// ============================================================
// Active Effects (for Kaelith)
// ============================================================

export const EFFECTS: FoundryActiveEffect[] = [
  {
    _id: 'effect_mageArmor_001',
    name: 'Mage Armor',
    icon: 'systems/dnd5e/icons/spells/protect-blue-3.jpg',
    disabled: false,
    duration: { startTime: null, seconds: 28800, rounds: null, turns: null, startRound: null, startTurn: null },
    changes: [
      { key: 'system.attributes.ac.value', mode: 2, value: '+3' },
    ],
  },
  {
    _id: 'effect_bless_001',
    name: 'Bless',
    icon: 'systems/dnd5e/icons/spells/haste-blue-2.jpg',
    disabled: false,
    duration: { startTime: null, seconds: 60, rounds: 10, turns: null, startRound: 1, startTurn: null },
    changes: [
      { key: 'system.bonuses.mwak.attack', mode: 2, value: '1d4' },
      { key: 'system.bonuses.rwak.attack', mode: 2, value: '1d4' },
      { key: 'system.bonuses.msak.attack', mode: 2, value: '1d4' },
      { key: 'system.bonuses.abilities.save', mode: 2, value: '1d4' },
    ],
  },
];

// ============================================================
// Folders
// ============================================================

export const FOLDERS: FoundryFolder[] = [
  {
    _id: 'folder_pcs_001',
    name: 'PCs',
    type: 'Actor',
    parent: null,
    children: [ACTOR_IDS.kaelith, ACTOR_IDS.thrain, ACTOR_IDS.lyra],
  },
  {
    _id: 'folder_npcs_002',
    name: 'NPCs',
    type: 'Actor',
    parent: null,
    children: [],
  },
  {
    _id: 'folder_monsters_003',
    name: 'Monsters',
    type: 'Actor',
    parent: null,
    children: [ACTOR_IDS.goblinBoss],
  },
  {
    _id: 'folder_notes_004',
    name: 'Campaign Notes',
    type: 'JournalEntry',
    parent: null,
    children: ['journal_quest_001', 'journal_notes_001', 'journal_npc_001'],
  },
];

// ============================================================
// Roll Tables
// ============================================================

export const ROLL_TABLES: FoundryRollTable[] = [
  {
    _id: 'table_encounters_001',
    name: 'Random Encounters',
    description: 'Random wilderness encounters for the World in Ember campaign.',
    results: [
      { _id: 'result_001', text: 'A lone merchant with a broken wagon wheel, desperate for help.', type: 0, range: [1, 10] },
      { _id: 'result_002', text: 'A pack of wolves stalking the party from the treeline.', type: 0, range: [11, 25] },
      { _id: 'result_003', text: 'An ancient stone shrine overgrown with moss, humming faintly with magic.', type: 0, range: [26, 40] },
      { _id: 'result_004', text: 'A group of goblin scouts — roll perception to spot them first.', type: 0, range: [41, 60] },
      { _id: 'result_005', text: 'A mysterious fog rolls in, obscuring vision beyond 30 feet.', type: 0, range: [61, 80] },
      { _id: 'result_006', text: 'The ground trembles — remnants of the ancient evil stirring below.', type: 0, range: [81, 100] },
    ],
  },
];

// ============================================================
// Scene Notes (Journal entries attached to scenes)
// ============================================================

export const SCENE_NOTES: FoundryJournal[] = [
  {
    _id: 'journal_tavernDesc_001',
    name: 'Tavern Description',
    content: `<h1>Tavern zur Goldenen Krone</h1>
<p>A warm, inviting tavern with low oak beams and the smell of roasted meat. The barkeeper, Hilde, is a stout woman with a booming laugh. Regulars include a few off-duty guards and traveling merchants.</p>
<h2>Notable Details</h2>
<ul>
<li>A notice board near the entrance has various quest postings</li>
<li>A mysterious hooded figure sits in the far corner — Magister Orvyn's agent</li>
<li>The floorboards near the hearth are loose — a small cache is hidden beneath</li>
</ul>`,
  },
  {
    _id: 'journal_sceneNPCs_001',
    name: 'Important NPCs',
    content: `<h1>Tavern NPCs</h1>
<h2>Barkeeper Hilde</h2>
<p>A gregarious woman who hears everything. Can be bribed for information (5gp).</p>
<h2>Mysterious Hooded Figure</h2>
<p>Actually Korrin, one of Orvyn's agents. Will approach the party if they seem trustworthy.</p>
<h2>Off-duty Guard (Erik)</h2>
<p>Knows about the goblin raids in the area. Worried about the forest road.`,
  },
];

// ============================================================
// Dice roll mock result
// ============================================================

export function mockDiceRoll(formula: string, flavor?: string): string {
  // Parse simple formulas and return plausible results
  const result: Record<string, unknown> = {
    formula,
    flavor: flavor || '',
    total: 0,
    terms: [],
  };

  // Simple mock: d20-based rolls
  if (formula.includes('d20')) {
    const roll = Math.floor(Math.random() * 20) + 1;
    result.total = roll;
    result.terms = [{ class: 'Die', faces: 20, number: 1, results: [{ result: roll }] }];
  } else if (formula.includes('d6')) {
    const count = parseInt(formula.split('d')[0]) || 1;
    const rolls: number[] = [];
    let total = 0;
    for (let i = 0; i < count; i++) {
      const r = Math.floor(Math.random() * 6) + 1;
      rolls.push(r);
      total += r;
    }
    result.total = total;
    result.terms = [{ class: 'Die', faces: 6, number: count, results: rolls.map(r => ({ result: r })) }];
  } else if (formula.includes('d8')) {
    const roll = Math.floor(Math.random() * 8) + 1;
    result.total = roll;
    result.terms = [{ class: 'Die', faces: 8, number: 1, results: [{ result: roll }] }];
  } else {
    result.total = Math.floor(Math.random() * 20) + 1;
  }

  return JSON.stringify(result, null, 2);
}
