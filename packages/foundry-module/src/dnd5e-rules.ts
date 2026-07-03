/**
 * D&D 2024 PHB rules data for validate-character tool.
 * Source: Player's Handbook (2024 edition)
 */

// ─── Class Save Proficiencies ───────────────────────────────────────

export const CLASS_SAVE_PROFICIENCIES: Record<string, string[]> = {
  barbarian: ['str', 'con'],
  bard: ['dex', 'cha'],
  cleric: ['wis', 'cha'],
  druid: ['int', 'wis'],
  fighter: ['str', 'con'],
  monk: ['str', 'dex'],
  paladin: ['wis', 'cha'],
  ranger: ['str', 'dex'],
  rogue: ['dex', 'int'],
  sorcerer: ['con', 'cha'],
  warlock: ['wis', 'cha'],
  wizard: ['int', 'wis'],
};

// ─── Armor Proficiencies ────────────────────────────────────────────

export type ArmorType = "light" | "medium" | "heavy" | "shield";

export const CLASS_ARMOR_PROFICIENCIES: Record<string, ArmorType[]> = {
  barbarian: ["light", "medium", "shield"],
  bard: ["light"],
  cleric: ["light", "medium", "shield"],
  druid: ["light", "medium", "shield"],
  fighter: ["light", "medium", "heavy", "shield"],
  monk: [],
  paladin: ["light", "medium", "heavy", "shield"],
  ranger: ["light", "medium", "shield"],
  rogue: ["light"],
  sorcerer: [],
  warlock: ["light"],
  wizard: [],
};

// ─── Weapon Proficiencies ───────────────────────────────────────────

export const CLASS_WEAPON_PROFICIENCIES: Record<string, string[]> = {
  barbarian: ["simple", "martial"],
  bard: ["simple", "handCrossbow", "longsword", "rapier", "shortsword"],
  cleric: ["simple"],
  druid: ["simple", "club", "dagger", "dart", "javelin", "mace", "quarterstaff", "scimitar", "sickle", "sling", "spear"],
  fighter: ["simple", "martial"],
  monk: ["simple", "shortsword"],
  paladin: ["simple", "martial"],
  ranger: ["simple", "martial"],
  rogue: ["simple", "handCrossbow", "longsword", "rapier", "shortsword"],
  sorcerer: ["simple"],
  warlock: ["simple"],
  wizard: ["simple"],
};

// ─── Spellcaster Type ───────────────────────────────────────────────

export type SpellcasterType = "full" | "half" | "third" | "pact" | "none";

export const CLASS_SPELLCASTER_TYPE: Record<string, SpellcasterType> = {
  barbarian: "none",
  bard: "full",
  cleric: "full",
  druid: "full",
  fighter: "third",
  monk: "none",
  paladin: "half",
  ranger: "half",
  rogue: "third",
  sorcerer: "full",
  warlock: "pact",
  wizard: "full",
};

// ─── Spell Slots Tables (per level 1-20) ────────────────────────────

interface SpellSlotEntry {
  slots: Record<number, number>;
}

function buildFullCasterSlots(): SpellSlotEntry[] {
  const table: Record<number, Record<number, number>> = {
    1:  { 1: 2 },
    2:  { 1: 3 },
    3:  { 1: 4, 2: 2 },
    4:  { 1: 4, 2: 3 },
    5:  { 1: 4, 2: 3, 3: 2 },
    6:  { 1: 4, 2: 3, 3: 3 },
    7:  { 1: 4, 2: 3, 3: 3, 4: 1 },
    8:  { 1: 4, 2: 3, 3: 3, 4: 2 },
    9:  { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
    10: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
    11: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
    12: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
    13: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
    14: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
    15: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
    16: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
    17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
    18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1, 9: 1 },
    19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1 },
    20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 2 },
  };
  return Array.from({ length: 20 }, (_, i) => ({ slots: table[i + 1] || {} }));
}

function buildHalfCasterSlots(): SpellSlotEntry[] {
  const table: Record<number, Record<number, number>> = {
    1:  {},
    2:  { 1: 2 },
    3:  { 1: 3 },
    4:  { 1: 3 },
    5:  { 1: 4, 2: 2 },
    6:  { 1: 4, 2: 2 },
    7:  { 1: 4, 2: 3 },
    8:  { 1: 4, 2: 3 },
    9:  { 1: 4, 2: 3, 3: 2 },
    10: { 1: 4, 2: 3, 3: 2 },
    11: { 1: 4, 2: 3, 3: 3 },
    12: { 1: 4, 2: 3, 3: 3 },
    13: { 1: 4, 2: 3, 3: 3, 4: 1 },
    14: { 1: 4, 2: 3, 3: 3, 4: 1 },
    15: { 1: 4, 2: 3, 3: 3, 4: 2 },
    16: { 1: 4, 2: 3, 3: 3, 4: 2 },
    17: { 1: 4, 2: 3, 3: 3, 4: 2, 5: 1 },
    18: { 1: 4, 2: 3, 3: 3, 4: 2, 5: 1 },
    19: { 1: 4, 2: 3, 3: 3, 4: 2, 5: 2 },
    20: { 1: 4, 2: 3, 3: 3, 4: 2, 5: 2 },
  };
  return Array.from({ length: 20 }, (_, i) => ({ slots: table[i + 1] || {} }));
}

function buildThirdCasterSlots(): SpellSlotEntry[] {
  const table: Record<number, Record<number, number>> = {
    1:  {},
    2:  {},
    3:  { 1: 2 },
    4:  { 1: 3 },
    5:  { 1: 3 },
    6:  { 1: 3, 2: 2 },
    7:  { 1: 3, 2: 2 },
    8:  { 1: 3, 2: 3 },
    9:  { 1: 3, 2: 3 },
    10: { 1: 3, 2: 3, 3: 2 },
    11: { 1: 3, 2: 3, 3: 2 },
    12: { 1: 3, 2: 3, 3: 3 },
    13: { 1: 3, 2: 3, 3: 3 },
    14: { 1: 3, 2: 3, 3: 3, 4: 1 },
    15: { 1: 3, 2: 3, 3: 3, 4: 1 },
    16: { 1: 3, 2: 3, 3: 3, 4: 2 },
    17: { 1: 3, 2: 3, 3: 3, 4: 2 },
    18: { 1: 3, 2: 3, 3: 3, 4: 2, 5: 1 },
    19: { 1: 3, 2: 3, 3: 3, 4: 2, 5: 1 },
    20: { 1: 3, 2: 3, 3: 3, 4: 2, 5: 1, 6: 1 },
  };
  return Array.from({ length: 20 }, (_, i) => ({ slots: table[i + 1] || {} }));
}

export const FULL_CASTER_SLOTS = buildFullCasterSlots();
export const HALF_CASTER_SLOTS = buildHalfCasterSlots();
export const THIRD_CASTER_SLOTS = buildThirdCasterSlots();

// Warlock Pact Magic: fewer slots, all same level, short rest recovery
export function getWarlockSlots(level: number): Record<number, number> {
  if (level < 1) return {};
  const maxSlotLevel = level <= 2 ? 1 : level <= 10 ? Math.ceil(level / 2) : 5;
  const count = level <= 2 ? level : level <= 10 ? Math.ceil(level / 2) : 2;
  return { [maxSlotLevel]: Math.min(count, 2) };
}

// ─── Hit Dice by Class ──────────────────────────────────────────────

export const CLASS_HIT_DICE: Record<string, number> = {
  barbarian: 12,
  bard: 8,
  cleric: 8,
  druid: 8,
  fighter: 10,
  monk: 8,
  paladin: 10,
  ranger: 10,
  rogue: 8,
  sorcerer: 6,
  warlock: 8,
  wizard: 6,
};

// ─── Proficiency Bonus by Level ─────────────────────────────────────

export function getProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

// ─── Cantrips Known by Class and Level ──────────────────────────────

export const CLASS_CANTRIPS_KNOWN: Record<string, number[]> = {
  bard:     [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  cleric:   [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
  druid:    [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  sorcerer: [4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
  warlock:  [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  wizard:   [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
};

// ─── Spell Lists by Class (D&D 2024 PHB) ───────────────────────────

const B = "bard";
const C = "cleric";
const D = "druid";
const Pa = "paladin";
const Ra = "ranger";
const S = "sorcerer";
const W = "warlock";
const Wi = "wizard";

/** Map of lowercase spell name to array of class keys */
export const SPELL_CLASS_MAP: Record<string, string[]> = (() => {
  const map: Record<string, string[]> = {};

  function add(spellName: string, ...classes: string[]) {
    map[spellName.toLowerCase()] = classes;
  }

  // ── Cantrips (Level 0) ────────────────────────────────────────
  add("acid splash", D, S, Wi);
  add("booming blade", S, W, Wi);
  add("chill touch", S, W, Wi);
  add("create bonfire", D, S, W);
  add("dancing lights", B, S, Wi);
  add("druidcraft", D);
  add("eldritch blast", W);
  add("fire bolt", S, Wi);
  add("friends", B, S, W);
  add("frostbite", D, S, W);
  add("green-flame blade", S, W, Wi);
  add("guidance", C, D);
  add("gust", D, S);
  add("infestation", D, S, W);
  add("light", B, C, D, S, Wi);
  add("lightning lure", S, W, Wi);
  add("mage hand", B, S, W, Wi);
  add("mending", B, C, D, W, Wi);
  add("message", B, S, Wi);
  add("mind sliver", S, W, Wi);
  add("minor illusion", B, S, W, Wi);
  add("poison spray", D, S, W);
  add("prestidigitation", B, S, W, Wi);
  add("ray of frost", S, Wi);
  add("resistance", C, D);
  add("sacred flame", C);
  add("shape water", D, S);
  add("shillelagh", D);
  add("shocking grasp", S, Wi);
  add("sword burst", S, W, Wi);
  add("thorn whip", D);
  add("thunderclap", D, S, W);
  add("toll the dead", C, S, W);
  add("true strike", B, S, W, Wi);
  add("vicious mockery", B);

  // ── Level 1 Spells ────────────────────────────────────────────
  add("absorb elements", D, Ra, S);
  add("alarm", Ra, Wi);
  add("animal friendship", B, D, Ra);
  add("bane", B, C);
  add("bless", C, Pa);
  add("burning hands", S, Wi);
  add("catapult", S, Wi);
  add("cause fear", S, W);
  add("charm person", B, D, S, W, Wi);
  add("chromatic orb", S, Wi);
  add("color spray", S, Wi);
  add("command", C, Pa);
  add("comprehend languages", B, S, W, Wi);
  add("create or destroy water", C, D);
  add("cure wounds", B, C, D, Pa, Ra);
  add("detect magic", B, C, D, Pa, Ra, S, Wi);
  add("disguise self", B, S, W, Wi);
  add("dissonant whispers", B);
  add("divine favor", Pa);
  add("entangle", D);
  add("expeditious retreat", S, W);
  add("faerie fire", B, D);
  add("false life", S, Wi);
  add("feather fall", B, S, Wi);
  add("find familiar", W, Wi);
  add("fog cloud", D, Ra, S);
  add("goodberry", D, Ra);
  add("grease", Wi);
  add("guiding bolt", C);
  add("healing word", B, C, D);
  add("hellish rebuke", W);
  add("hex", W);
  add("hunters mark", Ra);
  add("ice knife", D, S);
  add("identify", B, W, Wi);
  add("inflict wounds", C);
  add("jump", D, S, Wi);
  add("longstrider", B, Ra, Wi);
  add("mage armor", S, Wi);
  add("magic missile", S, Wi);
  add("protection from evil and good", C, W);
  add("sanctuary", C);
  add("shield", S, Wi);
  add("shield of faith", C, Pa);
  add("silent image", B, S, W, Wi);
  add("silvery barbs", B);
  add("sleep", B, S, Wi);
  add("snare", D, Ra);
  add("speak with animals", B, D, Pa, Ra);
  add("tashas hideous laughter", B, W, Wi);
  add("thunderwave", B, D, S);
  add("unseen servant", B, W, Wi);

  // ── Level 2 Spells ────────────────────────────────────────────
  add("aid", C, Pa);
  add("alter self", S, Wi);
  add("augury", C, D);
  add("barkskin", D);
  add("blinding smite", Pa);
  add("blindness/deafness", C, S);
  add("blur", S, Wi);
  add("calm emotions", B, C);
  add("cloud of daggers", S, W, Wi);
  add("continual flame", C, Wi);
  add("crown of madness", S, W);
  add("darkness", S, W);
  add("darkvision", D, Ra, S, W, Wi);
  add("detect thoughts", S, W, Wi);
  add("enhance ability", B, C, D, S);
  add("enthrall", B, W);
  add("find steed", Pa);
  add("flame blade", D, S);
  add("flaming sphere", D, S);
  add("gust of wind", D, S);
  add("heat metal", C, D, Ra);
  add("hold person", B, C, D, S, Wi);
  add("invisibility", B, S, W, Wi);
  add("knock", S, Wi);
  add("lesser restoration", B, C, D, Pa, Ra);
  add("levitate", S, Wi);
  add("magic mouth", B, Wi);
  add("magic weapon", Pa, Wi);
  add("mirror image", S, W, Wi);
  add("misty step", S, W, Wi);
  add("moonbeam", D);
  add("pass without trace", D, Ra);
  add("prayer of healing", C);
  add("protection from poison", C, D, Pa);
  add("ray of enfeeblement", W, Wi);
  add("rope trick", W, Wi);
  add("scorching ray", S, W, Wi);
  add("see invisibility", B, S, Wi);
  add("shatter", B, S, W);
  add("silence", C, D);
  add("spiritual weapon", C);
  add("spike growth", D, Ra);
  add("suggestion", B, S, W, Wi);
  add("warding bond", C, Pa);
  add("web", S, Wi);

  // ── Level 3 Spells ────────────────────────────────────────────
  add("blink", S, Wi);
  add("call lightning", D);
  add("clairvoyance", B, C, S, W, Wi);
  add("counterspell", S, W, Wi);
  add("create food and water", C, Pa);
  add("daylight", C, D, Pa);
  add("dispel magic", B, C, D, Pa, S, W, Wi);
  add("elemental weapon", Pa);
  add("fireball", S, Wi);
  add("flame arrows", D, Ra);
  add("fly", S, W, Wi);
  add("gaseous form", S, W);
  add("glyph of warding", C, W);
  add("haste", Ra, S, Wi);
  add("hypnotic pattern", B, S, W);
  add("intellect fortress", B, S, Wi);
  add("leomunds tiny hut", B, Wi);
  add("lightning bolt", S, Wi);
  add("magic circle", C, Pa, S, W);
  add("mass healing word", C);
  add("nondetection", B, W, Wi);
  add("phantom steed", Wi);
  add("protection from energy", C, D, Ra);
  add("remove curse", C, Pa, W);
  add("revivify", C, Pa);
  add("sending", B, C, W);
  add("sleet storm", D, Wi);
  add("slow", S, Wi);
  add("spirit guardians", C);
  add("stinking cloud", B, S, W);
  add("summon fey", S, W);
  add("summon lesser demons", S, W);
  add("summon shadowspawn", S, W);
  add("thunder step", S, W);
  add("tongues", B, C, S, W);
  add("vampiric touch", S, W);
  add("water breathing", D, Ra, S, W);
  add("wind wall", C, D, Ra);

  // ── Level 4 Spells ────────────────────────────────────────────
  add("banishment", C, Pa, S, W);
  add("blight", S, W, Wi);
  add("compulsion", B, Wi);
  add("confusion", B, D, S, Wi);
  add("conjure minor elementals", D);
  add("control water", D, Wi);
  add("death ward", C, Pa);
  add("dimension door", B, S, W, Wi);
  add("divination", C, D);
  add("elemental bane", D, S, W);
  add("fabricate", Wi);
  add("fire shield", S, Wi);
  add("freedom of movement", B, C, D, Ra);
  add("giant insect", D);
  add("hallucinatory terrain", B, D, S, W, Wi);
  add("ice storm", D, S, Wi);
  add("leomunds secret chest", Wi);
  add("locate creature", B, C, D, Pa, Ra);
  add("mordenkainens faithful hound", Wi);
  add("mordenkainens private sanctum", Wi);
  add("otilukes resilient sphere", S, Wi);
  add("phantasmal killer", W, Wi);
  add("polymorph", B, S, W, Wi);
  add("staggering smite", Pa);
  add("stoneskin", C, D, Pa, Wi);
  add("wall of fire", D, S, Wi);
  add("watery sphere", D, S);

  // ── Level 5 Spells ────────────────────────────────────────────
  add("animate objects", B, Wi);
  add("awaken", D);
  add("banishing smite", Pa);
  add("circle of power", S);
  add("cloudkill", S, Wi);
  add("commune", C);
  add("commune with nature", D, Ra);
  add("cone of cold", S, Wi);
  add("contagion", C, S);
  add("creation", S, Wi);
  add("dispel evil and good", C, Pa);
  add("flame strike", C);
  add("geas", B, C, D, Pa, S, Wi);
  add("greater restoration", B, C, D);
  add("hold monster", B, S, W, Wi);
  add("insect plague", C, D);
  add("legend lore", B, C, Wi);
  add("mass cure wounds", B, C, D);
  add("mislead", B, Wi);
  add("modify memory", B, W);
  add("passwall", Wi);
  add("planar binding", B, C, W);
  add("raise dead", C, Pa, S, W, Wi);
  add("rarys telepathic bond", W, Wi);
  add("scrying", B, C, D, S, W, Wi);
  add("seeming", B, S, Wi);
  add("synaptic static", S, W, Wi);
  add("telekinesis", S, Wi);
  add("teleportation circle", B, S, Wi);
  add("wall of force", Wi);
  add("wall of stone", D, S, Wi);
  add("wall of thorns", D);
  add("wrathful smite", Pa);

  // ── Level 6 Spells ────────────────────────────────────────────
  add("arcane gate", S, W);
  add("blade barrier", C);
  add("chain lightning", S, Wi);
  add("circle of death", S, W);
  add("conjure fey", D, W);
  add("disintegrate", S, Wi);
  add("eyebite", S, W);
  add("find the path", B, C, D);
  add("flesh to stone", S, Wi);
  add("globe of invulnerability", S, Wi);
  add("guards and wards", B, Wi);
  add("harm", C);
  add("heal", C);
  add("heroes feast", B, C, D);
  add("instant summons", Wi);
  add("irresistible dance", B, Wi);
  add("mass suggestion", B, S, W);
  add("move earth", D, S, Wi);
  add("planar ally", C);
  add("sunbeam", C, D, S);
  add("true seeing", B, C, S, W, Wi);
  add("wall of ice", D, W, Wi);
  add("word of recall", C);

  // ── Level 7 Spells ────────────────────────────────────────────
  add("conjure elemental", D);
  add("delayed blast fireball", S, Wi);
  add("etherealness", B, C, S, W, Wi);
  add("finger of death", S, W);
  add("fire storm", C, D, S);
  add("forcecage", B, W);
  add("magnificent mansion", B, Wi);
  add("mirage arcana", B, D, S, W, Wi);
  add("plane shift", C, D, S, W);
  add("prismatic spray", S, Wi);
  add("regenerate", B, C, D);
  add("resurrection", C, Pa);
  add("sequester", Wi);
  add("simulacrum", W, Wi);
  add("symbol", B, C, W, Wi);
  add("teleport", B, S, W, Wi);

  // ── Level 8 Spells ────────────────────────────────────────────
  add("abidalsims horrid wilting", S, Wi);
  add("animal shapes", D);
  add("antimagic field", C, W, Wi);
  add("antipathy/sympathy", D, W, Wi);
  add("clone", Wi);
  add("demand", W);
  add("dominate monster", S, W, Wi);
  add("earthquake", C, D, S);
  add("feeblemind", D, S, W, Wi);
  add("glibness", B);
  add("holy aura", C);
  add("maze", Wi);
  add("mind blank", B, Wi);
  add("power word stun", S, W, Wi);
  add("sunburst", C, D, S, Wi);

  // ── Level 9 Spells ────────────────────────────────────────────
  add("foresight", B, D, W, Wi);
  add("gate", C, S, Wi);
  add("imprisonment", W, Wi);
  add("power word heal", B, C);
  add("power word kill", S, W, Wi);
  add("storm of vengeance", D);
  add("time stop", S, Wi);
  add("true polymorph", B, S, W, Wi);
  add("true resurrection", C);
  add("weird", W, Wi);
  add("wish", S, Wi);

  return map;
})();

// ─── Cantrip Count Validation ───────────────────────────────────────

export function getExpectedCantrips(className: string, level: number): number {
  const key = className.toLowerCase();
  const arr = CLASS_CANTRIPS_KNOWN[key];
  if (!arr) return 0;
  return arr[level - 1] ?? 0;
}

// ─── Spell Slots for Class/Level ────────────────────────────────────

export function getExpectedSpellSlots(className: string, level: number): Record<number, number> {
  const key = className.toLowerCase();
  const type = CLASS_SPELLCASTER_TYPE[key];

  switch (type) {
    case "full":
      return FULL_CASTER_SLOTS[level - 1]?.slots ?? {};
    case "half":
      return HALF_CASTER_SLOTS[level - 1]?.slots ?? {};
    case "third":
      return THIRD_CASTER_SLOTS[level - 1]?.slots ?? {};
    case "pact":
      return getWarlockSlots(level);
    default:
      return {};
  }
}
