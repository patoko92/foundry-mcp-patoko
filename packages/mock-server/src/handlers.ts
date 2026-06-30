/**
 * Mock query handlers for the Foundry VTT mock server.
 * Returns realistic dummy data for every method the MCP server might call.
 */

import type { McpContent } from '../../shared/dist/index.js';
import {
  ACTORS,
  ACTOR_IDS,
  SCENES,
  COMBAT,
  JOURNALS,
  COMPENDIUM_PACKS,
  COMPENDIUM_SEARCH_RESULTS,
  WORLD_INFO,
  MACROS,
  EFFECTS,
  FOLDERS,
  ROLL_TABLES,
  SCENE_NOTES,
  USER_IDS,
  mockDiceRoll,
} from './data.js';

type HandlerFn = (args: Record<string, unknown>) => McpContent[];

const handlers: Record<string, HandlerFn> = {

  // ── World & System ────────────────────────────────────────

  'get-world-info': (_args) => {
    return [textContent(WORLD_INFO)];
  },

  // ── Actors ────────────────────────────────────────────────

  'list-actors': (args) => {
    const typeFilter = args.type as string | undefined;
    let actors = ACTORS.map(a => {
      const sys = a.system as Record<string, unknown>;
      const attrs = (sys.attributes ?? {}) as Record<string, unknown>;
      return {
        _id: a._id,
        name: a.name,
        type: a.type,
        img: a.img,
        system: {
          details: sys.details,
          attributes: {
            hp: attrs.hp,
            ac: attrs.ac,
          },
        },
      };
    });
    if (typeFilter) {
      actors = actors.filter(a => a.type === typeFilter);
    }
    return [textContent(actors)];
  },

  'get-actor': (args) => {
    const name = args.name as string | undefined;
    const id = args.id as string | undefined;
    const actor = ACTORS.find(
      a => (id && a._id === id) || (name && a.name.toLowerCase().includes(name.toLowerCase()))
    );
    if (!actor) {
      return [textContent({ error: `Actor not found: ${name || id}` })];
    }
    return [textContent(actor)];
  },

  'create-actor': (args) => {
    const newActor = {
      _id: 'actor_' + Date.now(),
      name: args.name as string,
      type: args.type as string,
      img: 'icons/svg/mystery-man.svg',
      system: args.data || {},
      items: [],
      ownership: { default: 0 },
    };
    return [textContent({ success: true, actor: newActor })];
  },

  'update-actor': (args) => {
    const id = args.id as string;
    const actor = ACTORS.find(a => a._id === id);
    if (!actor) {
      return [textContent({ error: `Actor not found: ${id}` })];
    }
    return [textContent({ success: true, message: `Actor ${actor.name} updated`, data: args.data })];
  },
  'list-player-characters': (_args) => {
    const users: Record<string, string> = {
      [USER_IDS.gm]: 'Gamemaster',
      [USER_IDS.sarah]: 'Sarah',
      [USER_IDS.marcus]: 'Marcus',
      [USER_IDS.elena]: 'Elena',
    };
    const characters = ACTORS.filter(a => a.type === 'character');
    return [textContent(characters.map(c => {
      const ownership = (c as any).ownership || {};
      const ownerId = Object.keys(ownership).find(id => ownership[id] === 3 && users[id]);
      return {
        id: c._id,
        name: c.name,
        owner: ownerId ? users[ownerId] : null,
        hp: (c.system as any)?.attributes?.hp ?? null,
        level: (c.system as any)?.details?.level ?? null,
        sharedWith: [],
      };
    }))];
  },

  'get-world-users': (_args) => {
    return [textContent([
      { id: USER_IDS.gm, name: 'Gamemaster', role: 'gamemaster', active: true, isGM: true },
      { id: USER_IDS.sarah, name: 'Sarah', role: 'player', active: false, isGM: false },
      { id: USER_IDS.marcus, name: 'Marcus', role: 'player', active: false, isGM: false },
      { id: USER_IDS.elena, name: 'Elena', role: 'player', active: false, isGM: false },
    ])];
  },

  'delete-actor': (args) => {
    const actorId = args.actorId as string;
    const actor = ACTORS.find(a => a._id === actorId);
    if (!actor) {
      return [textContent({ error: `Actor not found: ${actorId}` })];
    }
    return [textContent({ success: true, deleted: true, actorId, name: actor.name })];
  },

  'delete-actors-by-type': (args) => {
    const actorType = args.actorType as string | undefined;
    const excludeTypes = args.excludeTypes as string[] | undefined;
    let actors = ACTORS;
    if (actorType) {
      actors = actors.filter(a => a.type === actorType);
    }
    if (excludeTypes?.length) {
      actors = actors.filter(a => !excludeTypes.includes(a.type));
    }
    return [textContent({ success: true, count: actors.length, deleted: actors.map(a => a.name) })];
  },



  // ── Actor Extended ────────────────────────────────────────

  'get-actor-items': (args) => {
    const actorId = args.actorId as string;
    const typeFilter = args.type as string | undefined;
    const actor = ACTORS.find(a => a._id === actorId);
    if (!actor) {
      return [textContent({ error: `Actor not found: ${actorId}` })];
    }
    let items = (actor.items || []) as Array<{ _id: string; name: string; type: string; img: string; system: Record<string, unknown> }>;
    if (typeFilter) {
      items = items.filter(i => i.type === typeFilter);
    }
    return [textContent({
      actorId,
      actorName: actor.name,
      totalItems: items.length,
      items: items.map(i => ({
        _id: i._id,
        name: i.name,
        type: i.type,
        img: i.img,
        system: i.system,
      })),
    })];
  },

  'get-actor-spells': (args) => {
    const actorId = args.actorId as string;
    const levelFilter = args.level as number | undefined;
    const actor = ACTORS.find(a => a._id === actorId);
    if (!actor) {
      return [textContent({ error: `Actor not found: ${actorId}` })];
    }
    const allItems = (actor.items || []) as Array<{ _id: string; name: string; type: string; img: string; system: Record<string, unknown> }>;
    let spells = allItems.filter(i => i.type === 'spell');
    if (levelFilter !== undefined) {
      spells = spells.filter(s => (s.system as Record<string, unknown>).level === levelFilter);
    }
    return [textContent({
      actorId,
      actorName: actor.name,
      totalSpells: spells.length,
      spells: spells.map(s => ({
        _id: s._id,
        name: s.name,
        img: s.img,
        system: s.system,
      })),
    })];
  },

  'update-actor-hp': (args) => {
    const actorId = args.actorId as string;
    const amount = args.amount as number;
    const mode = args.mode as string;
    const actor = ACTORS.find(a => a._id === actorId);
    if (!actor) {
      return [textContent({ error: `Actor not found: ${actorId}` })];
    }
    const sys = actor.system as Record<string, unknown>;
    const attrs = sys.attributes as Record<string, unknown>;
    const hp = attrs.hp as { value: number; max: number; temp: number };
    let newValue = hp.value;
    let message = '';

    switch (mode) {
      case 'damage':
        newValue = Math.max(0, hp.value - amount);
        message = `${actor.name} takes ${amount} damage`;
        break;
      case 'heal':
        newValue = Math.min(hp.max, hp.value + amount);
        message = `${actor.name} heals ${amount} HP`;
        break;
      case 'set':
        newValue = Math.max(0, Math.min(hp.max, amount));
        message = `${actor.name} HP set to ${amount}`;
        break;
      default:
        return [textContent({ error: `Invalid mode: ${mode}. Use 'damage', 'heal', or 'set'.` })];
    }

    return [textContent({
      success: true,
      message,
      actorId,
      actorName: actor.name,
      previousHp: hp.value,
      newHp: newValue,
      maxHp: hp.max,
      mode,
      amount,
    })];
  },

  'add-item-to-actor': (args) => {
    const actorId = args.actorId as string;
    const actor = ACTORS.find(a => a._id === actorId);
    if (!actor) {
      return [textContent({ error: `Actor not found: ${actorId}` })];
    }
    const newItem = {
      _id: 'item_' + Date.now(),
      name: (args.data as Record<string, unknown>)?.name || 'New Item',
      type: (args.data as Record<string, unknown>)?.type || 'loot',
      img: 'icons/svg/mystery-man.svg',
      system: args.data || {},
    };
    return [textContent({
      success: true,
      message: `Item added to ${actor.name}`,
      actorId,
      actorName: actor.name,
      item: newItem,
    })];
  },

  'remove-item-from-actor': (args) => {
    const actorId = args.actorId as string;
    const itemId = args.itemId as string;
    const actor = ACTORS.find(a => a._id === actorId);
    if (!actor) {
      return [textContent({ error: `Actor not found: ${actorId}` })];
    }
    const allItems = (actor.items || []) as Array<{ _id: string; name: string }>;
    const item = allItems.find(i => i._id === itemId);
    if (!item) {
      return [textContent({ error: `Item not found: ${itemId} on actor ${actor.name}` })];
    }
    return [textContent({
      success: true,
      message: `Removed "${item.name}" from ${actor.name}`,
      actorId,
      actorName: actor.name,
      removedItemId: itemId,
      removedItemName: item.name,
    })];
  },

  // ── Scenes ────────────────────────────────────────────────

  'list-scenes': (_args) => {
    const scenes = SCENES.map(s => ({
      _id: s._id,
      name: s.name,
      active: s.active,
      width: s.width,
      height: s.height,
      tokenCount: s.tokens.length,
    }));
    return [textContent(scenes)];
  },

  'get-scene': (args) => {
    const id = args.id as string | undefined;
    const name = args.name as string | undefined;
    const scene = SCENES.find(
      s => (id && s._id === id) || (name && s.name.toLowerCase().includes(name.toLowerCase()))
    );
    if (!scene) {
      return [textContent({ error: `Scene not found: ${name || id}` })];
    }
    return [textContent(scene)];
  },

  'switch-scene': (args) => {
    const id = args.id as string;
    const scene = SCENES.find(s => s._id === id);
    if (!scene) {
      return [textContent({ error: `Scene not found: ${id}` })];
    }
    return [textContent({ success: true, message: `Activated scene: ${scene.name}`, sceneId: id })];
  },

  // ── Combat ────────────────────────────────────────────────

  'get-combat-state': (_args) => {
    return [textContent(COMBAT)];
  },

  'start-combat': (args) => {
    const sceneId = (args.sceneId as string) || SCENES.find(s => s.active)?._id;
    const combatantTokenIds = args.combatantTokenIds as string[] | undefined;
    return [textContent({
      success: true,
      message: 'Combat started',
      combat: {
        _id: 'combat_' + Date.now(),
        active: true,
        round: 1,
        turn: 0,
        sceneId,
        combatantTokenIds: combatantTokenIds || [],
      },
    })];
  },

  'add-combatant': (args) => {
    const tokenId = args.tokenId as string | undefined;
    const actorId = args.actorId as string | undefined;
    const name = (args.name as string) || 'Unknown Combatant';
    const hidden = (args.hidden as boolean) || false;
    return [textContent({
      success: true,
      message: `Combatant "${name}" added to combat`,
      combatant: {
        _id: 'combatant_' + Date.now(),
        name,
        tokenId: tokenId || null,
        actorId: actorId || null,
        initiative: null,
        hidden,
      },
    })];
  },

  'remove-combatant': (args) => {
    const combatantId = args.combatantId as string;
    const combatant = COMBAT.combatants.find(c => c._id === combatantId);
    if (!combatant) {
      return [textContent({ error: `Combatant not found: ${combatantId}` })];
    }
    return [textContent({
      success: true,
      message: `Combatant "${combatant.name}" removed from combat`,
      removedCombatantId: combatantId,
      removedCombatantName: combatant.name,
    })];
  },

  'set-initiative': (args) => {
    const combatantId = args.combatantId as string;
    const value = args.value as number;
    const combatant = COMBAT.combatants.find(c => c._id === combatantId);
    if (!combatant) {
      return [textContent({ error: `Combatant not found: ${combatantId}` })];
    }
    return [textContent({
      success: true,
      message: `${combatant.name} initiative set to ${value}`,
      combatantId,
      combatantName: combatant.name,
      previousInitiative: combatant.initiative,
      newInitiative: value,
    })];
  },

  // ── Tokens ────────────────────────────────────────────────

  'get-token-details': (args) => {
    const tokenId = args.tokenId as string;
    const sceneId = args.sceneId as string | undefined;
    const scene = sceneId
      ? SCENES.find(s => s._id === sceneId)
      : SCENES.find(s => s.active);
    if (!scene) {
      return [textContent({ error: 'No active scene found' })];
    }
    const token = scene.tokens.find(t => t._id === tokenId);
    if (!token) {
      return [textContent({ error: `Token not found: ${tokenId}` })];
    }
    // Attach actor data if available
    const actor = token.actorId ? ACTORS.find(a => a._id === token.actorId) : null;
    return [textContent({ ...token, actor: actor ? { name: actor.name, type: actor.type, system: actor.system } : null })];
  },

  'move-token': (args) => {
    return [textContent({
      success: true,
      message: `Token ${args.tokenId} moved to (${args.x}, ${args.y})`,
      tokenId: args.tokenId,
      x: args.x,
      y: args.y,
    })];
  },

  'update-token': (args) => {
    const tokenId = args.tokenId as string;
    const data = args.data as Record<string, unknown>;
    const sceneId = args.sceneId as string | undefined;
    return [textContent({
      success: true,
      message: `Token ${tokenId} updated`,
      tokenId,
      sceneId: sceneId || 'active',
      updatedFields: Object.keys(data),
      data,
    })];
  },

  'delete-tokens': (args) => {
    const tokenIds = args.tokenIds as string[];
    const sceneId = args.sceneId as string | undefined;
    return [textContent({
      success: true,
      message: `${tokenIds.length} token(s) deleted`,
      deletedTokenIds: tokenIds,
      sceneId: sceneId || 'active',
    })];
  },

  'toggle-token-condition': (args) => {
    const tokenId = args.tokenId as string;
    const condition = args.condition as string;
    const active = args.active as boolean;
    const level = args.level as number | undefined;
    return [textContent({
      success: true,
      message: `Condition "${condition}" ${active ? 'applied to' : 'removed from'} token ${tokenId}`,
      tokenId,
      condition,
      active,
      level: level || null,
    })];
  },

  // ── Journals ──────────────────────────────────────────────

  'search-journals': (args) => {
    const query = (args.query as string || '').toLowerCase();
    const results = JOURNALS
      .filter(j => j.name.toLowerCase().includes(query) || j.content.toLowerCase().includes(query))
      .map(j => ({ _id: j._id, name: j.name, folder: j.folder }));
    return [textContent({ query, results, total: results.length })];
  },

  'create-journal': (args) => {
    const newJournal = {
      _id: 'journal_' + Date.now(),
      name: args.name as string,
      content: args.content as string,
      folder: (args.folder as string) || null,
    };
    return [textContent({ success: true, journal: newJournal })];
  },

  // ── Compendium ────────────────────────────────────────────

  'list-compendium-packs': (_args) => {
    return [textContent(COMPENDIUM_PACKS)];
  },

  'search-compendium': (args) => {
    const query = (args.query as string || '').toLowerCase();
    const packs = args.packs as string[] | undefined;
    const type = args.type as string | undefined;
    const limit = (args.limit as number) || 10;

    let results = COMPENDIUM_SEARCH_RESULTS.filter(r =>
      r.name.toLowerCase().includes(query)
    );

    if (packs && packs.length > 0) {
      results = results.filter(r => packs.includes(r.pack));
    }
    if (type) {
      results = results.filter(r => r.type === type);
    }

    results = results.slice(0, limit);
    return [textContent({ query, results, total: results.length })];
  },

  'get-compendium-item': (args) => {
    const pack = args.pack as string;
    const id = args.id as string;
    const item = COMPENDIUM_SEARCH_RESULTS.find(r => r.pack === pack && r.id === id);
    if (!item) {
      return [textContent({ error: `Compendium item not found: ${pack}:${id}` })];
    }
    return [textContent(item)];
  },

  // ── Dice ──────────────────────────────────────────────────

  'roll-dice': (args) => {
    const formula = args.formula as string;
    const flavor = args.flavor as string | undefined;
    const speaker = args.speaker as string | undefined;
    return [textContent({
      formula,
      flavor: flavor || '',
      speaker: speaker || 'Mock Server',
      result: JSON.parse(mockDiceRoll(formula, flavor)),
    })];
  },

  // ── Chat ──────────────────────────────────────────────────

  'send-chat-message': (args) => {
    const content = args.content as string;
    const speaker = (args.speaker as string) || 'Dungeon Master';
    const type = (args.type as string) || 'ic';
    return [textContent({
      success: true,
      message: {
        _id: 'chatmsg_' + Date.now(),
        content,
        speaker: { alias: speaker },
        type: type === 'ooc' ? 1 : type === 'emote' ? 2 : 0,
        timestamp: Date.now(),
      },
    })];
  },

  'send-whisper': (args) => {
    const content = args.content as string;
    const targetUserId = args.targetUserId as string;
    const speaker = (args.speaker as string) || 'Dungeon Master';
    return [textContent({
      success: true,
      message: {
        _id: 'chatmsg_' + Date.now(),
        content,
        speaker: { alias: speaker },
        whisper: [targetUserId],
        type: 0,
        timestamp: Date.now(),
      },
    })];
  },

  // ── Ownership ─────────────────────────────────────────────

  'assign-actor-ownership': (args) => {
    const actorId = args.actorId as string;
    const userId = args.userId as string;
    const level = (args.level as number) ?? 3;
    const actor = ACTORS.find(a => a._id === actorId);
    if (!actor) {
      return [textContent({ error: `Actor not found: ${actorId}` })];
    }
    return [textContent({
      success: true,
      message: `Ownership level ${level} granted to user ${userId} on actor ${actor.name}`,
      actorId,
      actorName: actor.name,
      userId,
      level,
    })];
  },

  'remove-actor-ownership': (args) => {
    const actorId = args.actorId as string;
    const userId = args.userId as string;
    const actor = ACTORS.find(a => a._id === actorId);
    if (!actor) {
      return [textContent({ error: `Actor not found: ${actorId}` })];
    }
    return [textContent({
      success: true,
      message: `Ownership removed for user ${userId} on actor ${actor.name}`,
      actorId,
      actorName: actor.name,
      userId,
    })];
  },

  'list-actor-ownership': (args) => {
    const actorId = args.actorId as string;
    const actor = ACTORS.find(a => a._id === actorId);
    if (!actor) {
      return [textContent({ error: `Actor not found: ${actorId}` })];
    }
    return [textContent({
      actorId,
      actorName: actor.name,
      ownership: actor.ownership || { default: 0 },
    })];
  },

  // ── Macros ────────────────────────────────────────────────

  'execute-macro': (args) => {
    const name = args.name as string | undefined;
    const id = args.id as string | undefined;
    const macro = MACROS.find(
      m => (id && m._id === id) || (name && m.name.toLowerCase().includes(name.toLowerCase()))
    );
    if (!macro) {
      return [textContent({ error: `Macro not found: ${name || id}` })];
    }
    return [textContent({
      success: true,
      message: `Macro "${macro.name}" executed`,
      macro: {
        _id: macro._id,
        name: macro.name,
        type: macro.type,
        author: macro.author,
      },
      output: `[Mock] Macro "${macro.name}" would execute its command now.`,
    })];
  },

  // ── Effects ───────────────────────────────────────────────

  'list-actor-effects': (args) => {
    const actorId = args.actorId as string;
    const actor = ACTORS.find(a => a._id === actorId);
    if (!actor) {
      return [textContent({ error: `Actor not found: ${actorId}` })];
    }
    // Return effects for Kaelith specifically, empty for others
    const effects = actorId === ACTOR_IDS.kaelith ? EFFECTS : [];
    return [textContent({
      actorId,
      actorName: actor.name,
      totalEffects: effects.length,
      effects,
    })];
  },

  'add-effect-to-actor': (args) => {
    const actorId = args.actorId as string;
    const name = args.name as string;
    const changes = args.changes as Array<{ key: string; mode: number; value: string }>;
    const duration = args.duration as Record<string, unknown> | undefined;
    const actor = ACTORS.find(a => a._id === actorId);
    if (!actor) {
      return [textContent({ error: `Actor not found: ${actorId}` })];
    }
    return [textContent({
      success: true,
      message: `Effect "${name}" added to ${actor.name}`,
      actorId,
      actorName: actor.name,
      effect: {
        _id: 'effect_' + Date.now(),
        name,
        icon: 'icons/svg/aura.svg',
        disabled: false,
        duration: duration || {},
        changes,
      },
    })];
  },

  'remove-effect-from-actor': (args) => {
    const actorId = args.actorId as string;
    const effectId = args.effectId as string;
    const actor = ACTORS.find(a => a._id === actorId);
    if (!actor) {
      return [textContent({ error: `Actor not found: ${actorId}` })];
    }
    const effect = EFFECTS.find(e => e._id === effectId);
    return [textContent({
      success: true,
      message: `Effect "${effect?.name || effectId}" removed from ${actor.name}`,
      actorId,
      actorName: actor.name,
      removedEffectId: effectId,
    })];
  },

  // ── Folders ───────────────────────────────────────────────

  'list-folders': (args) => {
    const typeFilter = args.type as string | undefined;
    let folders = FOLDERS;
    if (typeFilter) {
      folders = folders.filter(f => f.type === typeFilter);
    }
    return [textContent({
      totalFolders: folders.length,
      folders,
    })];
  },

  'create-folder': (args) => {
    const name = args.name as string;
    const type = args.type as string;
    const parent = args.parent as string | undefined;
    return [textContent({
      success: true,
      message: `Folder "${name}" created`,
      folder: {
        _id: 'folder_' + Date.now(),
        name,
        type,
        parent: parent || null,
        children: [],
      },
    })];
  },

  // ── Roll Tables ───────────────────────────────────────────

  'roll-table': (args) => {
    const tableId = args.tableId as string;
    const table = ROLL_TABLES.find(t => t._id === tableId);
    if (!table) {
      return [textContent({ error: `Roll table not found: ${tableId}` })];
    }
    const roll = Math.floor(Math.random() * 100) + 1;
    const result = table.results.find(r => roll >= r.range[0] && roll <= r.range[1]);
    return [textContent({
      tableId,
      tableName: table.name,
      roll,
      result: result || { text: 'No result', type: 0, range: [0, 0] },
      totalResults: table.results.length,
    })];
  },

  // ── Scene Notes ───────────────────────────────────────────

  'get-scene-notes': (args) => {
    const sceneId = (args.sceneId as string) || SCENES.find(s => s.active)?._id;
    return [textContent({
      sceneId,
      sceneName: SCENES.find(s => s._id === sceneId)?.name || SCENES.find(s => s.active)?.name,
      totalNotes: SCENE_NOTES.length,
      notes: SCENE_NOTES.map(n => ({
        _id: n._id,
        name: n.name,
        content: n.content,
      })),
    })];
  },
};

/**
 * Handle an incoming query and return MCP content array.
 */
export function handleQuery(method: string, args: Record<string, unknown>): McpContent[] {
  const handler = handlers[method];
  if (!handler) {
    return [textContent({
      error: `Unknown method: ${method}`,
      availableMethods: Object.keys(handlers),
    })];
  }

  try {
    return handler(args);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return [textContent({ error: `Handler error for ${method}: ${message}` })];
  }
}

/**
 * Helper to create a text content block.
 */
function textContent(data: unknown): McpContent {
  return {
    type: 'text',
    text: JSON.stringify(data, null, 2),
  };
}
