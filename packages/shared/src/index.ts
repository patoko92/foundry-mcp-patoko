/**
 * Shared types for foundry-mcp-patoko
 * Defines the WebSocket protocol between MCP Server and Foundry Module
 */

// ============================================================
// WebSocket Message Protocol
// ============================================================

export type MessageType =
  | 'mcp-query'
  | 'mcp-response'
  | 'mcp-error'
  | 'ping'
  | 'pong'
  | 'module-info';

export interface BaseMessage {
  type: MessageType;
  id: string;
}

// MCP Server → Foundry Module
export interface McpQueryMessage extends BaseMessage {
  type: 'mcp-query';
  data: {
    method: string;
    args: Record<string, unknown>;
  };
}

// Foundry Module → MCP Server
export interface McpResponseMessage extends BaseMessage {
  type: 'mcp-response';
  data: {
    content: McpContent[];
    isError?: boolean;
  };
}

export interface McpErrorMessage extends BaseMessage {
  type: 'mcp-error';
  data: {
    error: string;
    code?: string;
  };
}

export interface PingMessage extends BaseMessage {
  type: 'ping';
}

export interface PongMessage extends BaseMessage {
  type: 'pong';
}

export interface ModuleInfoMessage extends BaseMessage {
  type: 'module-info';
  data: {
    worldId: string;
    worldName: string;
    systemId: string;
    systemVersion: string;
    foundryVersion: string;
    userId: string;
    userName: string;
    connectedAt: string;
  };
}

export type WebSocketMessage =
  | McpQueryMessage
  | McpResponseMessage
  | McpErrorMessage
  | PingMessage
  | PongMessage
  | ModuleInfoMessage;

// ============================================================
// MCP Content Types (matches MCP spec)
// ============================================================

export interface McpTextContent {
  type: 'text';
  text: string;
}

export interface McpImageContent {
  type: 'image';
  data: string; // base64
  mimeType: string;
}

export interface McpResourceContent {
  type: 'resource';
  resource: {
    uri: string;
    text: string;
    mimeType?: string;
  };
}

export type McpContent = McpTextContent | McpImageContent | McpResourceContent;

// ============================================================
// Tool Argument Types
// ============================================================

export interface GetActorArgs {
  name?: string;
  id?: string;
}

export interface ListActorsArgs {
  type?: 'character' | 'npc' | 'vehicle';
}

export interface UpdateActorArgs {
  id: string;
  data: Record<string, unknown>;
}

export interface CreateActorArgs {
  name: string;
  type: 'character' | 'npc' | 'vehicle';
  data?: Record<string, unknown>;
  folder?: string;
}

export interface SearchCompendiumArgs {
  query: string;
  packs?: string[];
  type?: string;
  limit?: number;
}

export interface GetCompendiumItemArgs {
  pack: string;
  id: string;
}

export interface ListScenesArgs {}

export interface GetSceneArgs {
  id?: string;
  name?: string;
}

export interface SwitchSceneArgs {
  id: string;
}

export interface CreateSceneArgs {
  name: string;
  width?: number;
  height?: number;
  background?: string;
  gridSize?: number;
  gridType?: number;
  gridDistance?: number;
  gridUnits?: string;
}

export interface ActivateSceneArgs {
  sceneId: string;
}

export interface UpdateSceneArgs {
  id: string;
  data: Record<string, unknown>;
}



export interface RollDiceArgs {
  formula: string;
  flavor?: string;
  speaker?: string;
}

export interface GetWorldInfoArgs {}

export interface GetCombatStateArgs {}

export interface CreateJournalArgs {
  name: string;
  content: string;
  folder?: string;
}

export interface SearchJournalsArgs {
  query: string;
}

export interface MoveTokenArgs {
  tokenId: string;
  x: number;
  y: number;
  sceneId?: string;
}

export interface GetTokenDetailsArgs {
  tokenId: string;
  sceneId?: string;
}

// Actor Extended
export interface GetActorItemsArgs {
  actorId: string;
  type?: string;
}
export interface GetActorSpellsArgs {
  actorId: string;
  level?: number;
}
export interface UpdateActorHpArgs {
  actorId: string;
  amount: number;
  mode: 'damage' | 'heal' | 'set';
}
export interface AddItemToActorArgs {
  actorId: string;
  itemId?: string;
  pack?: string;
  data?: Record<string, unknown>;
}
export interface RemoveItemFromActorArgs {
  actorId: string;
  itemId: string;
}

// Token Extended
export interface UpdateTokenArgs {
  tokenId: string;
  data: Record<string, unknown>;
  sceneId?: string;
}
export interface DeleteTokensArgs {
  tokenIds: string[];
  sceneId?: string;
}
export interface ToggleTokenConditionArgs {
  tokenId: string;
  condition: string;
  active: boolean;
  level?: number;
}

// Combat Extended
export interface StartCombatArgs {
  sceneId?: string;
  combatantTokenIds?: string[];
}
export interface AddCombatantArgs {
  tokenId?: string;
  actorId?: string;
  name?: string;
  hidden?: boolean;
}
export interface RemoveCombatantArgs {
  combatantId: string;
}
export interface SetInitiativeArgs {
  combatantId: string;
  value: number;
}

// Chat
export interface SendChatMessageArgs {
  content: string;
  speaker?: string;
  type?: 'ic' | 'ooc' | 'emote';
}
export interface SendWhisperArgs {
  content: string;
  targetUserId: string;
  speaker?: string;
}

// Ownership
export interface AssignActorOwnershipArgs {
  actorId: string;
  userId: string;
  level?: number;
}
export interface RemoveActorOwnershipArgs {
  actorId: string;
  userId: string;
}
export interface ListActorOwnershipArgs {
  actorId: string;
}

// Macros
export interface ExecuteMacroArgs {
  name?: string;
  id?: string;
}

// Effects
export interface ListActorEffectsArgs {
  actorId: string;
}
export interface AddEffectToActorArgs {
  actorId: string;
  name: string;
  changes: Array<{ key: string; mode: number; value: string }>;
  duration?: Record<string, unknown>;
}
export interface RemoveEffectFromActorArgs {
  actorId: string;
  effectId: string;
}

// Folders
export interface ListFoldersArgs {
  type?: string;
}
export interface CreateFolderArgs {
  name: string;
  type: string;
  parent?: string;
}

// Tables
export interface RollTableArgs {
  tableId: string;
}

// Scene Notes
export interface GetSceneNotesArgs {
  sceneId?: string;
}

// Actor Queries
export interface ListPlayerCharactersArgs {}

export interface GetWorldUsersArgs {}

export interface DeleteActorArgs {
  actorId: string;
}

export interface DeleteActorsByTypeArgs {
  actorType?: string;
  excludeTypes?: string[];
}

// ============================================================
// Foundry Data Types (simplified)
// ============================================================

export interface FoundryActor {
  _id: string;
  name: string;
  type: string;
  img: string;
  system: Record<string, unknown>;
  items?: FoundryItem[];
  ownership?: Record<string, number>;
  folder?: string;
}

export interface FoundryItem {
  _id: string;
  name: string;
  type: string;
  img: string;
  system: Record<string, unknown>;
}

export interface FoundryScene {
  _id: string;
  name: string;
  img: string;
  active: boolean;
  width: number;
  height: number;
  grid: number;
  tokens: FoundryToken[];
}

export interface FoundryToken {
  _id: string;
  name: string;
  actorId: string;
  x: number;
  y: number;
  img: string;
  width: number;
  height: number;
  hidden: boolean;
  disposition: number;
}

export interface FoundryJournal {
  _id: string;
  name: string;
  content: string;
  folder?: string;
}

export interface FoundryCombat {
  _id: string;
  active: boolean;
  round: number;
  turn: number;
  combatants: FoundryCombatant[];
}

export interface FoundryCombatant {
  _id: string;
  name: string;
  tokenId: string;
  actorId: string;
  initiative: number | null;
  hidden: boolean;
}

export interface WorldInfo {
  id: string;
  name: string;
  system: string;
  systemVersion: string;
  foundryVersion: string;
  title: string;
  description: string;
  users: { id: string; name: string; role: number }[];
}

export interface CompendiumResult {
  pack: string;
  packLabel: string;
  id: string;
  name: string;
  type: string;
  img?: string;
  system?: Record<string, unknown>;
}

export interface FoundryMacro {
  _id: string;
  name: string;
  type: string;
  command: string;
  author: string;
}

export interface FoundryActiveEffect {
  _id: string;
  name: string;
  icon: string;
  disabled: boolean;
  duration: Record<string, unknown>;
  changes: Array<{ key: string; mode: number; value: string }>;
}

export interface FoundryFolder {
  _id: string;
  name: string;
  type: string;
  parent: string | null;
  children: string[];
}

export interface FoundryRollTable {
  _id: string;
  name: string;
  description: string;
  results: Array<{ _id: string; text: string; type: number; range: [number, number] }>;
}
