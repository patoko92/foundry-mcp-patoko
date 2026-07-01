// ../../opt/foundry-mcp-patoko/packages/foundry-module/src/settings.ts
var MODULE_ID = "foundry-mcp-patoko";
function registerSettings() {
  game.settings.register(MODULE_ID, "mcpHost", {
    name: "MCP Server Host",
    hint: "Hostname or IP address of the MCP WebSocket server",
    scope: "world",
    config: true,
    type: String,
    default: "100.91.31.34"
  });
  game.settings.register(MODULE_ID, "mcpPort", {
    name: "MCP Server Port",
    hint: "Port number of the MCP WebSocket server",
    scope: "world",
    config: true,
    type: Number,
    default: 31415,
    range: {
      min: 1024,
      max: 65535,
      step: 1
    }
  });
  game.settings.register(MODULE_ID, "mcpNamespace", {
    name: "MCP Namespace",
    hint: "WebSocket namespace path",
    scope: "world",
    config: true,
    type: String,
    default: "/foundry-mcp"
  });
  game.settings.register(MODULE_ID, "autoConnect", {
    name: "Auto Connect",
    hint: "Automatically connect to MCP server on Foundry ready",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });
  game.settings.register(MODULE_ID, "logLevel", {
    name: "Log Level",
    hint: "Verbosity of module log messages",
    scope: "client",
    config: true,
    type: String,
    default: "info",
    choices: {
      debug: "Debug",
      info: "Info",
      warn: "Warning",
      error: "Error"
    }
  });
}
function getSettings() {
  return {
    mcpHost: game.settings.get(MODULE_ID, "mcpHost"),
    mcpPort: game.settings.get(MODULE_ID, "mcpPort"),
    mcpNamespace: game.settings.get(MODULE_ID, "mcpNamespace"),
    autoConnect: game.settings.get(MODULE_ID, "autoConnect"),
    logLevel: game.settings.get(MODULE_ID, "logLevel")
  };
}
var LOG_LEVEL_ORDER = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};
function shouldLog(level) {
  const currentLevel = game.settings.get(MODULE_ID, "logLevel");
  return LOG_LEVEL_ORDER[level] >= LOG_LEVEL_ORDER[currentLevel];
}
var PREFIX = "[MCP Patoko]";
function logDebug(...args) {
  if (shouldLog("debug")) console.log(PREFIX, ...args);
}
function logInfo(...args) {
  if (shouldLog("info")) console.log(PREFIX, ...args);
}
function logWarn(...args) {
  if (shouldLog("warn")) console.warn(PREFIX, ...args);
}
function logError(...args) {
  if (shouldLog("error")) console.error(PREFIX, ...args);
}

// ../../opt/foundry-mcp-patoko/packages/foundry-module/src/query-handler.ts
var WRITE_METHODS = /* @__PURE__ */ new Set([
  "createActor",
  "updateActor",
  "switchScene",
  "createJournal",
  "moveToken",
  "updateActorHp",
  "addItemToActor",
  "removeItemFromActor",
  "updateToken",
  "deleteTokens",
  "toggleTokenCondition",
  "startCombat",
  "endCombat",
  "nextTurn",
  "previousTurn",
  "addCombatant",
  "removeCombatant",
  "rollAllInitiative",
  "setInitiative",
  "sendChatMessage",
  "sendWhisper",
  "assignActorOwnership",
  "removeActorOwnership",
  "executeMacro",
  "addEffectToActor",
  "removeEffectFromActor",
  "createFolder",
  "rollTable"
]);
function success(data) {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
  };
}
function error(message) {
  return {
    content: [{ type: "text", text: message }],
    isError: true
  };
}
function isGM() {
  return game.user?.isGM === true;
}
function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}
async function handleQuery(method, args) {
  try {
    const camelMethod = toCamelCase(method);
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
var methodMap = {
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
  getSceneNotes
};
async function getWorldInfo() {
  const users = game.users.map((u) => ({
    id: u.id,
    name: u.name,
    role: u.role
  }));
  return success({
    id: game.world.id,
    name: game.world.name,
    system: game.system.id,
    systemVersion: game.system.version,
    foundryVersion: game.version || game.data?.version || "unknown",
    title: game.world.title || game.world.name,
    description: game.world.description || "",
    users
  });
}
async function listActors(args) {
  const typeFilter = args.type;
  let actors = game.actors.contents;
  if (typeFilter) {
    actors = actors.filter((a) => a.type === typeFilter);
  }
  const mapped = actors.map((a) => ({
    _id: a.id,
    name: a.name,
    type: a.type,
    img: a.img,
    system: a.system,
    ownership: a.ownership,
    folder: a.folder?.id ?? null
  }));
  return success(mapped);
}
async function getActor(args) {
  const id = args.id;
  const name = args.name;
  if (!id && !name) {
    return error("Either id or name must be provided");
  }
  let actor = null;
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
    items: actor.items?.contents?.map((i) => ({
      _id: i.id,
      name: i.name,
      type: i.type,
      img: i.img,
      system: i.system
    })) ?? [],
    ownership: actor.ownership,
    folder: actor.folder?.id ?? null
  });
}
async function createActor(args) {
  const name = args.name;
  const type = args.type;
  const data = args.data ?? {};
  const folder = args.folder;
  if (!name || !type) {
    return error("name and type are required");
  }
  const createData = { name, type, ...data };
  if (folder) createData.folder = folder;
  const actor = await Actor.create(createData);
  if (!actor) {
    return error("Failed to create actor");
  }
  return success({
    _id: actor.id,
    name: actor.name,
    type: actor.type,
    msg: "Actor created successfully"
  });
}
async function updateActor(args) {
  const id = args.id;
  const data = args.data;
  if (!id || !data) {
    return error("id and data are required");
  }
  const actor = game.actors.get(id);
  if (!actor) {
    return error(`Actor not found: ${id}`);
  }
  await actor.update(data);
  return success({ _id: id, msg: "Actor updated successfully" });
}
async function listScenes() {
  const scenes = game.scenes.contents.map((s) => ({
    _id: s.id,
    name: s.name,
    img: s.img,
    active: s.active,
    width: s.width,
    height: s.height,
    grid: s.grid,
    tokenCount: s.tokens?.size ?? 0
  }));
  return success(scenes);
}
async function getCurrentScene() {
  const scene = game.scenes.current;
  if (!scene) {
    return error("No current scene active");
  }
  return success({
    _id: scene.id,
    name: scene.name,
    img: scene.img,
    active: scene.active,
    width: scene.width,
    height: scene.height,
    grid: scene.grid,
    tokens: scene.tokens?.map((t) => ({
      _id: t.id,
      name: t.name,
      actorId: t.actorId,
      x: t.x,
      y: t.y,
      img: t.img,
      width: t.width,
      height: t.height,
      hidden: t.hidden,
      disposition: t.disposition
    })) ?? []
  });
}
async function switchScene(args) {
  const id = args.id;
  if (!id) return error("Scene id is required");
  const scene = game.scenes.get(id);
  if (!scene) return error(`Scene not found: ${id}`);
  await scene.view();
  return success({ _id: id, msg: "Scene activated" });
}
async function searchCompendium(args) {
  const query = args.query?.toLowerCase();
  const packIds = args.packs;
  const typeFilter = args.type;
  const limit = args.limit ?? 20;
  if (!query) return error("query is required");
  let packs = game.packs.filter(
    (p) => !typeFilter || p.metadata?.type === typeFilter
  );
  if (packIds?.length) {
    packs = packs.filter((p) => packIds.includes(p.collection));
  }
  const results = [];
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
            img: doc.img
          });
        }
      }
    } catch {
    }
  }
  return success(results);
}
async function getCompendiumItem(args) {
  const packId = args.pack;
  const id = args.id;
  if (!packId || !id) return error("pack and id are required");
  const pack = game.packs.get(packId);
  if (!pack) return error(`Compendium pack not found: ${packId}`);
  const doc = await pack.getDocument(id);
  if (!doc) return error(`Document not found in pack: ${id}`);
  const data = doc.toObject ? doc.toObject() : doc;
  return success(data);
}
async function listCompendiumPacks() {
  const packs = game.packs.filter(() => true).map((p) => ({
    id: p.collection,
    label: p.metadata?.label ?? p.collection,
    type: p.metadata?.type ?? "unknown",
    name: p.metadata?.name ?? ""
  }));
  return success(packs);
}
async function getCombatState() {
  const combat = game.combat;
  if (!combat) {
    return success({ active: false, round: 0, turn: 0, combatants: [] });
  }
  const combatants = (combat.combatants ?? []).map((c) => ({
    _id: c.id,
    name: c.name,
    tokenId: c.tokenId,
    actorId: c.actorId,
    initiative: c.initiative,
    hidden: c.hidden
  }));
  return success({
    _id: combat.id,
    active: combat.active,
    round: combat.round,
    turn: combat.turn,
    combatants
  });
}
async function rollDice(args) {
  const formula = args.formula;
  const flavor = args.flavor;
  if (!formula) return error("formula is required");
  const roll = new Roll(formula);
  await roll.evaluate();
  const speakerData = {};
  if (args.speaker) {
    speakerData.alias = args.speaker;
  }
  try {
    await roll.toMessage(
      {
        speaker: speakerData,
        flavor: flavor ?? void 0
      },
      { rollMode: "publicroll" }
    );
  } catch {
  }
  return success({
    formula: roll.formula,
    total: roll.total,
    terms: roll.terms.map((t) => t.toString())
  });
}
async function listJournals() {
  const journals = game.journal.contents.map((j) => ({
    _id: j.id,
    name: j.name,
    content: j.pages?.contents?.[0]?.text?.content?.substring(0, 200) ?? "",
    folder: j.folder?.id ?? null
  }));
  return success(journals);
}
async function searchJournals(args) {
  const query = args.query?.toLowerCase();
  if (!query) return error("query is required");
  const results = game.journal.contents.filter((j) => j.name?.toLowerCase().includes(query)).map((j) => ({
    _id: j.id,
    name: j.name,
    content: j.pages?.contents?.[0]?.text?.content?.substring(0, 200) ?? "",
    folder: j.folder?.id ?? null
  }));
  return success(results);
}
async function createJournal(args) {
  const name = args.name;
  const content = args.content;
  const folder = args.folder;
  if (!name || !content) return error("name and content are required");
  const createData = {
    name,
    pages: [
      {
        name,
        type: "text",
        text: { content, format: 1 }
      }
    ]
  };
  if (folder) createData.folder = folder;
  const journal = await JournalEntry.create(createData);
  if (!journal) return error("Failed to create journal entry");
  return success({
    _id: journal.id,
    name: journal.name,
    msg: "Journal entry created successfully"
  });
}
async function listTokens() {
  if (!canvas?.tokens?.placeables) {
    return success([]);
  }
  const tokens = canvas.tokens.placeables.map((t) => ({
    _id: t.id ?? t.document?.id,
    name: t.name ?? t.document?.name,
    actorId: t.actorId ?? t.document?.actorId,
    x: t.x ?? t.document?.x,
    y: t.y ?? t.document?.y,
    img: t.img ?? t.document?.img,
    width: t.width ?? t.document?.width,
    height: t.height ?? t.document?.height,
    hidden: t.hidden ?? t.document?.hidden,
    disposition: t.disposition ?? t.document?.disposition
  }));
  return success(tokens);
}
async function getTokenDetails(args) {
  const tokenId = args.tokenId;
  if (!tokenId) return error("tokenId is required");
  if (!canvas?.tokens?.placeables) {
    return error("Canvas not available");
  }
  const token = canvas.tokens.placeables.find(
    (t) => (t.id ?? t.document?.id) === tokenId
  );
  if (!token) {
    const scene = game.scenes.current;
    if (scene) {
      const sceneToken = scene.tokens?.get(tokenId);
      if (sceneToken) {
        return success(sceneToken.toObject ? sceneToken.toObject() : sceneToken);
      }
    }
    return error(`Token not found: ${tokenId}`);
  }
  const doc = token.document ?? token;
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
    actor: token.actor ? {
      _id: token.actor.id,
      name: token.actor.name,
      type: token.actor.type
    } : null
  });
}
async function moveToken(args) {
  const tokenId = args.tokenId;
  const x = args.x;
  const y = args.y;
  if (!tokenId || x === void 0 || y === void 0) {
    return error("tokenId, x, and y are required");
  }
  if (canvas?.tokens?.placeables) {
    const token = canvas.tokens.placeables.find(
      (t) => (t.id ?? t.document?.id) === tokenId
    );
    if (token) {
      const doc = token.document ?? token;
      await doc.update({ x, y });
      return success({
        _id: tokenId,
        x,
        y,
        msg: "Token moved successfully"
      });
    }
  }
  const scene = game.scenes.current;
  if (scene) {
    const sceneToken = scene.tokens?.get(tokenId);
    if (sceneToken) {
      await sceneToken.update({ x, y });
      return success({
        _id: tokenId,
        x,
        y,
        msg: "Token moved successfully"
      });
    }
  }
  return error(`Token not found: ${tokenId}`);
}
async function getActorItems(args) {
  try {
    const actorId = args.actorId;
    const typeFilter = args.type;
    if (!actorId) return error("actorId is required");
    const actor = game.actors.get(actorId);
    if (!actor) return error(`Actor not found: ${actorId}`);
    let items = actor.items.contents;
    if (typeFilter) {
      items = items.filter((i) => i.type === typeFilter);
    }
    return success(
      items.map((i) => ({
        _id: i.id,
        name: i.name,
        type: i.type,
        img: i.img,
        system: i.system,
        quantity: i.system?.quantity ?? 1,
        equipped: i.system?.equipped ?? false,
        identified: i.system?.identified ?? true
      }))
    );
  } catch (err) {
    return error(`Failed to get actor items: ${err instanceof Error ? err.message : String(err)}`);
  }
}
async function getActorSpells(args) {
  try {
    const actorId = args.actorId;
    const levelFilter = args.level;
    if (!actorId) return error("actorId is required");
    const actor = game.actors.get(actorId);
    if (!actor) return error(`Actor not found: ${actorId}`);
    let spells = actor.items.filter((i) => i.type === "spell");
    if (levelFilter !== void 0) {
      spells = spells.filter((i) => i.system?.level === levelFilter);
    }
    const spellSlots = actor.system?.spells ?? {};
    return success({
      spells: spells.map((s) => ({
        _id: s.id,
        name: s.name,
        level: s.system?.level,
        school: s.system?.school,
        components: s.system?.components,
        img: s.img,
        system: s.system
      })),
      spellSlots
    });
  } catch (err) {
    return error(`Failed to get actor spells: ${err instanceof Error ? err.message : String(err)}`);
  }
}
async function updateActorHp(args) {
  try {
    const actorId = args.actorId;
    const amount = args.amount;
    const mode = args.mode;
    if (!actorId) return error("actorId is required");
    if (amount === void 0) return error("amount is required");
    if (!mode) return error("mode is required (damage, heal, or set)");
    const actor = game.actors.get(actorId);
    if (!actor) return error(`Actor not found: ${actorId}`);
    const hp = actor.system?.attributes?.hp;
    if (!hp) return error("Actor does not have HP attributes");
    const currentHP = hp.value;
    const maxHP = hp.max;
    let newHP;
    switch (mode) {
      case "damage":
        newHP = Math.max(0, currentHP - amount);
        break;
      case "heal":
        newHP = Math.min(maxHP, currentHP + amount);
        break;
      case "set":
        newHP = Math.max(0, Math.min(maxHP, amount));
        break;
      default:
        return error(`Invalid mode: ${mode}. Use 'damage', 'heal', or 'set'`);
    }
    await actor.update({ "system.attributes.hp.value": newHP });
    return success({
      _id: actorId,
      previousHP: currentHP,
      newHP,
      maxHP,
      tempHP: hp.temp ?? 0,
      mode
    });
  } catch (err) {
    return error(`Failed to update actor HP: ${err instanceof Error ? err.message : String(err)}`);
  }
}
async function addItemToActor(args) {
  try {
    const actorId = args.actorId;
    const itemId = args.itemId;
    const pack = args.pack;
    const data = args.data;
    if (!actorId) return error("actorId is required");
    const actor = game.actors.get(actorId);
    if (!actor) return error(`Actor not found: ${actorId}`);
    let itemData;
    if (pack && itemId) {
      const compendiumPack = game.packs.get(pack);
      if (!compendiumPack) return error(`Compendium pack not found: ${pack}`);
      const doc = await compendiumPack.getDocument(itemId);
      if (!doc) return error(`Item not found in pack: ${itemId}`);
      itemData = doc.toObject ? doc.toObject() : doc;
    } else if (data) {
      itemData = data;
    } else {
      return error("Either pack+itemId or data must be provided");
    }
    const created = await actor.createEmbeddedDocuments("Item", [itemData]);
    if (!created?.length) return error("Failed to create item on actor");
    return success({
      _id: created[0].id,
      name: created[0].name,
      msg: "Item added to actor successfully"
    });
  } catch (err) {
    return error(`Failed to add item to actor: ${err instanceof Error ? err.message : String(err)}`);
  }
}
async function removeItemFromActor(args) {
  try {
    const actorId = args.actorId;
    const itemId = args.itemId;
    if (!actorId) return error("actorId is required");
    if (!itemId) return error("itemId is required");
    const actor = game.actors.get(actorId);
    if (!actor) return error(`Actor not found: ${actorId}`);
    const item = actor.items.get(itemId);
    if (!item) return error(`Item not found on actor: ${itemId}`);
    await actor.deleteEmbeddedDocuments("Item", [itemId]);
    return success({
      _id: actorId,
      removedItemId: itemId,
      msg: "Item removed from actor successfully"
    });
  } catch (err) {
    return error(`Failed to remove item from actor: ${err instanceof Error ? err.message : String(err)}`);
  }
}
async function updateToken(args) {
  try {
    const tokenId = args.tokenId;
    const data = args.data;
    const sceneId = args.sceneId;
    if (!tokenId) return error("tokenId is required");
    if (!data) return error("data is required");
    if (canvas?.tokens?.placeables) {
      const token = canvas.tokens.placeables.find(
        (t) => (t.id ?? t.document?.id) === tokenId
      );
      if (token) {
        const doc = token.document ?? token;
        await doc.update(data);
        return success({
          _id: tokenId,
          msg: "Token updated successfully"
        });
      }
    }
    const scene = sceneId ? game.scenes.get(sceneId) : game.scenes.current;
    if (scene) {
      const sceneToken = scene.tokens?.get(tokenId);
      if (sceneToken) {
        await sceneToken.update(data);
        return success({
          _id: tokenId,
          msg: "Token updated successfully"
        });
      }
    }
    return error(`Token not found: ${tokenId}`);
  } catch (err) {
    return error(`Failed to update token: ${err instanceof Error ? err.message : String(err)}`);
  }
}
async function deleteTokens(args) {
  try {
    const tokenIds = args.tokenIds;
    const sceneId = args.sceneId;
    if (!tokenIds?.length) return error("tokenIds is required and must be a non-empty array");
    const scene = sceneId ? game.scenes.get(sceneId) : game.scenes.current;
    if (!scene) return error(sceneId ? `Scene not found: ${sceneId}` : "No current scene active");
    await scene.deleteEmbeddedDocuments("Token", tokenIds);
    return success({
      deletedTokenIds: tokenIds,
      msg: `Deleted ${tokenIds.length} token(s)`
    });
  } catch (err) {
    return error(`Failed to delete tokens: ${err instanceof Error ? err.message : String(err)}`);
  }
}
async function toggleTokenCondition(args) {
  try {
    const tokenId = args.tokenId;
    const condition = args.condition;
    const active = args.active;
    const level = args.level;
    if (!tokenId) return error("tokenId is required");
    if (!condition) return error("condition is required");
    if (active === void 0) return error("active is required");
    let tokenObj = null;
    if (canvas?.tokens?.placeables) {
      tokenObj = canvas.tokens.placeables.find(
        (t) => (t.id ?? t.document?.id) === tokenId
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
    if (condition.toLowerCase() === "exhaustion") {
      await actor.update({
        "system.attributes.exhaustion": active ? level ?? 1 : 0
      });
      return success({
        _id: actor.id,
        condition: "exhaustion",
        level: active ? level ?? 1 : 0,
        msg: "Exhaustion updated"
      });
    }
    const statusId = `con${condition}`;
    const effects = actor.effects ?? [];
    const existing = effects.find(
      (e) => e.statuses?.has(statusId) || e.statuses?.has(condition) || e.label?.toLowerCase() === condition.toLowerCase()
    );
    if (existing) {
      await existing.update({ disabled: !active });
      return success({
        _id: actor.id,
        condition,
        active,
        effectId: existing.id,
        msg: `Condition ${condition} ${active ? "enabled" : "disabled"}`
      });
    } else if (active) {
      const created = await actor.createEmbeddedDocuments("ActiveEffect", [
        {
          label: condition.charAt(0).toUpperCase() + condition.slice(1),
          icon: `systems/${game.system.id}/icons/conditions/${condition}.svg`,
          statuses: [statusId, condition],
          disabled: false
        }
      ]);
      return success({
        _id: actor.id,
        condition,
        active: true,
        effectId: created?.[0]?.id,
        msg: `Condition ${condition} applied`
      });
    }
    return success({
      _id: actor.id,
      condition,
      active: false,
      msg: `Condition ${condition} was not present`
    });
  } catch (err) {
    return error(`Failed to toggle condition: ${err instanceof Error ? err.message : String(err)}`);
  }
}
async function startCombat(args) {
  try {
    const sceneId = args.sceneId;
    const combatantTokenIds = args.combatantTokenIds;
    const combatData = {};
    if (sceneId) combatData.scene = sceneId;
    const combat = await Combat.create(combatData);
    if (!combat) return error("Failed to create combat");
    if (combatantTokenIds?.length) {
      const combatantData = combatantTokenIds.map((tokenId) => ({ tokenId }));
      await combat.createEmbeddedDocuments("Combatant", combatantData);
    }
    await combat.startCombat();
    return success({
      _id: combat.id,
      active: combat.active,
      round: combat.round,
      msg: "Combat started"
    });
  } catch (err) {
    return error(`Failed to start combat: ${err instanceof Error ? err.message : String(err)}`);
  }
}
async function endCombat() {
  try {
    if (!game.combat) return error("No active combat found");
    await game.combat.endCombat();
    return success({ msg: "Combat ended" });
  } catch (err) {
    return error(`Failed to end combat: ${err instanceof Error ? err.message : String(err)}`);
  }
}
async function nextTurn() {
  try {
    if (!game.combat) return error("No active combat found");
    await game.combat.nextTurn();
    return success({
      round: game.combat.round,
      turn: game.combat.turn,
      combatant: game.combat.combatant ? { _id: game.combat.combatant.id, name: game.combat.combatant.name } : null,
      msg: "Advanced to next turn"
    });
  } catch (err) {
    return error(`Failed to advance turn: ${err instanceof Error ? err.message : String(err)}`);
  }
}
async function previousTurn() {
  try {
    if (!game.combat) return error("No active combat found");
    await game.combat.previousTurn();
    return success({
      round: game.combat.round,
      turn: game.combat.turn,
      combatant: game.combat.combatant ? { _id: game.combat.combatant.id, name: game.combat.combatant.name } : null,
      msg: "Moved to previous turn"
    });
  } catch (err) {
    return error(`Failed to go to previous turn: ${err instanceof Error ? err.message : String(err)}`);
  }
}
async function addCombatant(args) {
  try {
    if (!game.combat) return error("No active combat found");
    const tokenId = args.tokenId;
    const actorId = args.actorId;
    const name = args.name;
    const hidden = args.hidden;
    const combatantData = {};
    if (tokenId) combatantData.tokenId = tokenId;
    if (actorId) combatantData.actorId = actorId;
    if (name) combatantData.name = name;
    if (hidden !== void 0) combatantData.hidden = hidden;
    const created = await game.combat.createEmbeddedDocuments("Combatant", [combatantData]);
    if (!created?.length) return error("Failed to create combatant");
    return success({
      _id: created[0].id,
      name: created[0].name,
      msg: "Combatant added"
    });
  } catch (err) {
    return error(`Failed to add combatant: ${err instanceof Error ? err.message : String(err)}`);
  }
}
async function removeCombatant(args) {
  try {
    if (!game.combat) return error("No active combat found");
    const combatantId = args.combatantId;
    if (!combatantId) return error("combatantId is required");
    await game.combat.deleteEmbeddedDocuments("Combatant", [combatantId]);
    return success({
      removedCombatantId: combatantId,
      msg: "Combatant removed"
    });
  } catch (err) {
    return error(`Failed to remove combatant: ${err instanceof Error ? err.message : String(err)}`);
  }
}
async function rollAllInitiative() {
  try {
    if (!game.combat) return error("No active combat found");
    const results = [];
    for (const combatant of game.combat.combatants) {
      if (combatant.initiative === null || combatant.initiative === void 0) {
        try {
          await combatant.rollInitiative();
          results.push({
            _id: combatant.id,
            name: combatant.name,
            initiative: combatant.initiative
          });
        } catch {
          results.push({
            _id: combatant.id,
            name: combatant.name,
            error: "Failed to roll initiative"
          });
        }
      }
    }
    return success({
      rolled: results.length,
      results,
      msg: `Rolled initiative for ${results.length} combatant(s)`
    });
  } catch (err) {
    return error(`Failed to roll initiative: ${err instanceof Error ? err.message : String(err)}`);
  }
}
async function setInitiative(args) {
  try {
    if (!game.combat) return error("No active combat found");
    const combatantId = args.combatantId;
    const value = args.value;
    if (!combatantId) return error("combatantId is required");
    if (value === void 0) return error("value is required");
    const combatant = game.combat.combatants.get(combatantId);
    if (!combatant) return error(`Combatant not found: ${combatantId}`);
    await combatant.update({ initiative: value });
    return success({
      _id: combatantId,
      name: combatant.name,
      initiative: value,
      msg: "Initiative set"
    });
  } catch (err) {
    return error(`Failed to set initiative: ${err instanceof Error ? err.message : String(err)}`);
  }
}
async function sendChatMessage(args) {
  try {
    const content = args.content;
    const speaker = args.speaker;
    const type = args.type ?? 0;
    if (!content) return error("content is required");
    const messageData = { content, type };
    if (speaker) messageData.speaker = { alias: speaker };
    const msg = await ChatMessage.create(messageData);
    if (!msg) return error("Failed to create chat message");
    return success({
      _id: msg.id,
      content: msg.content,
      type: msg.type,
      msg: "Chat message sent"
    });
  } catch (err) {
    return error(`Failed to send chat message: ${err instanceof Error ? err.message : String(err)}`);
  }
}
async function sendWhisper(args) {
  try {
    const content = args.content;
    const targetUserId = args.targetUserId;
    const speaker = args.speaker;
    if (!content) return error("content is required");
    if (!targetUserId) return error("targetUserId is required");
    const messageData = {
      content,
      whisper: [targetUserId]
    };
    if (speaker) messageData.speaker = { alias: speaker };
    const msg = await ChatMessage.create(messageData);
    if (!msg) return error("Failed to create whisper");
    return success({
      _id: msg.id,
      content: msg.content,
      whisper: msg.whisper,
      msg: "Whisper sent"
    });
  } catch (err) {
    return error(`Failed to send whisper: ${err instanceof Error ? err.message : String(err)}`);
  }
}
async function assignActorOwnership(args) {
  try {
    const actorId = args.actorId;
    const userId = args.userId;
    const level = args.level ?? 3;
    if (!actorId) return error("actorId is required");
    if (!userId) return error("userId is required");
    const actor = game.actors.get(actorId);
    if (!actor) return error(`Actor not found: ${actorId}`);
    await actor.update({ [`ownership.${userId}`]: level });
    return success({
      _id: actorId,
      userId,
      level,
      msg: "Actor ownership assigned"
    });
  } catch (err) {
    return error(`Failed to assign ownership: ${err instanceof Error ? err.message : String(err)}`);
  }
}
async function removeActorOwnership(args) {
  try {
    const actorId = args.actorId;
    const userId = args.userId;
    if (!actorId) return error("actorId is required");
    if (!userId) return error("userId is required");
    const actor = game.actors.get(actorId);
    if (!actor) return error(`Actor not found: ${actorId}`);
    await actor.update({ [`ownership.${userId}`]: 0 });
    return success({
      _id: actorId,
      userId,
      level: 0,
      msg: "Actor ownership removed"
    });
  } catch (err) {
    return error(`Failed to remove ownership: ${err instanceof Error ? err.message : String(err)}`);
  }
}
async function listActorOwnership(args) {
  try {
    const actorId = args.actorId;
    if (!actorId) return error("actorId is required");
    const actor = game.actors.get(actorId);
    if (!actor) return error(`Actor not found: ${actorId}`);
    const ownership = actor.ownership ?? {};
    const resolved = [];
    for (const [userId, level] of Object.entries(ownership)) {
      const user = game.users?.get(userId);
      resolved.push({
        userId,
        userName: user?.name ?? "Unknown",
        level,
        levelName: level === 3 ? "OWNER" : level === 2 ? "TRUSTED" : level === 1 ? "LIMITED" : level === 0 ? "NONE" : "INHERIT"
      });
    }
    return success({
      _id: actorId,
      ownership: resolved
    });
  } catch (err) {
    return error(`Failed to list ownership: ${err instanceof Error ? err.message : String(err)}`);
  }
}
async function listMacros() {
  try {
    const macros = game.macros.contents.map((m) => ({
      _id: m.id,
      name: m.name,
      type: m.type,
      command: m.command,
      author: m.author?.name ?? m.author?.id ?? "unknown"
    }));
    return success(macros);
  } catch (err) {
    return error(`Failed to list macros: ${err instanceof Error ? err.message : String(err)}`);
  }
}
async function executeMacro(args) {
  try {
    const name = args.name;
    const id = args.id;
    if (!name && !id) return error("Either name or id must be provided");
    let macro = null;
    if (id) {
      macro = game.macros.get(id);
    } else if (name) {
      macro = game.macros.contents.find(
        (m) => m.name.toLowerCase() === name.toLowerCase()
      );
    }
    if (!macro) return error(`Macro not found: ${id ?? name}`);
    const result = macro.execute();
    return success({
      _id: macro.id,
      name: macro.name,
      result: result ?? "executed",
      msg: "Macro executed"
    });
  } catch (err) {
    return error(`Failed to execute macro: ${err instanceof Error ? err.message : String(err)}`);
  }
}
async function listActorEffects(args) {
  try {
    const actorId = args.actorId;
    if (!actorId) return error("actorId is required");
    const actor = game.actors.get(actorId);
    if (!actor) return error(`Actor not found: ${actorId}`);
    const effects = (actor.effects ?? []).map((e) => ({
      _id: e.id,
      name: e.name ?? e.label,
      icon: e.icon,
      disabled: e.disabled,
      duration: e.duration,
      changes: e.changes
    }));
    return success(effects);
  } catch (err) {
    return error(`Failed to list effects: ${err instanceof Error ? err.message : String(err)}`);
  }
}
async function addEffectToActor(args) {
  try {
    const actorId = args.actorId;
    const name = args.name;
    const changes = args.changes;
    const duration = args.duration;
    if (!actorId) return error("actorId is required");
    if (!name) return error("name is required");
    const actor = game.actors.get(actorId);
    if (!actor) return error(`Actor not found: ${actorId}`);
    const effectData = {
      name,
      icon: "icons/svg/aura.svg",
      disabled: false
    };
    if (changes?.length) effectData.changes = changes;
    if (duration) effectData.duration = duration;
    const created = await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
    if (!created?.length) return error("Failed to create effect");
    return success({
      _id: created[0].id,
      name,
      msg: "Effect added to actor"
    });
  } catch (err) {
    return error(`Failed to add effect: ${err instanceof Error ? err.message : String(err)}`);
  }
}
async function removeEffectFromActor(args) {
  try {
    const actorId = args.actorId;
    const effectId = args.effectId;
    if (!actorId) return error("actorId is required");
    if (!effectId) return error("effectId is required");
    const actor = game.actors.get(actorId);
    if (!actor) return error(`Actor not found: ${actorId}`);
    await actor.deleteEmbeddedDocuments("ActiveEffect", [effectId]);
    return success({
      _id: actorId,
      removedEffectId: effectId,
      msg: "Effect removed from actor"
    });
  } catch (err) {
    return error(`Failed to remove effect: ${err instanceof Error ? err.message : String(err)}`);
  }
}
async function listFolders(args) {
  try {
    const typeFilter = args.type;
    let folders = game.folders.contents;
    if (typeFilter) {
      folders = folders.filter((f) => f.type === typeFilter);
    }
    return success(
      folders.map((f) => ({
        _id: f.id,
        name: f.name,
        type: f.type,
        parent: f.folder?.id ?? null,
        children: f.children?.map((c) => c.id) ?? []
      }))
    );
  } catch (err) {
    return error(`Failed to list folders: ${err instanceof Error ? err.message : String(err)}`);
  }
}
async function createFolder(args) {
  try {
    const name = args.name;
    const type = args.type;
    const parent = args.parent;
    if (!name) return error("name is required");
    if (!type) return error("type is required");
    const createData = { name, type };
    if (parent) createData.folder = parent;
    const folder = await Folder.create(createData);
    if (!folder) return error("Failed to create folder");
    return success({
      _id: folder.id,
      name: folder.name,
      type: folder.type,
      msg: "Folder created successfully"
    });
  } catch (err) {
    return error(`Failed to create folder: ${err instanceof Error ? err.message : String(err)}`);
  }
}
async function listRollTables() {
  try {
    const tables = game.tables.contents.map((t) => ({
      _id: t.id,
      name: t.name,
      description: t.description,
      results: t.results?.size ?? t.results?.length ?? 0
    }));
    return success(tables);
  } catch (err) {
    return error(`Failed to list roll tables: ${err instanceof Error ? err.message : String(err)}`);
  }
}
async function rollTable(args) {
  try {
    const tableId = args.tableId;
    if (!tableId) return error("tableId is required");
    const table = game.tables.get(tableId);
    if (!table) return error(`Roll table not found: ${tableId}`);
    const draw = await table.draw();
    return success({
      _id: table.id,
      name: table.name,
      roll: draw.roll ? { formula: draw.roll.formula, total: draw.roll.total } : null,
      results: draw.results?.map((r) => ({
        _id: r.id,
        text: r.text,
        type: r.type,
        img: r.img,
        weight: r.weight
      })) ?? []
    });
  } catch (err) {
    return error(`Failed to roll table: ${err instanceof Error ? err.message : String(err)}`);
  }
}
async function getSceneNotes(args) {
  try {
    const sceneId = args.sceneId;
    const scene = sceneId ? game.scenes.get(sceneId) : game.scenes.current;
    if (!scene) return error(sceneId ? `Scene not found: ${sceneId}` : "No current scene active");
    const notes = (scene.notes ?? []).map((n) => ({
      _id: n.id ?? n._id,
      entryId: n.entryId ?? n.entry?.id,
      pageId: n.pageId ?? n.page?.id,
      x: n.x,
      y: n.y,
      icon: n.icon ?? n.texture?.src,
      text: n.text ?? "",
      iconSize: n.iconSize ?? n.size ?? 32
    }));
    return success({
      sceneId: scene.id,
      sceneName: scene.name,
      notes
    });
  } catch (err) {
    return error(`Failed to get scene notes: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// ../../opt/foundry-mcp-patoko/packages/foundry-module/src/ws-client.ts
function generateId() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
var McpWebSocketClient = class {
  ws = null;
  state = "disconnected";
  reconnectTimer = null;
  pingTimer = null;
  reconnectAttempts = 0;
  maxReconnectAttempts = 10;
  baseReconnectDelay = 1e3;
  // ms
  pingInterval = 3e4;
  // 30 seconds
  lastPong = 0;
  /**
   * Connect to the MCP WebSocket server.
   */
  connect() {
    if (this.state === "connecting" || this.state === "connected") {
      logDebug("Already connected or connecting, skipping");
      return;
    }
    const settings = getSettings();
    const url = `ws://${settings.mcpHost}:${settings.mcpPort}${settings.mcpNamespace}`;
    logInfo(`Connecting to ${url}...`);
    this.state = "connecting";
    try {
      this.ws = new WebSocket(url);
    } catch (err) {
      logError("Failed to create WebSocket:", err);
      this.state = "disconnected";
      this.scheduleReconnect();
      return;
    }
    this.ws.onopen = () => this.handleOpen();
    this.ws.onmessage = (event) => this.handleMessage(event);
    this.ws.onclose = (event) => this.handleClose(event);
    this.ws.onerror = (event) => this.handleError(event);
  }
  /**
   * Disconnect from the MCP server.
   */
  disconnect() {
    logInfo("Disconnecting...");
    this.clearTimers();
    this.maxReconnectAttempts = 0;
    if (this.ws) {
      this.ws.close(1e3, "Module disconnect");
      this.ws = null;
    }
    this.state = "disconnected";
  }
  /**
   * Send a typed JSON message to the server.
   */
  send(data) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      logWarn("Cannot send message, WebSocket not open");
      return;
    }
    try {
      this.ws.send(JSON.stringify(data));
    } catch (err) {
      logError("Failed to send message:", err);
    }
  }
  // ─── Connection lifecycle ───────────────────────────────────────
  handleOpen() {
    logInfo("Connected to MCP server");
    this.state = "connected";
    this.reconnectAttempts = 0;
    this.lastPong = Date.now();
    this.sendModuleInfo();
    this.startPingLoop();
    try {
      ui?.notifications?.info?.("[MCP Patoko] Connected to MCP server");
    } catch {
    }
  }
  handleClose(event) {
    logWarn(`WebSocket closed: code=${event.code} reason=${event.reason}`);
    this.state = "disconnected";
    this.clearTimers();
    this.ws = null;
    if (event.code !== 1e3) {
      this.scheduleReconnect();
    }
    try {
      ui?.notifications?.warn?.("[MCP Patoko] Disconnected from MCP server");
    } catch {
    }
  }
  handleError(_event) {
    logError("WebSocket error");
  }
  // ─── Message handling ───────────────────────────────────────────
  handleMessage(event) {
    let data;
    try {
      data = JSON.parse(event.data);
    } catch {
      logWarn("Received non-JSON message:", event.data);
      return;
    }
    logDebug("Received message:", data.type, data.id);
    switch (data.type) {
      case "ping":
        this.send({ type: "pong", id: data.id ?? generateId() });
        break;
      case "pong":
        this.lastPong = Date.now();
        break;
      case "mcp-query":
        this.handleMcpQuery(data);
        break;
      default:
        logDebug("Unknown message type:", data.type);
    }
  }
  async handleMcpQuery(message) {
    const queryId = message.id;
    const method = message.data?.method;
    const args = message.data?.args ?? {};
    logInfo(`Handling query: ${method} (id: ${queryId})`);
    const result = await handleQuery(method, args);
    this.send({
      type: "mcp-response",
      id: queryId,
      data: result
    });
  }
  // ─── Module info ────────────────────────────────────────────────
  sendModuleInfo() {
    try {
      const currentUser = game.user;
      this.send({
        type: "module-info",
        id: generateId(),
        data: {
          worldId: game.world.id,
          worldName: game.world.name,
          systemId: game.system.id,
          systemVersion: game.system.version,
          foundryVersion: game.version || game.data?.version || "unknown",
          userId: currentUser?.id ?? "unknown",
          userName: currentUser?.name ?? "unknown",
          connectedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
    } catch (err) {
      logError("Failed to send module-info:", err);
    }
  }
  // ─── Keepalive ──────────────────────────────────────────────────
  startPingLoop() {
    this.pingTimer = setInterval(() => {
      if (this.state !== "connected") return;
      const timeSincePong = Date.now() - this.lastPong;
      if (timeSincePong > this.pingInterval * 3) {
        logWarn("No pong received, connection may be dead");
        this.ws?.close(4e3, "Keepalive timeout");
        return;
      }
      this.send({ type: "ping", id: generateId() });
    }, this.pingInterval);
  }
  // ─── Reconnect logic ────────────────────────────────────────────
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logError(
        `Max reconnect attempts (${this.maxReconnectAttempts}) reached. Giving up.`
      );
      return;
    }
    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts),
      3e4
    );
    this.reconnectAttempts++;
    logInfo(
      `Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
    );
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }
  // ─── Cleanup ────────────────────────────────────────────────────
  clearTimers() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }
};

// ../../opt/foundry-mcp-patoko/packages/foundry-module/src/main.ts
var client = null;
Hooks.once("init", () => {
  registerSettings();
  logInfo("Initializing Foundry MCP Patoko module");
  const mod = game.modules.get(MODULE_ID);
  if (mod) {
    mod.api = {
      /**
       * Programmatically connect to the MCP server.
       */
      connect: () => {
        if (!client) {
          client = new McpWebSocketClient();
        }
        client.connect();
      },
      /**
       * Programmatically disconnect from the MCP server.
       */
      disconnect: () => {
        client?.disconnect();
      },
      /**
       * Execute an MCP method call directly (useful for testing).
       */
      query: async (method, args = {}) => {
        return handleQuery(method, args);
      },
      /**
       * Get current connection state.
       */
      getConnectionState: () => {
        return client ? "available" : "not initialized";
      }
    };
  }
});
Hooks.once("ready", () => {
  const settings = getSettings();
  logInfo("Foundry MCP Patoko ready");
  if (settings.autoConnect) {
    logInfo("Auto-connect enabled, starting WebSocket client");
    client = new McpWebSocketClient();
    client.connect();
  } else {
    logInfo("Auto-connect disabled. Use the module API to connect manually.");
  }
});
