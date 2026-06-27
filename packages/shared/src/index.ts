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
