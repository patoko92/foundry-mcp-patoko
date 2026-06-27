/**
 * Query handler — dispatches MCP method calls to Foundry VTT API.
 * All Foundry API access is wrapped in try/catch for safety.
 * Write operations require GM permissions.
 */

const WRITE_METHODS = new Set([
  'createActor',
  'updateActor',
  'switchScene',
  'createJournal',
  'moveToken',
  'updateActorHp',
  'addItemToActor',
  'removeItemFromActor',
  'updateToken',
  'deleteTokens',
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

  for (const pack of packs) {
    if (results.length >= limit) break;
    try {
      const docs = await pack.getDocuments();
      for (const doc of docs) {
        if (results.length >= limit) break;
        if (doc.name?.toLowerCase().includes(query)) {
          results.push({
            pack: pack.collection,
            packLabel: pack.metadata?.label ?? pack.collection,
            id: doc.id ?? doc._id,
            name: doc.name,
            type: doc.type ?? pack.metadata?.type,
            img: doc.img,
          });
        }
      }
    } catch {
      // Skip packs that fail to load
    }
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
