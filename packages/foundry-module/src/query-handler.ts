/**
 * Query handler — dispatches MCP method calls to Foundry VTT API.
 * All Foundry API access is wrapped in try/catch for safety.
 * Write operations require GM permissions.
 */

const WRITE_METHODS = new Set([
  'createActor',
  'updateActor',
  'switchScene',
  'createScene',
  'activateScene',
  'updateScene',
  'createJournal',
  'moveToken',
  'placeToken',
  'placeTokenGrid',
  'moveTokenGrid',
  'updateActorHp',
  'addItemToActor',
  'removeItemFromActor',
  'updateToken',
  'deleteTokens',
  'deleteActor',
  'deleteActorsByType',
  'toggleTokenCondition',
  'startCombat',
  'endCombat',
  'nextTurn',
  'previousTurn',
  'addCombatant',
  'removeCombatant',
  'rollAllInitiative',
  'setInitiative',
  'sendChatMessage',
  'sendWhisper',
  'assignActorOwnership',
  'removeActorOwnership',
  'executeMacro',
  'addEffectToActor',
  'removeEffectFromActor',
  'createFolder',
  'rollTable',
  'createWall',
  'createRoom',
  'createWallGrid',
  'deleteWall',
  'updateItem',
]);

export interface QueryResult {
  content: { type: 'text'; text: string }[];
  isError?: boolean;
}

function success(data: unknown): QueryResult {
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  };
}

function error(message: string): QueryResult {
  return {
    content: [{ type: 'text', text: message }],
    isError: true,
  };
}

function isGM(): boolean {
  return game.user?.isGM === true;
}

/**
 * Dispatch an incoming MCP query to the appropriate handler method.
 */
/** Convert kebab-case method name to camelCase (e.g. 'get-world-info' → 'getWorldInfo') */
function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

export async function handleQuery(
  method: string,
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    // Convert kebab-case to camelCase for internal dispatch
    const camelMethod = toCamelCase(method);

    // Permission check for write operations
    if (WRITE_METHODS.has(camelMethod) && !isGM()) {
      return error(`Permission denied: only GM users can execute '${method}'`);
    }

    const handler = methodMap[camelMethod];
    if (!handler) {
      return error(`Unknown method: ${method}`);
    }

    return await handler(args);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return error(`Error executing ${method}: ${message}`);
  }
}

// ─── Handler registry ───────────────────────────────────────────────

type MethodHandler = (
  args: Record<string, unknown>
) => Promise<QueryResult> | QueryResult;

const methodMap: Record<string, MethodHandler> = {
  getWorldInfo,
  listActors,
  getActor,
  createActor,
  updateActor,
  listScenes,
  getCurrentScene,
  switchScene,
  createScene,
  activateScene,
  updateScene,
  searchCompendium,
  getCompendiumItem,
  listCompendiumPacks,
  getCombatState,
  rollDice,
  listJournals,
  searchJournals,
  createJournal,
  listTokens,
  getTokenDetails,
  moveToken,
  // Actor Queries
  listPlayerCharacters,
  getWorldUsers,
  deleteActor,
  deleteActorsByType,
  // Actor Extended
  getActorItems,
  getActorSpells,
  updateActorHp,
  addItemToActor,
  removeItemFromActor,
  // Token Extended
  updateToken,
  deleteTokens,
  toggleTokenCondition,
  // Combat Extended
  startCombat,
  endCombat,
  nextTurn,
  previousTurn,
  addCombatant,
  removeCombatant,
  rollAllInitiative,
  setInitiative,
  // Chat
  sendChatMessage,
  sendWhisper,
  // Ownership
  assignActorOwnership,
  removeActorOwnership,
  listActorOwnership,
  // Macros
  listMacros,
  executeMacro,
  // Effects
  listActorEffects,
  addEffectToActor,
  removeEffectFromActor,
  // Folders
  listFolders,
  createFolder,
  // Rollable Tables
  listRollTables,
  rollTable,
  // Scene Notes
  getSceneNotes,
  // Walls
  createWall,
  createRoom,
  createWallGrid,
  listWalls,
  deleteWall,
  // Items (World + Compendium)
  updateItem,
  searchItems,
  searchAll,
};

// ─── World Info ─────────────────────────────────────────────────────

async function getWorldInfo(): Promise<QueryResult> {
  const users = game.users.map((u: any) => ({
    id: u.id,
    name: u.name,
    role: u.role,
  }));

  return success({
    id: game.world.id,
    name: game.world.name,
    system: game.system.id,
    systemVersion: game.system.version,
    foundryVersion: game.version || game.data?.version || 'unknown',
    title: game.world.title || game.world.name,
    description: game.world.description || '',
    users,
  });
}

// ─── Actors ─────────────────────────────────────────────────────────

async function listActors(
  args: Record<string, unknown>
): Promise<QueryResult> {
  const typeFilter = args.type as string | undefined;
  let actors = game.actors.contents;

  if (typeFilter) {
    actors = actors.filter((a: any) => a.type === typeFilter);
  }

  const mapped = actors.map((a: any) => ({
    _id: a.id,
    name: a.name,
    type: a.type,
    img: a.img,
    system: a.system,
    ownership: a.ownership,
    folder: a.folder?.id ?? null,
  }));

  return success(mapped);
}

async function getActor(
  args: Record<string, unknown>
): Promise<QueryResult> {
  const id = args.id as string | undefined;
  const name = args.name as string | undefined;

  if (!id && !name) {
    return error('Either id or name must be provided');
  }

  let actor: any = null;
  if (id) {
    actor = game.actors.get(id);
  } else if (name) {
    actor = game.actors.getName(name);
  }

  if (!actor) {
    return error(`Actor not found: ${id ?? name}`);
  }

  return success({
    _id: actor.id,
    name: actor.name,
    type: actor.type,
    img: actor.img,
    system: actor.system,
    items: actor.items?.contents?.map((i: any) => ({
      _id: i.id,
      name: i.name,
      type: i.type,
      img: i.img,
      system: i.system,
    })) ?? [],
    ownership: actor.ownership,
    folder: actor.folder?.id ?? null,
  });
}

async function createActor(
  args: Record<string, unknown>
): Promise<QueryResult> {
  const name = args.name as string;
  const type = args.type as string;
  const data = (args.data as Record<string, unknown>) ?? {};
  const folder = args.folder as string | undefined;

  if (!name || !type) {
    return error('name and type are required');
  }

  const createData: Record<string, any> = { name, type, ...data };
  if (folder) createData.folder = folder;

  const actor = await Actor.create(createData);
  if (!actor) {
    return error('Failed to create actor');
  }

  return success({
    _id: actor.id,
    name: actor.name,
    type: actor.type,
    msg: 'Actor created successfully',
  });
}

async function updateActor(
  args: Record<string, unknown>
): Promise<QueryResult> {
  const id = args.id as string;
  const data = args.data as Record<string, unknown>;

  if (!id || !data) {
    return error('id and data are required');
  }

  const actor = game.actors.get(id);
  if (!actor) {
    return error(`Actor not found: ${id}`);
  }

  await actor.update(data);
  return success({ _id: id, msg: 'Actor updated successfully' });
}

// ─── Actor Queries ──────────────────────────────────────────────────

async function listPlayerCharacters(): Promise<QueryResult> {
  try {
    const users = game.users.reduce((map: Record<string, string>, u: any) => {
      map[u.id] = u.name;
      return map;
    }, {} as Record<string, string>);

    const characters = game.actors.filter((a: any) => a.type === 'character');

    return success(
      characters.map((c: any) => {
        const ownership = c.ownership ?? {};
        const ownerId = Object.keys(ownership).find(
          (id) => ownership[id] === 3 && users[id] && id !== game.user?.id
        );
        const sharedWith = Object.entries(ownership)
          .filter(([id, level]) => users[id] && (level as number) >= 2 && id !== ownerId && id !== game.user?.id)
          .map(([id]) => users[id]);

        return {
          id: c.id,
          name: c.name,
          owner: ownerId ? users[ownerId] : null,
          hp: c.system?.attributes?.hp ?? null,
          level: c.system?.details?.level ?? null,
          sharedWith,
        };
      })
    );
  } catch (err) {
    return error(`Failed to list player characters: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function getWorldUsers(): Promise<QueryResult> {
  try {
    const roleNames: Record<number, string> = {
      0: 'player',
      1: 'player',
      2: 'trusted',
      3: 'assistant',
      4: 'gamemaster',
    };

    return success(
      game.users.map((u: any) => ({
        id: u.id,
        name: u.name,
        role: roleNames[u.role] || 'unknown',
        active: u.active,
        isGM: u.isGM,
      }))
    );
  } catch (err) {
    return error(`Failed to get world users: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function deleteActor(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    const actorId = args.actorId as string;
    if (!actorId) return error('actorId is required');

    const actor = game.actors.get(actorId);
    if (!actor) return error(`Actor not found: ${actorId}`);

    const name = actor.name;
    await actor.delete();

    return success({ deleted: true, actorId, name });
  } catch (err) {
    return error(`Failed to delete actor: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function deleteActorsByType(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    const actorType = args.actorType as string | undefined;
    const excludeTypes = args.excludeTypes as string[] | undefined;

    const actors = game.actors.filter((a: any) => {
      if (excludeTypes?.includes(a.type)) return false;
      return actorType ? a.type === actorType : true;
    });

    const deleted: string[] = [];
    for (const a of actors) {
      deleted.push(a.name);
      await a.delete();
    }

    return success({ count: deleted.length, deleted });
  } catch (err) {
    return error(`Failed to delete actors by type: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// ─── Scenes ─────────────────────────────────────────────────────────

async function listScenes(): Promise<QueryResult> {
  const scenes = game.scenes.contents.map((s: any) => ({
    _id: s.id,
    name: s.name,
    img: s.img,
    active: s.active,
    width: s.width,
    height: s.height,
    grid: s.grid,
    tokenCount: s.tokens?.size ?? 0,
  }));

  return success(scenes);
}

async function getCurrentScene(): Promise<QueryResult> {
  const scene = game.scenes.current;
  if (!scene) {
    return error('No current scene active');
  }

  return success({
    _id: scene.id,
    name: scene.name,
    img: scene.img,
    active: scene.active,
    width: scene.width,
    height: scene.height,
    grid: scene.grid,
    tokens: scene.tokens?.map((t: any) => ({
      _id: t.id,
      name: t.name,
      actorId: t.actorId,
      x: t.x,
      y: t.y,
      img: t.img,
      width: t.width,
      height: t.height,
      hidden: t.hidden,
      disposition: t.disposition,
    })) ?? [],
  });
}

async function switchScene(
  args: Record<string, unknown>
): Promise<QueryResult> {
  const id = args.id as string;
  if (!id) return error('Scene id is required');

  const scene = game.scenes.get(id);
  if (!scene) return error(`Scene not found: ${id}`);

  await scene.view();
  return success({ _id: id, msg: 'Scene activated' });
}


async function createScene(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    const name = args.name as string;
    if (!name) return error('name is required');

    const width = (args.width as number) || 4000;
    const height = (args.height as number) || 3000;
    const gridSize = (args.gridSize as number) || 100;
    const gridType = (args.gridType as number) ?? 0;
    const gridDistance = (args.gridDistance as number) ?? 5;
    const gridUnits = (args.gridUnits as string) || 'ft';
    const background = args.background as string | undefined;

    const sceneData: Record<string, any> = {
      name,
      width,
      height,
      grid: {
        size: gridSize,
        type: gridType,
        distance: gridDistance,
        units: gridUnits,
      },
    };

    if (background) {
      sceneData.background = { src: background };
    }

    const scene = await Scene.create(sceneData);
    if (!scene) return error('Failed to create scene');

    return success({
      _id: scene.id,
      name: scene.name,
      active: scene.active,
      width: scene.width,
      height: scene.height,
      msg: 'Scene created successfully',
    });
  } catch (err) {
    return error(`Failed to create scene: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function activateScene(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    const sceneId = args.sceneId as string;
    if (!sceneId) return error('sceneId is required');

    const scene = game.scenes.get(sceneId);
    if (!scene) return error(`Scene not found: ${sceneId}`);

    await scene.activate();

    return success({
      _id: scene.id,
      name: scene.name,
      active: true,
      msg: 'Scene activated for all players',
    });
  } catch (err) {
    return error(`Failed to activate scene: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function updateScene(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    const id = args.id as string;
    const data = args.data as Record<string, unknown>;

    if (!id) return error('id is required');
    if (!data) return error('data is required');

    const scene = game.scenes.get(id);
    if (!scene) return error(`Scene not found: ${id}`);

    await scene.update(data);

    return success({
      _id: scene.id,
      name: scene.name,
      msg: 'Scene updated successfully',
    });
  } catch (err) {
    return error(`Failed to update scene: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// ─── Compendiums ────────────────────────────────────────────────────

async function searchCompendium(
  args: Record<string, unknown>
): Promise<QueryResult> {
  const query = (args.query as string)?.toLowerCase();
  const packIds = args.packs as string[] | undefined;
  const typeFilter = args.type as string | undefined;
  const limit = (args.limit as number) ?? 20;

  if (!query) return error('query is required');

  let packs = game.packs.filter(
    (p: any) => !typeFilter || p.metadata?.type === typeFilter
  );

  if (packIds?.length) {
    packs = packs.filter((p: any) => packIds.includes(p.collection));
  }

  const results: any[] = [];

  // Parallel pack loading with 5s timeout per pack
  const packTimeout = 5000;
  const packPromises = packs.map(async (pack: any) => {
    try {
      const docs = await Promise.race([
        pack.getDocuments(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), packTimeout))
      ]);
      const matches: any[] = [];
      for (const doc of docs) {
        if (matches.length >= limit) break;
        if (doc.name?.toLowerCase().includes(query)) {
          matches.push({
            pack: pack.collection,
            packLabel: pack.metadata?.label ?? pack.collection,
            id: doc.id ?? doc._id,
            name: doc.name,
            type: doc.type ?? pack.metadata?.type,
            img: doc.img,
          });
        }
      }
      return matches;
    } catch {
      return [];
    }
  });

  const settled = await Promise.allSettled(packPromises);
  for (const r of settled) {
    if (r.status === 'fulfilled') {
      for (const m of r.value) {
        if (results.length >= limit) break;
        results.push(m);
      }
    }
    if (results.length >= limit) break;
  }

  return success(results);
}

async function getCompendiumItem(
  args: Record<string, unknown>
): Promise<QueryResult> {
  const packId = args.pack as string;
  const id = args.id as string;

  if (!packId || !id) return error('pack and id are required');

  const pack = game.packs.get(packId);
  if (!pack) return error(`Compendium pack not found: ${packId}`);

  const doc = await pack.getDocument(id);
  if (!doc) return error(`Document not found in pack: ${id}`);

  const data = doc.toObject ? doc.toObject() : doc;
  return success(data);
}

async function listCompendiumPacks(): Promise<QueryResult> {
  const packs = game.packs
    .filter(() => true)
    .map((p: any) => ({
      id: p.collection,
      label: p.metadata?.label ?? p.collection,
      type: p.metadata?.type ?? 'unknown',
      name: p.metadata?.name ?? '',
    }));

  return success(packs);
}

// ─── Combat ─────────────────────────────────────────────────────────

async function getCombatState(): Promise<QueryResult> {
  const combat = game.combat;
  if (!combat) {
    return success({ active: false, round: 0, turn: 0, combatants: [] });
  }

  const combatants = (combat.combatants ?? []).map((c: any) => ({
    _id: c.id,
    name: c.name,
    tokenId: c.tokenId,
    actorId: c.actorId,
    initiative: c.initiative,
    hidden: c.hidden,
  }));

  return success({
    _id: combat.id,
    active: combat.active,
    round: combat.round,
    turn: combat.turn,
    combatants,
  });
}

// ─── Dice ───────────────────────────────────────────────────────────

async function rollDice(
  args: Record<string, unknown>
): Promise<QueryResult> {
  const formula = args.formula as string;
  const flavor = args.flavor as string | undefined;

  if (!formula) return error('formula is required');

  const roll = new Roll(formula);
  await roll.evaluate();

  // Optionally post to chat
  const speakerData: any = {};
  if (args.speaker) {
    speakerData.alias = args.speaker;
  }

  try {
    await roll.toMessage(
      {
        speaker: speakerData,
        flavor: flavor ?? undefined,
      },
      { rollMode: 'publicroll' }
    );
  } catch {
    // Chat message posting is optional
  }

  return success({
    formula: roll.formula,
    total: roll.total,
    terms: roll.terms.map((t: any) => t.toString()),
  });
}

// ─── Journals ───────────────────────────────────────────────────────

async function listJournals(): Promise<QueryResult> {
  const journals = game.journal.contents.map((j: any) => ({
    _id: j.id,
    name: j.name,
    content: j.pages?.contents?.[0]?.text?.content?.substring(0, 200) ?? '',
    folder: j.folder?.id ?? null,
  }));

  return success(journals);
}

async function searchJournals(
  args: Record<string, unknown>
): Promise<QueryResult> {
  const query = (args.query as string)?.toLowerCase();
  if (!query) return error('query is required');

  const results = game.journal.contents
    .filter((j: any) => j.name?.toLowerCase().includes(query))
    .map((j: any) => ({
      _id: j.id,
      name: j.name,
      content: j.pages?.contents?.[0]?.text?.content?.substring(0, 200) ?? '',
      folder: j.folder?.id ?? null,
    }));

  return success(results);
}

async function createJournal(
  args: Record<string, unknown>
): Promise<QueryResult> {
  const name = args.name as string;
  const content = args.content as string;
  const folder = args.folder as string | undefined;

  if (!name || !content) return error('name and content are required');

  const createData: Record<string, any> = {
    name,
    pages: [
      {
        name,
        type: 'text',
        text: { content, format: 1 },
      },
    ],
  };
  if (folder) createData.folder = folder;

  const journal = await JournalEntry.create(createData);
  if (!journal) return error('Failed to create journal entry');

  return success({
    _id: journal.id,
    name: journal.name,
    msg: 'Journal entry created successfully',
  });
}

// ─── Tokens ─────────────────────────────────────────────────────────

async function listTokens(): Promise<QueryResult> {
  if (!canvas?.tokens?.placeables) {
    return success([]);
  }

  const tokens = canvas.tokens.placeables.map((t: any) => ({
    _id: t.id ?? t.document?.id,
    name: t.name ?? t.document?.name,
    actorId: t.actorId ?? t.document?.actorId,
    x: t.x ?? t.document?.x,
    y: t.y ?? t.document?.y,
    img: t.img ?? t.document?.img,
    width: t.width ?? t.document?.width,
    height: t.height ?? t.document?.height,
    hidden: t.hidden ?? t.document?.hidden,
    disposition: t.disposition ?? t.document?.disposition,
  }));

  return success(tokens);
}

async function getTokenDetails(
  args: Record<string, unknown>
): Promise<QueryResult> {
  const tokenId = args.tokenId as string;
  if (!tokenId) return error('tokenId is required');

  if (!canvas?.tokens?.placeables) {
    return error('Canvas not available');
  }

  const token = canvas.tokens.placeables.find(
    (t: any) => (t.id ?? t.document?.id) === tokenId
  );

  if (!token) {
    // Try scene tokens directly
    const scene = game.scenes.current;
    if (scene) {
      const sceneToken = scene.tokens?.get(tokenId);
      if (sceneToken) {
        return success(sceneToken.toObject ? sceneToken.toObject() : sceneToken);
      }
    }
    return error(`Token not found: ${tokenId}`);
  }

  const doc: any = (token as any).document ?? token;
  return success({
    _id: doc.id,
    name: doc.name,
    actorId: doc.actorId,
    x: doc.x,
    y: doc.y,
    img: doc.img,
    width: doc.width,
    height: doc.height,
    hidden: doc.hidden,
    disposition: doc.disposition,
    actor: token.actor
      ? {
          _id: token.actor.id,
          name: token.actor.name,
          type: token.actor.type,
        }
      : null,
  });
}

async function moveToken(
  args: Record<string, unknown>
): Promise<QueryResult> {
  const tokenId = args.tokenId as string;
  const x = args.x as number;
  const y = args.y as number;

  if (!tokenId || x === undefined || y === undefined) {
    return error('tokenId, x, and y are required');
  }

  // Try canvas tokens first
  if (canvas?.tokens?.placeables) {
    const token = canvas.tokens.placeables.find(
      (t: any) => (t.id ?? t.document?.id) === tokenId
    );

    if (token) {
      const doc = token.document ?? token;
      await doc.update({ x, y });
      return success({
        _id: tokenId,
        x,
        y,
        msg: 'Token moved successfully',
      });
    }
  }

  // Fallback: update scene token directly
  const scene = game.scenes.current;
  if (scene) {
    const sceneToken = scene.tokens?.get(tokenId);
    if (sceneToken) {
      await sceneToken.update({ x, y });
      return success({
        _id: tokenId,
        x,
        y,
        msg: 'Token moved successfully',
      });
    }
  }

  return error(`Token not found: ${tokenId}`);
}

// ─── Actor Extended ────────────────────────────────────────────────

async function getActorItems(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    const actorId = args.actorId as string;
    const typeFilter = args.type as string | undefined;

    if (!actorId) return error('actorId is required');

    const actor = game.actors.get(actorId);
    if (!actor) return error(`Actor not found: ${actorId}`);

    let items = actor.items.contents;
    if (typeFilter) {
      items = items.filter((i: any) => i.type === typeFilter);
    }

    return success(
      items.map((i: any) => ({
        _id: i.id,
        name: i.name,
        type: i.type,
        img: i.img,
        system: i.system,
        quantity: i.system?.quantity ?? 1,
        equipped: i.system?.equipped ?? false,
        identified: i.system?.identified ?? true,
      }))
    );
  } catch (err) {
    return error(`Failed to get actor items: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function getActorSpells(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    const actorId = args.actorId as string;
    const levelFilter = args.level as number | undefined;

    if (!actorId) return error('actorId is required');

    const actor = game.actors.get(actorId);
    if (!actor) return error(`Actor not found: ${actorId}`);

    let spells = actor.items.filter((i: any) => i.type === 'spell');
    if (levelFilter !== undefined) {
      spells = spells.filter((i: any) => i.system?.level === levelFilter);
    }

    const spellSlots = actor.system?.spells ?? {};

    return success({
      spells: spells.map((s: any) => ({
        _id: s.id,
        name: s.name,
        level: s.system?.level,
        school: s.system?.school,
        components: s.system?.components,
        img: s.img,
        system: s.system,
      })),
      spellSlots,
    });
  } catch (err) {
    return error(`Failed to get actor spells: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function updateActorHp(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    const actorId = args.actorId as string;
    const amount = args.amount as number;
    const mode = args.mode as 'damage' | 'heal' | 'set';

    if (!actorId) return error('actorId is required');
    if (amount === undefined) return error('amount is required');
    if (!mode) return error('mode is required (damage, heal, or set)');

    const actor = game.actors.get(actorId);
    if (!actor) return error(`Actor not found: ${actorId}`);

    const hp = actor.system?.attributes?.hp;
    if (!hp) return error('Actor does not have HP attributes');

    const currentHP = hp.value;
    const maxHP = hp.max;
    let newHP: number;

    switch (mode) {
      case 'damage':
        newHP = Math.max(0, currentHP - amount);
        break;
      case 'heal':
        newHP = Math.min(maxHP, currentHP + amount);
        break;
      case 'set':
        newHP = Math.max(0, Math.min(maxHP, amount));
        break;
      default:
        return error(`Invalid mode: ${mode}. Use 'damage', 'heal', or 'set'`);
    }

    await actor.update({ 'system.attributes.hp.value': newHP });

    return success({
      _id: actorId,
      previousHP: currentHP,
      newHP,
      maxHP,
      tempHP: hp.temp ?? 0,
      mode,
    });
  } catch (err) {
    return error(`Failed to update actor HP: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function addItemToActor(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    const actorId = args.actorId as string;
    const itemId = args.itemId as string | undefined;
    const pack = args.pack as string | undefined;
    const data = args.data as Record<string, unknown> | undefined;

    if (!actorId) return error('actorId is required');

    const actor = game.actors.get(actorId);
    if (!actor) return error(`Actor not found: ${actorId}`);

    let itemData: any;

    if (pack && itemId) {
      const compendiumPack = game.packs.get(pack);
      if (!compendiumPack) return error(`Compendium pack not found: ${pack}`);

      const doc = await compendiumPack.getDocument(itemId);
      if (!doc) return error(`Item not found in pack: ${itemId}`);

      itemData = doc.toObject ? doc.toObject() : doc;
    } else if (data) {
      itemData = data;
    } else {
      return error('Either pack+itemId or data must be provided');
    }

    const created = await actor.createEmbeddedDocuments('Item', [itemData]);
    if (!created?.length) return error('Failed to create item on actor');

    return success({
      _id: created[0].id,
      name: created[0].name,
      msg: 'Item added to actor successfully',
    });
  } catch (err) {
    return error(`Failed to add item to actor: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function removeItemFromActor(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    const actorId = args.actorId as string;
    const itemId = args.itemId as string;

    if (!actorId) return error('actorId is required');
    if (!itemId) return error('itemId is required');

    const actor = game.actors.get(actorId);
    if (!actor) return error(`Actor not found: ${actorId}`);

    const item = actor.items.get(itemId);
    if (!item) return error(`Item not found on actor: ${itemId}`);

    await actor.deleteEmbeddedDocuments('Item', [itemId]);

    return success({
      _id: actorId,
      removedItemId: itemId,
      msg: 'Item removed from actor successfully',
    });
  } catch (err) {
    return error(`Failed to remove item from actor: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// ─── Token Extended ────────────────────────────────────────────────

async function updateToken(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    const tokenId = args.tokenId as string;
    const data = args.data as Record<string, unknown>;
    const sceneId = args.sceneId as string | undefined;

    if (!tokenId) return error('tokenId is required');
    if (!data) return error('data is required');

    // Try canvas tokens first
    if (canvas?.tokens?.placeables) {
      const token = canvas.tokens.placeables.find(
        (t: any) => (t.id ?? t.document?.id) === tokenId
      );

      if (token) {
        const doc = (token as any).document ?? token;
        await doc.update(data);
        return success({
          _id: tokenId,
          msg: 'Token updated successfully',
        });
      }
    }

    // Fallback: update scene token directly
    const scene = sceneId
      ? game.scenes.get(sceneId)
      : game.scenes.current;

    if (scene) {
      const sceneToken = scene.tokens?.get(tokenId);
      if (sceneToken) {
        await sceneToken.update(data);
        return success({
          _id: tokenId,
          msg: 'Token updated successfully',
        });
      }
    }

    return error(`Token not found: ${tokenId}`);
  } catch (err) {
    return error(`Failed to update token: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function deleteTokens(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    const tokenIds = args.tokenIds as string[];
    const sceneId = args.sceneId as string | undefined;

    if (!tokenIds?.length) return error('tokenIds is required and must be a non-empty array');

    const scene = sceneId
      ? game.scenes.get(sceneId)
      : game.scenes.current;

    if (!scene) return error(sceneId ? `Scene not found: ${sceneId}` : 'No current scene active');

    await scene.deleteEmbeddedDocuments('Token', tokenIds);

    return success({
      deletedTokenIds: tokenIds,
      msg: `Deleted ${tokenIds.length} token(s)`,
    });
  } catch (err) {
    return error(`Failed to delete tokens: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function toggleTokenCondition(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    const tokenId = args.tokenId as string;
    const condition = args.condition as string;
    const active = args.active as boolean;
    const level = args.level as number | undefined;

    if (!tokenId) return error('tokenId is required');
    if (!condition) return error('condition is required');
    if (active === undefined) return error('active is required');

    // Find token
    let tokenObj: any = null;
    if (canvas?.tokens?.placeables) {
      tokenObj = canvas.tokens.placeables.find(
        (t: any) => (t.id ?? t.document?.id) === tokenId
      );
    }

    if (!tokenObj) {
      const scene = game.scenes.current;
      if (scene) {
        tokenObj = scene.tokens?.get(tokenId);
      }
    }

    if (!tokenObj) return error(`Token not found: ${tokenId}`);

    const actor = tokenObj.actor ?? tokenObj.document?.actor;
    if (!actor) return error(`Token has no associated actor: ${tokenId}`);

    // Handle exhaustion separately
    if (condition.toLowerCase() === 'exhaustion') {
      await actor.update({
        'system.attributes.exhaustion': active ? (level ?? 1) : 0,
      });
      return success({
        _id: actor.id,
        condition: 'exhaustion',
        level: active ? (level ?? 1) : 0,
        msg: 'Exhaustion updated',
      });
    }

    // For other conditions, toggle the status effect
    const statusId = `con${condition}`;
    const effects = actor.effects ?? [];
    const existing = effects.find(
      (e: any) =>
        e.statuses?.has(statusId) ||
        e.statuses?.has(condition) ||
        e.label?.toLowerCase() === condition.toLowerCase()
    );

    if (existing) {
      await existing.update({ disabled: !active });
      return success({
        _id: actor.id,
        condition,
        active,
        effectId: existing.id,
        msg: `Condition ${condition} ${active ? 'enabled' : 'disabled'}`,
      });
    } else if (active) {
      // Create new status effect
      const created = await actor.createEmbeddedDocuments('ActiveEffect', [
        {
          label: condition.charAt(0).toUpperCase() + condition.slice(1),
          icon: `systems/${game.system.id}/icons/conditions/${condition}.svg`,
          statuses: [statusId, condition],
          disabled: false,
        },
      ]);
      return success({
        _id: actor.id,
        condition,
        active: true,
        effectId: created?.[0]?.id,
        msg: `Condition ${condition} applied`,
      });
    }

    return success({
      _id: actor.id,
      condition,
      active: false,
      msg: `Condition ${condition} was not present`,
    });
  } catch (err) {
    return error(`Failed to toggle condition: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// ─── Combat Extended ───────────────────────────────────────────────

async function startCombat(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    const sceneId = args.sceneId as string | undefined;
    const combatantTokenIds = args.combatantTokenIds as string[] | undefined;

    const combatData: Record<string, any> = {};
    if (sceneId) combatData.scene = sceneId;

    const combat = await Combat.create(combatData);
    if (!combat) return error('Failed to create combat');

    // Add combatants if token IDs provided
    if (combatantTokenIds?.length) {
      const combatantData = combatantTokenIds.map((tokenId) => ({ tokenId }));
      await combat.createEmbeddedDocuments('Combatant', combatantData);
    }

    await combat.startCombat();

    return success({
      _id: combat.id,
      active: combat.active,
      round: combat.round,
      msg: 'Combat started',
    });
  } catch (err) {
    return error(`Failed to start combat: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function endCombat(): Promise<QueryResult> {
  try {
    if (!game.combat) return error('No active combat found');

    await game.combat.endCombat();
    return success({ msg: 'Combat ended' });
  } catch (err) {
    return error(`Failed to end combat: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function nextTurn(): Promise<QueryResult> {
  try {
    if (!game.combat) return error('No active combat found');

    await game.combat.nextTurn();
    return success({
      round: game.combat.round,
      turn: game.combat.turn,
      combatant: game.combat.combatant
        ? { _id: game.combat.combatant.id, name: game.combat.combatant.name }
        : null,
      msg: 'Advanced to next turn',
    });
  } catch (err) {
    return error(`Failed to advance turn: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function previousTurn(): Promise<QueryResult> {
  try {
    if (!game.combat) return error('No active combat found');

    await game.combat.previousTurn();
    return success({
      round: game.combat.round,
      turn: game.combat.turn,
      combatant: game.combat.combatant
        ? { _id: game.combat.combatant.id, name: game.combat.combatant.name }
        : null,
      msg: 'Moved to previous turn',
    });
  } catch (err) {
    return error(`Failed to go to previous turn: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function addCombatant(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    if (!game.combat) return error('No active combat found');

    const tokenId = args.tokenId as string | undefined;
    const actorId = args.actorId as string | undefined;
    const name = args.name as string | undefined;
    const hidden = args.hidden as boolean | undefined;

    const combatantData: Record<string, any> = {};
    if (tokenId) combatantData.tokenId = tokenId;
    if (actorId) combatantData.actorId = actorId;
    if (name) combatantData.name = name;
    if (hidden !== undefined) combatantData.hidden = hidden;

    const created = await game.combat.createEmbeddedDocuments('Combatant', [combatantData]);
    if (!created?.length) return error('Failed to create combatant');

    return success({
      _id: created[0].id,
      name: created[0].name,
      msg: 'Combatant added',
    });
  } catch (err) {
    return error(`Failed to add combatant: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function removeCombatant(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    if (!game.combat) return error('No active combat found');

    const combatantId = args.combatantId as string;
    if (!combatantId) return error('combatantId is required');

    await game.combat.deleteEmbeddedDocuments('Combatant', [combatantId]);

    return success({
      removedCombatantId: combatantId,
      msg: 'Combatant removed',
    });
  } catch (err) {
    return error(`Failed to remove combatant: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function rollAllInitiative(): Promise<QueryResult> {
  try {
    if (!game.combat) return error('No active combat found');

    const results: any[] = [];
    for (const combatant of game.combat.combatants) {
      if (combatant.initiative === null || combatant.initiative === undefined) {
        try {
          await combatant.rollInitiative();
          results.push({
            _id: combatant.id,
            name: combatant.name,
            initiative: combatant.initiative,
          });
        } catch {
          results.push({
            _id: combatant.id,
            name: combatant.name,
            error: 'Failed to roll initiative',
          });
        }
      }
    }

    return success({
      rolled: results.length,
      results,
      msg: `Rolled initiative for ${results.length} combatant(s)`,
    });
  } catch (err) {
    return error(`Failed to roll initiative: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function setInitiative(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    if (!game.combat) return error('No active combat found');

    const combatantId = args.combatantId as string;
    const value = args.value as number;

    if (!combatantId) return error('combatantId is required');
    if (value === undefined) return error('value is required');

    const combatant = game.combat.combatants.get(combatantId);
    if (!combatant) return error(`Combatant not found: ${combatantId}`);

    await combatant.update({ initiative: value });

    return success({
      _id: combatantId,
      name: combatant.name,
      initiative: value,
      msg: 'Initiative set',
    });
  } catch (err) {
    return error(`Failed to set initiative: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// ─── Chat ──────────────────────────────────────────────────────────

async function sendChatMessage(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    const content = args.content as string;
    const speaker = args.speaker as string | undefined;
    const type = (args.type as number) ?? 0; // 0=IC, 1=OOC, 2=Emote

    if (!content) return error('content is required');

    const messageData: Record<string, any> = { content, type };
    if (speaker) messageData.speaker = { alias: speaker };

    const msg = await ChatMessage.create(messageData);
    if (!msg) return error('Failed to create chat message');

    return success({
      _id: msg.id,
      content: msg.content,
      type: msg.type,
      msg: 'Chat message sent',
    });
  } catch (err) {
    return error(`Failed to send chat message: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function sendWhisper(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    const content = args.content as string;
    const targetUserId = args.targetUserId as string;
    const speaker = args.speaker as string | undefined;

    if (!content) return error('content is required');
    if (!targetUserId) return error('targetUserId is required');

    const messageData: Record<string, any> = {
      content,
      whisper: [targetUserId],
    };
    if (speaker) messageData.speaker = { alias: speaker };

    const msg = await ChatMessage.create(messageData);
    if (!msg) return error('Failed to create whisper');

    return success({
      _id: msg.id,
      content: msg.content,
      whisper: msg.whisper,
      msg: 'Whisper sent',
    });
  } catch (err) {
    return error(`Failed to send whisper: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// ─── Ownership ─────────────────────────────────────────────────────

async function assignActorOwnership(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    const actorId = args.actorId as string;
    const userId = args.userId as string;
    const level = (args.level as number) ?? 3; // 3 = OWNER

    if (!actorId) return error('actorId is required');
    if (!userId) return error('userId is required');

    const actor = game.actors.get(actorId);
    if (!actor) return error(`Actor not found: ${actorId}`);

    await actor.update({ [`ownership.${userId}`]: level });

    return success({
      _id: actorId,
      userId,
      level,
      msg: 'Actor ownership assigned',
    });
  } catch (err) {
    return error(`Failed to assign ownership: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function removeActorOwnership(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    const actorId = args.actorId as string;
    const userId = args.userId as string;

    if (!actorId) return error('actorId is required');
    if (!userId) return error('userId is required');

    const actor = game.actors.get(actorId);
    if (!actor) return error(`Actor not found: ${actorId}`);

    await actor.update({ [`ownership.${userId}`]: 0 });

    return success({
      _id: actorId,
      userId,
      level: 0,
      msg: 'Actor ownership removed',
    });
  } catch (err) {
    return error(`Failed to remove ownership: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function listActorOwnership(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    const actorId = args.actorId as string;

    if (!actorId) return error('actorId is required');

    const actor = game.actors.get(actorId);
    if (!actor) return error(`Actor not found: ${actorId}`);

    const ownership = actor.ownership ?? {};
    const resolved: any[] = [];

    for (const [userId, level] of Object.entries(ownership)) {
      const user = game.users?.get(userId);
      resolved.push({
        userId,
        userName: user?.name ?? 'Unknown',
        level,
        levelName:
          level === 3 ? 'OWNER' :
          level === 2 ? 'TRUSTED' :
          level === 1 ? 'LIMITED' :
          level === 0 ? 'NONE' : 'INHERIT',
      });
    }

    return success({
      _id: actorId,
      ownership: resolved,
    });
  } catch (err) {
    return error(`Failed to list ownership: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// ─── Macros ────────────────────────────────────────────────────────

async function listMacros(): Promise<QueryResult> {
  try {
    const macros = game.macros.contents.map((m: any) => ({
      _id: m.id,
      name: m.name,
      type: m.type,
      command: m.command,
      author: m.author?.name ?? m.author?.id ?? 'unknown',
    }));

    return success(macros);
  } catch (err) {
    return error(`Failed to list macros: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function executeMacro(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    const name = args.name as string | undefined;
    const id = args.id as string | undefined;

    if (!name && !id) return error('Either name or id must be provided');

    let macro: any = null;
    if (id) {
      macro = game.macros.get(id);
    } else if (name) {
      macro = game.macros.contents.find(
        (m: any) => m.name.toLowerCase() === name.toLowerCase()
      );
    }

    if (!macro) return error(`Macro not found: ${id ?? name}`);

    const result = macro.execute();

    return success({
      _id: macro.id,
      name: macro.name,
      result: result ?? 'executed',
      msg: 'Macro executed',
    });
  } catch (err) {
    return error(`Failed to execute macro: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// ─── Effects ───────────────────────────────────────────────────────

async function listActorEffects(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    const actorId = args.actorId as string;

    if (!actorId) return error('actorId is required');

    const actor = game.actors.get(actorId);
    if (!actor) return error(`Actor not found: ${actorId}`);

    const effects = (actor.effects ?? []).map((e: any) => ({
      _id: e.id,
      name: e.name ?? e.label,
      icon: e.icon,
      disabled: e.disabled,
      duration: e.duration,
      changes: e.changes,
    }));

    return success(effects);
  } catch (err) {
    return error(`Failed to list effects: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function addEffectToActor(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    const actorId = args.actorId as string;
    const name = args.name as string;
    const changes = args.changes as any[] | undefined;
    const duration = args.duration as Record<string, unknown> | undefined;

    if (!actorId) return error('actorId is required');
    if (!name) return error('name is required');

    const actor = game.actors.get(actorId);
    if (!actor) return error(`Actor not found: ${actorId}`);

    const effectData: Record<string, any> = {
      name,
      icon: 'icons/svg/aura.svg',
      disabled: false,
    };
    if (changes?.length) effectData.changes = changes;
    if (duration) effectData.duration = duration;

    const created = await actor.createEmbeddedDocuments('ActiveEffect', [effectData]);
    if (!created?.length) return error('Failed to create effect');

    return success({
      _id: created[0].id,
      name,
      msg: 'Effect added to actor',
    });
  } catch (err) {
    return error(`Failed to add effect: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function removeEffectFromActor(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    const actorId = args.actorId as string;
    const effectId = args.effectId as string;

    if (!actorId) return error('actorId is required');
    if (!effectId) return error('effectId is required');

    const actor = game.actors.get(actorId);
    if (!actor) return error(`Actor not found: ${actorId}`);

    await actor.deleteEmbeddedDocuments('ActiveEffect', [effectId]);

    return success({
      _id: actorId,
      removedEffectId: effectId,
      msg: 'Effect removed from actor',
    });
  } catch (err) {
    return error(`Failed to remove effect: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// ─── Folders ───────────────────────────────────────────────────────

async function listFolders(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    const typeFilter = args.type as string | undefined;

    let folders = game.folders.contents;
    if (typeFilter) {
      folders = folders.filter((f: any) => f.type === typeFilter);
    }

    return success(
      folders.map((f: any) => ({
        _id: f.id,
        name: f.name,
        type: f.type,
        parent: f.folder?.id ?? null,
        children: f.children?.map((c: any) => c.id) ?? [],
      }))
    );
  } catch (err) {
    return error(`Failed to list folders: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function createFolder(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    const name = args.name as string;
    const type = args.type as string;
    const parent = args.parent as string | undefined;

    if (!name) return error('name is required');
    if (!type) return error('type is required');

    const createData: Record<string, any> = { name, type };
    if (parent) createData.folder = parent;

    const folder = await Folder.create(createData);
    if (!folder) return error('Failed to create folder');

    return success({
      _id: folder.id,
      name: folder.name,
      type: folder.type,
      msg: 'Folder created successfully',
    });
  } catch (err) {
    return error(`Failed to create folder: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// ─── Rollable Tables ───────────────────────────────────────────────

async function listRollTables(): Promise<QueryResult> {
  try {
    const tables = game.tables.contents.map((t: any) => ({
      _id: t.id,
      name: t.name,
      description: t.description,
      results: t.results?.size ?? t.results?.length ?? 0,
    }));

    return success(tables);
  } catch (err) {
    return error(`Failed to list roll tables: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function rollTable(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    const tableId = args.tableId as string;

    if (!tableId) return error('tableId is required');

    const table = game.tables.get(tableId);
    if (!table) return error(`Roll table not found: ${tableId}`);

    const draw = await table.draw();

    return success({
      _id: table.id,
      name: table.name,
      roll: draw.roll
        ? { formula: draw.roll.formula, total: draw.roll.total }
        : null,
      results: draw.results?.map((r: any) => ({
        _id: r.id,
        text: r.text,
        type: r.type,
        img: r.img,
        weight: r.weight,
      })) ?? [],
    });
  } catch (err) {
    return error(`Failed to roll table: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// ─── Scene Notes ───────────────────────────────────────────────────

async function getSceneNotes(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    const sceneId = args.sceneId as string | undefined;

    const scene = sceneId
      ? game.scenes.get(sceneId)
      : game.scenes.current;

    if (!scene) return error(sceneId ? `Scene not found: ${sceneId}` : 'No current scene active');

    // Scene notes are embedded JournalEntry pages pinned to the scene
    const notes = (scene.notes ?? []).map((n: any) => ({
      _id: n.id ?? n._id,
      entryId: n.entryId ?? n.entry?.id,
      pageId: n.pageId ?? n.page?.id,
      x: n.x,
      y: n.y,
      icon: n.icon ?? n.texture?.src,
      text: n.text ?? '',
      iconSize: n.iconSize ?? n.size ?? 32,
    }));

    return success({
      sceneId: scene.id,
      sceneName: scene.name,
      notes,
    });
  } catch (err) {
    return error(`Failed to get scene notes: ${err instanceof Error ? err.message : String(err)}`);
  }
}


// ─── Walls ──────────────────────────────────────────────────────────

async function createWall(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    const sceneId = args.sceneId as string | undefined;
    const x1 = args.x1 as number;
    const y1 = args.y1 as number;
    const x2 = args.x2 as number;
    const y2 = args.y2 as number;
    const door = (args.door as boolean) ?? false;
    const doorState = args.doorState as string | undefined;
    const movement = (args.movement as number) ?? 1;
    const sight = (args.sight as number) ?? 1;
    const light = (args.light as number) ?? 1;
    const direction = (args.direction as number) ?? 0;

    if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) {
      return error('x1, y1, x2, y2 are required');
    }

    const scene = sceneId
      ? game.scenes.get(sceneId)
      : game.scenes.current;

    if (!scene) return error(sceneId ? `Scene not found: ${sceneId}` : 'No active scene');

    const wallData: Record<string, any> = {
      c: [x1, y1, x2, y2],
      door: door ? 1 : 0,
      ds: door ? (doorState === 'locked' ? 2 : doorState === 'open' ? 1 : 0) : 0,
      move: movement,
      sense: sight,
      light,
      dir: direction,
    };

    const [wall] = await scene.createEmbeddedDocuments('Wall', [wallData]);
    if (!wall) return error('Failed to create wall');

    return success({
      wallId: wall.id,
      c: wall.c,
      door: wall.door,
      msg: 'Wall created successfully',
    });
  } catch (err) {
    return error(`Failed to create wall: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function createRoom(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    const sceneId = args.sceneId as string | undefined;
    const gx = args.x as number;
    const gy = args.y as number;
    const width = args.width as number;
    const height = args.height as number;
    const doors = args.doors as Array<{
      wall: string;
      position?: number;
      doorState?: string;
    }> | undefined;

    if (gx === undefined || gy === undefined || !width || !height) {
      return error('x, y, width, height are required');
    }

    const scene = sceneId
      ? game.scenes.get(sceneId)
      : game.scenes.current;

    if (!scene) return error(sceneId ? `Scene not found: ${sceneId}` : 'No active scene');

    const gs = scene.grid?.size ?? 100;
    const px = (gridCoord: number) => gridCoord * gs + gs / 2;

    const left = px(gx);
    const right = px(gx + width);
    const top = px(gy);
    const bottom = px(gy + height);

    const wallDocs: Record<string, any>[] = [
      { c: [left, top, right, top], move: 1, sense: 1, light: 1 },       // top
      { c: [left, bottom, right, bottom], move: 1, sense: 1, light: 1 }, // bottom
      { c: [left, top, left, bottom], move: 1, sense: 1, light: 1 },     // left
      { c: [right, top, right, bottom], move: 1, sense: 1, light: 1 },   // right
    ];

    // Add doors
    if (doors?.length) {
      for (const door of doors) {
        const pos = door.position ?? 0.5;
        let wx1: number, wy1: number, wx2: number, wy2: number;

        switch (door.wall) {
          case 'top':
            wx1 = left + (right - left) * pos;
            wy1 = top;
            wx2 = wx1;
            wy2 = top;
            break;
          case 'bottom':
            wx1 = left + (right - left) * pos;
            wy1 = bottom;
            wx2 = wx1;
            wy2 = bottom;
            break;
          case 'left':
            wx1 = left;
            wy1 = top + (bottom - top) * pos;
            wx2 = left;
            wy2 = wy1;
            break;
          case 'right':
            wx1 = right;
            wy1 = top + (bottom - top) * pos;
            wx2 = right;
            wy2 = wy1;
            break;
          default:
            continue;
        }

        const ds = door.doorState === 'locked' ? 2 : door.doorState === 'open' ? 1 : 0;
        wallDocs.push({
          c: [wx1 - 5, wy1, wx2 + 5, wy2],
          door: 1,
          ds,
          move: 1,
          sense: 1,
          light: 1,
        });
      }
    }

    const created = await scene.createEmbeddedDocuments('Wall', wallDocs);

    return success({
      count: created.length,
      walls: created.map((w: any) => ({ id: w.id, c: w.c, door: w.door })),
      msg: `Room created with ${created.length} wall(s)`,
    });
  } catch (err) {
    return error(`Failed to create room: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function createWallGrid(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    const sceneId = args.sceneId as string | undefined;
    const gridX1 = args.gridX1 as number;
    const gridY1 = args.gridY1 as number;
    const gridX2 = args.gridX2 as number;
    const gridY2 = args.gridY2 as number;
    const door = (args.door as boolean) ?? false;
    const doorState = args.doorState as string | undefined;

    if (gridX1 === undefined || gridY1 === undefined || gridX2 === undefined || gridY2 === undefined) {
      return error('gridX1, gridY1, gridX2, gridY2 are required');
    }

    const scene = sceneId
      ? game.scenes.get(sceneId)
      : game.scenes.current;

    if (!scene) return error(sceneId ? `Scene not found: ${sceneId}` : 'No active scene');

    const gs = scene.grid?.size ?? 100;
    const px = (gridCoord: number) => gridCoord * gs + gs / 2;

    const x1 = px(gridX1);
    const y1 = px(gridY1);
    const x2 = px(gridX2);
    const y2 = px(gridY2);

    const wallData: Record<string, any> = {
      c: [x1, y1, x2, y2],
      door: door ? 1 : 0,
      ds: door ? (doorState === 'locked' ? 2 : doorState === 'open' ? 1 : 0) : 0,
      move: 1,
      sense: 1,
      light: 1,
    };

    const [wall] = await scene.createEmbeddedDocuments('Wall', [wallData]);
    if (!wall) return error('Failed to create wall');

    return success({
      wallId: wall.id,
      c: wall.c,
      gridCoords: { gridX1, gridY1, gridX2, gridY2 },
      gridSize: gs,
      msg: `Wall created from grid (${gridX1},${gridY1}) to (${gridX2},${gridY2})`,
    });
  } catch (err) {
    return error(`Failed to create wall from grid coords: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function listWalls(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    const sceneId = args.sceneId as string | undefined;

    const scene = sceneId
      ? game.scenes.get(sceneId)
      : game.scenes.current;

    if (!scene) return error(sceneId ? `Scene not found: ${sceneId}` : 'No active scene');

    const walls = (scene.walls ?? []).map((w: any) => ({
      _id: w.id,
      c: w.c,
      door: w.door,
      ds: w.ds,
      move: w.move,
      sense: w.sense,
      light: w.light,
      dir: w.dir,
    }));

    return success({ sceneId: scene.id, sceneName: scene.name, totalWalls: walls.length, walls });
  } catch (err) {
    return error(`Failed to list walls: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function deleteWall(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    const wallId = args.wallId as string;
    const sceneId = args.sceneId as string | undefined;

    if (!wallId) return error('wallId is required');

    const scene = sceneId
      ? game.scenes.get(sceneId)
      : game.scenes.current;

    if (!scene) return error(sceneId ? `Scene not found: ${sceneId}` : 'No active scene');

    await scene.deleteEmbeddedDocuments('Wall', [wallId]);

    return success({ wallId, msg: 'Wall deleted successfully' });
  } catch (err) {
    return error(`Failed to delete wall: ${err instanceof Error ? err.message : String(err)}`);
  }
}


// ─── Items (World + Compendium) ───────────────────────────────

async function updateItem(args: Record<string, unknown>): Promise<QueryResult> {
  try {
    const id = args.id as string;
    const pack = args.pack as string | undefined;
    const data = args.data as Record<string, unknown>;

    if (!id) return error('id is required');
    if (!data) return error('data is required');

    let item: any = null;

    if (pack) {
      // Compendium item
      const compendiumPack = game.packs.get(pack);
      if (!compendiumPack) return error(`Compendium pack not found: ${pack}`);

      item = await compendiumPack.getDocument(id);
      if (!item) return error(`Item not found in pack: ${id}`);
    } else {
      // World item
      item = game.items?.get(id);
      if (!item) {
        // Search actor-embedded items
        for (const actor of game.actors?.contents ?? []) {
          const actorItem = actor.items?.get(id);
          if (actorItem) {
            item = actorItem;
            break;
          }
        }
        if (!item) return error(`Item not found: ${id} (not in world, compendium, or any actor)`);
      }
    }

    await item.update(data);

    return success({
      _id: item.id,
      name: item.name,
      type: item.type,
      pack: pack ?? null,
      msg: 'Item updated successfully',
    });
  } catch (err) {
    return error(`Failed to update item: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function searchItems(args: Record<string, unknown>): Promise<QueryResult> {
  try {
    const query = (args.query as string)?.toLowerCase();
    const typeFilter = args.type as string | undefined;
    const limit = (args.limit as number) ?? 20;

    if (!query) return error('query is required');

    const results: any[] = [];

    // 1) Search world items
    const worldItems = game.items?.contents ?? [];
    for (const item of worldItems) {
      if (results.length >= limit) break;
      if (item.name?.toLowerCase().includes(query)) {
        if (typeFilter && item.type !== typeFilter) continue;
        results.push({
          source: 'world',
          id: item.id,
          name: item.name,
          type: item.type,
          img: item.img,
          system: item.system,
        });
      }
    }

    // 2) Search compendium packs (items only) — parallel with timeout
    const packs = game.packs.filter(
      (p: any) => !typeFilter || p.metadata?.type === 'Item'
    );

    const itemPackPromises = packs.map(async (pack: any) => {
      try {
        const docs = await Promise.race([
          pack.getDocuments(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
        ]);
        const matches: any[] = [];
        for (const doc of docs) {
          if (matches.length >= limit) break;
          if (doc.name?.toLowerCase().includes(query)) {
            if (typeFilter && doc.type !== typeFilter) continue;
            matches.push({
              source: pack.collection,
              sourceLabel: pack.metadata?.label ?? pack.collection,
              id: doc.id ?? doc._id,
              name: doc.name,
              type: doc.type,
              img: doc.img,
            });
          }
        }
        return matches;
      } catch {
        return [];
      }
    });

    const itemSettled = await Promise.allSettled(itemPackPromises);
    for (const r of itemSettled) {
      if (r.status === 'fulfilled') {
        for (const m of r.value) {
          if (results.length >= limit) break;
          results.push(m);
        }
      }
      if (results.length >= limit) break;
    }

    return success({ total: results.length, results });
  } catch (err) {
    return error(`Failed to search items: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function searchAll(args: Record<string, unknown>): Promise<QueryResult> {
  try {
    const query = (args.query as string)?.toLowerCase();
    const typesFilter = args.types as string[] | undefined;
    const limit = (args.limit as number) ?? 10;

    if (!query) return error('query is required');

    const allResults: Record<string, any[]> = {};

    // Helper to check if a type is allowed
    const isAllowed = (type: string) => !typesFilter || typesFilter.some(t => t.toLowerCase() === type.toLowerCase());

    // 1) World Items
    if (isAllowed('Item')) {
      const worldItems: any[] = [];
      const items = game.items?.contents ?? [];
      for (const item of items) {
        if (worldItems.length >= limit) break;
        if (item.name?.toLowerCase().includes(query)) {
          worldItems.push({
            id: item.id,
            name: item.name,
            type: item.type,
            source: 'world',
            img: item.img,
          });
        }
      }
      if (worldItems.length) allResults.worldItems = worldItems;
    }

    // 2) World Actors
    if (isAllowed('Actor')) {
      const worldActors: any[] = [];
      const actors = game.actors?.contents ?? [];
      for (const actor of actors) {
        if (worldActors.length >= limit) break;
        if (actor.name?.toLowerCase().includes(query)) {
          worldActors.push({
            id: actor.id,
            name: actor.name,
            type: actor.type,
            source: 'world',
            img: actor.img,
          });
        }
      }
      if (worldActors.length) allResults.worldActors = worldActors;
    }

    // 3) Journals
    if (isAllowed('JournalEntry')) {
      const journals: any[] = [];
      const entries = game.journal?.contents ?? [];
      for (const j of entries) {
        if (journals.length >= limit) break;
        if (j.name?.toLowerCase().includes(query)) {
          journals.push({
            id: j.id,
            name: j.name,
            source: 'world',
            folder: j.folder?.name ?? null,
          });
        }
      }
      if (journals.length) allResults.journals = journals;
    }

    // 4) Compendium packs (all types) — parallel with timeout
    const allPackPromises = game.packs.map(async (pack: any) => {
      try {
        const packType = pack.metadata?.type ?? 'unknown';
        if (typesFilter?.length && !typesFilter.some(t => t.toLowerCase() === packType.toLowerCase())) return { key: '', results: [] };

        const docs = await Promise.race([
          pack.getDocuments(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
        ]);
        const packResults: any[] = [];
        for (const doc of docs) {
          if (packResults.length >= limit) break;
          if (doc.name?.toLowerCase().includes(query)) {
            packResults.push({
              id: doc.id ?? doc._id,
              name: doc.name,
              type: doc.type ?? packType,
              source: pack.collection,
              sourceLabel: pack.metadata?.label ?? pack.collection,
              img: doc.img,
            });
          }
        }
        return { key: packResults.length ? `pack_${pack.collection}` : '', results: packResults };
      } catch {
        return { key: '', results: [] };
      }
    });

    const allSettled = await Promise.allSettled(allPackPromises);
    for (const r of allSettled) {
      if (r.status === 'fulfilled' && r.value.key) {
        allResults[r.value.key] = r.value.results;
      }
    }

    // Summary
    const totalResults = Object.values(allResults).reduce((sum, arr) => sum + arr.length, 0);

    return success({ totalResults, sources: allResults });
  } catch (err) {
    return error(`Failed to search all: ${err instanceof Error ? err.message : String(err)}`);
  }
}


