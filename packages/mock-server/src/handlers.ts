/**
 * Mock query handlers for the Foundry VTT mock server.
 * Returns realistic dummy data for every method the MCP server might call.
 */

import type { McpContent } from '../../shared/dist/index.js';
import {
  ACTORS,
  SCENES,
  COMBAT,
  JOURNALS,
  COMPENDIUM_PACKS,
  COMPENDIUM_SEARCH_RESULTS,
  WORLD_INFO,
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
