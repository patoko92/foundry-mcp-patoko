/**
 * validate-character handler — automated D&D 2024 rules validation.
 * Performs tiered checks on a character actor and returns structured issues/warnings.
 */

import {
  CLASS_SAVE_PROFICIENCIES,
  CLASS_ARMOR_PROFICIENCIES,
  CLASS_WEAPON_PROFICIENCIES,
  CLASS_SPELLCASTER_TYPE,
  CLASS_HIT_DICE,
  SPELL_CLASS_MAP,
  getProficiencyBonus,
  getExpectedSpellSlots,
  getExpectedCantrips,
} from "./dnd5e-rules.js";

interface ValidationIssue {
  severity: "error" | "warning";
  category: string;
  message: string;
  detail?: string;
}

interface ValidationResult {
  characterId: string;
  name: string;
  className: string | null;
  level: number;
  issues: ValidationIssue[];
  checksPassed: number;
}

// ─── Helper: get class name from class item ────────────────────────

function getClassName(actor: any): string | null {
  const classItem = actor.items?.find((i: any) => i.type === "class");
  return classItem?.name?.toLowerCase() ?? null;
}

function getLevel(actor: any): number {
  const sys = actor.system ?? {};
  const classItem = actor.items?.find((i: any) => i.type === "class");
  return sys.details?.level ?? classItem?.system?.levels ?? 1;
}

// ─── Tier 1: Pure Math Checks ─────────────────────────────────────

function checkSaveProficiencies(
  actor: any,
  className: string
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const expected = CLASS_SAVE_PROFICIENCIES[className];
  if (!expected) return issues;

  const abilities = actor.system?.abilities ?? {};
  const abilityNames = ["str", "dex", "con", "int", "wis", "cha"];

  // Check each save
  for (const ab of abilityNames) {
    const proficient = abilities[ab]?.proficient ?? 0;
    const isExpected = expected.includes(ab);
    const isProf = proficient > 0;

    if (isExpected && !isProf) {
      issues.push({
        severity: "error",
        category: "saves",
        message: `${ab.toUpperCase()} should be a save proficiency for ${className}`,
        detail: `${className} is proficient in ${expected.map((s: string) => s.toUpperCase()).join(" and ")} saves.`,
      });
    } else if (!isExpected && isProf) {
      issues.push({
        severity: "warning",
        category: "saves",
        message: `${ab.toUpperCase()} is marked as a save proficiency but is not a ${className} save`,
        detail: `Class saves are: ${expected.map((s: string) => s.toUpperCase()).join(" and ")}.`,
      });
    }
  }

  return issues;
}

function checkSpellSlots(
  actor: any,
  className: string,
  level: number
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const casterType = CLASS_SPELLCASTER_TYPE[className];
  if (casterType === "none") return issues;

  const expected = getExpectedSpellSlots(className, level);
  const actual = actor.system?.spells ?? {};

  // Check each expected slot level
  for (const [slotLevel, expectedCount] of Object.entries(expected)) {
    const key = `spell${slotLevel}`;
    const actualMax = actual[key]?.max ?? 0;

    if (actualMax !== expectedCount) {
      issues.push({
        severity: "error",
        category: "spell-slots",
        message: `Level ${slotLevel} spell slots: expected ${expectedCount}, found ${actualMax}`,
        detail: `${className} level ${level} should have ${expectedCount} level-${slotLevel} slot(s).`,
      });
    }
  }

  // Check for spell slots that shouldn't exist
  for (const [key, slotData] of Object.entries(actual) as any[]) {
    const match = key.match(/^spell(\d+)$/);
    if (match) {
      const slotLevel = parseInt(match[1]);
      const expectedCount = expected[slotLevel] ?? 0;
      if (slotData.max > 0 && expectedCount === 0) {
        issues.push({
          severity: "warning",
          category: "spell-slots",
          message: `Level ${slotLevel} spell slots exist (${slotData.max}) but shouldn't for ${className} level ${level}`,
        });
      }
    }
  }

  return issues;
}

function checkHP(
  actor: any,
  className: string,
  level: number
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const hp = actor.system?.attributes?.hp;
  if (!hp) return issues;

  const hd = CLASS_HIT_DICE[className];
  if (!hd) return issues;

  const conMod = Math.floor(((actor.system?.abilities?.con?.value ?? 10) - 10) / 2);

  // Level 1 HP: max HD + CON mod
  if (level === 1) {
    const expectedHP = hd + conMod;
    if (hp.max !== expectedHP) {
      issues.push({
        severity: "warning",
        category: "hp",
        message: `HP max is ${hp.max}, expected ${expectedHP} at level 1 (${hd} HD + ${conMod} CON)`,
        detail: "Level 1 max HP = hit dice maximum + Constitution modifier.",
      });
    }
  }

  return issues;
}

function checkProficiencyBonus(
  actor: any,
  level: number
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const prof = actor.system?.attributes?.prof;
  if (prof === undefined || prof === null) return issues;

  const expected = getProficiencyBonus(level);
  if (prof !== expected) {
    issues.push({
      severity: "error",
      category: "proficiency",
      message: `Proficiency bonus is ${prof}, expected ${expected} for level ${level}`,
      detail: "Proficiency bonus = floor(level/4) + 2.",
    });
  }

  return issues;
}

function checkPointBuy(actor: any): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const abilities = actor.system?.abilities ?? {};
  const abilityNames = ["str", "dex", "con", "int", "wis", "cha"];

  // Point buy cost: 8=0, 9=1, 10=2, 11=3, 12=4, 13=5, 14=7, 15=9
  const costTable: Record<number, number> = {
    8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
  };

  let totalCost = 0;
  let hasCustomScores = false;

  for (const ab of abilityNames) {
    const val = abilities[ab]?.value ?? 10;
    if (val < 1 || val > 30) {
      issues.push({
        severity: "error",
        category: "abilities",
        message: `${ab.toUpperCase()} score is ${val}, must be between 1 and 30`,
      });
      continue;
    }
    const cost = costTable[val];
    if (cost !== undefined) {
      totalCost += cost;
    } else {
      hasCustomScores = true;
    }
  }

  if (!hasCustomScores && totalCost > 27) {
    issues.push({
      severity: "error",
      category: "abilities",
      message: `Point buy total is ${totalCost}, exceeds 27-point limit`,
      detail: `Total cost: ${abilityNames.map((ab) => `${ab.toUpperCase()}=${abilities[ab]?.value ?? 10}`).join(", ")}`,
    });
  }

  return issues;
}

// ─── Tier 2: Spell List Checks ────────────────────────────────────

function checkSpellsOnClassList(
  actor: any,
  className: string
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const spells = actor.items?.filter((i: any) => i.type === "spell") ?? [];

  for (const spell of spells) {
    const spellName = spell.name?.toLowerCase();
    if (!spellName) continue;

    const classList = SPELL_CLASS_MAP[spellName];
    if (classList && !classList.includes(className)) {
      issues.push({
        severity: "error",
        category: "spells",
        message: `${spell.name} is not on the ${className} spell list`,
        detail: `${spell.name} is available to: ${classList.join(", ")}.`,
      });
    }
    // If spell not in our map at all, skip (could be homebrew)
  }

  return issues;
}

function checkSpellLevel(
  actor: any,
  className: string,
  level: number
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const casterType = CLASS_SPELLCASTER_TYPE[className];
  if (casterType === "none") return issues;

  const expected = getExpectedSpellSlots(className, level);
  const maxSlotLevel = Math.max(...Object.keys(expected).map(Number), 0);

  const spells = actor.items?.filter((i: any) => i.type === "spell") ?? [];
  for (const spell of spells) {
    const spellLevel = spell.system?.level ?? 0;
    if (spellLevel > 0 && spellLevel > maxSlotLevel) {
      issues.push({
        severity: "error",
        category: "spells",
        message: `${spell.name} is level ${spellLevel} but max available slot is level ${maxSlotLevel}`,
        detail: `Cannot have level-${spellLevel} spells with only level-${maxSlotLevel} slots.`,
      });
    }
  }

  return issues;
}

function checkCantripCount(
  actor: any,
  className: string,
  level: number
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const expected = getExpectedCantrips(className, level);
  if (expected === 0) return issues;

  const cantrips =
    actor.items?.filter(
      (i: any) => i.type === "spell" && (i.system?.level ?? 0) === 0
    ) ?? [];

  if (cantrips.length !== expected) {
    issues.push({
      severity: "warning",
      category: "cantrips",
      message: `Has ${cantrips.length} cantrip(s), expected ${expected} for ${className} level ${level}`,
    });
  }

  return issues;
}

// ─── Tier 3: Equipment Checks ─────────────────────────────────────

function checkArmorProficiency(
  actor: any,
  className: string
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const expected = CLASS_ARMOR_PROFICIENCIES[className];
  if (!expected) return issues;

  const items = actor.items?.filter((i: any) => i.type === "equipment" && i.system?.equipped) ?? [];

  const armorTypes = new Set<string>();
  for (const item of items) {
    const armorType = item.system?.armor?.type;
    if (armorType === "shield") {
      armorTypes.add("shield");
    } else if (armorType) {
      armorTypes.add(armorType);
    }
  }

  for (const worn of armorTypes) {
    if (!expected.includes(worn as any)) {
      issues.push({
        severity: "error",
        category: "equipment",
        message: `Wearing ${worn} but ${className} is not proficient with ${worn}`,
        detail: `${className} armor proficiencies: ${expected.length ? expected.join(", ") : "none"}.`,
      });
    }
  }

  return issues;
}

function checkWeaponProficiency(
  actor: any,
  className: string
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const expected = CLASS_WEAPON_PROFICIENCIES[className];
  if (!expected) return issues;

  const weapons = actor.items?.filter((i: any) => i.type === "weapon" && i.system?.equipped) ?? [];
  const hasSimple = expected.includes("simple");
  const hasMartial = expected.includes("martial");

  for (const weapon of weapons) {
    const weaponType = weapon.system?.weaponType ?? "";
    const isMartial = weaponType === "martial";

    if (isMartial && !hasMartial && !expected.includes(weapon.name?.toLowerCase())) {
      issues.push({
        severity: "warning",
        category: "equipment",
        message: `Wielding martial weapon "${weapon.name}" without martial proficiency`,
        detail: `${className} weapon proficiencies: ${expected.join(", ")}.`,
      });
    } else if (!isMartial && !hasSimple && !expected.includes(weapon.name?.toLowerCase())) {
      issues.push({
        severity: "warning",
        category: "equipment",
        message: `Wielding weapon "${weapon.name}" without proficiency`,
        detail: `${className} weapon proficiencies: ${expected.join(", ")}.`,
      });
    }
  }

  return issues;
}

// ─── Tier 4: Nice-to-have Checks ──────────────────────────────────

function checkBackground(actor: any): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const bg = actor.items?.find((i: any) => i.type === "background");
  if (!bg) {
    issues.push({
      severity: "warning",
      category: "background",
      message: "No background assigned",
      detail: "D&D 2024 requires a background for each character.",
    });
  }
  return issues;
}

function checkLanguages(actor: any): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const languages = actor.system?.traits?.languages?.value ?? [];
  if (languages.length === 0) {
    issues.push({
      severity: "warning",
      category: "languages",
      message: "No languages known",
      detail: "Characters should know at least Common + racial languages.",
    });
  }
  return issues;
}

// ─── Main Validation Function ─────────────────────────────────────

export function validateCharacter(actor: any): ValidationResult {
  const className = getClassName(actor);
  const level = getLevel(actor);
  const allIssues: ValidationIssue[] = [];
  let checksPassed = 0;

  // Tier 1: Pure math
  if (className) {
    const saveIssues = checkSaveProficiencies(actor, className);
    allIssues.push(...saveIssues);
    checksPassed += 6; // 6 ability saves checked

    const slotIssues = checkSpellSlots(actor, className, level);
    allIssues.push(...slotIssues);
    const casterType = CLASS_SPELLCASTER_TYPE[className];
    if (casterType !== "none") {
      checksPassed += 9; // up to 9 spell slot levels checked
    }

    const hpIssues = checkHP(actor, className, level);
    allIssues.push(...hpIssues);
    checksPassed += 1;
  }

  const profIssues = checkProficiencyBonus(actor, level);
  allIssues.push(...profIssues);
  checksPassed += 1;

  const pbIssues = checkPointBuy(actor);
  allIssues.push(...pbIssues);
  checksPassed += 1;

  // Tier 2: Spell lists
  if (className) {
    const spellListIssues = checkSpellsOnClassList(actor, className);
    allIssues.push(...spellListIssues);
    checksPassed += 1;

    const spellLevelIssues = checkSpellLevel(actor, className, level);
    allIssues.push(...spellLevelIssues);
    checksPassed += 1;

    const cantripIssues = checkCantripCount(actor, className, level);
    allIssues.push(...cantripIssues);
    checksPassed += 1;
  }

  // Tier 3: Equipment
  if (className) {
    const armorIssues = checkArmorProficiency(actor, className);
    allIssues.push(...armorIssues);
    checksPassed += 1;

    const weaponIssues = checkWeaponProficiency(actor, className);
    allIssues.push(...weaponIssues);
    checksPassed += 1;
  }

  // Tier 4: Nice-to-have
  const bgIssues = checkBackground(actor);
  allIssues.push(...bgIssues);
  checksPassed += 1;

  const langIssues = checkLanguages(actor);
  allIssues.push(...langIssues);
  checksPassed += 1;

  return {
    characterId: actor.id,
    name: actor.name,
    className,
    level,
    issues: allIssues,
    checksPassed,
  };
}
