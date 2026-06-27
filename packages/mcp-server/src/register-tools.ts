import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { IFoundryClient } from './types.js';
import { registerWorldTools } from './tools/world.js';
import { registerActorTools } from './tools/actors.js';
import { registerActorExtendedTools } from './tools/actors-extended.js';
import { registerSceneTools } from './tools/scenes.js';
import { registerCompendiumTools } from './tools/compendium.js';
import { registerCombatTools } from './tools/combat.js';
import { registerCombatExtendedTools } from './tools/combat-extended.js';
import { registerDiceTools } from './tools/dice.js';
import { registerJournalTools } from './tools/journals.js';
import { registerTokenTools } from './tools/tokens.js';
import { registerTokenExtendedTools } from './tools/tokens-extended.js';
import { registerChatTools } from './tools/chat.js';
import { registerOwnershipTools } from './tools/ownership.js';
import { registerMacroTools } from './tools/macros.js';
import { registerEffectTools } from './tools/effects.js';
import { registerFolderTools } from './tools/folders.js';
import { registerTableTools } from './tools/tables.js';
import { registerSceneDrawingTools } from './tools/scene-drawing.js';

/**
 * Register all MCP tools on the server.
 */
export function registerAllTools(server: McpServer, client: IFoundryClient): void {
  registerWorldTools(server, client);
  registerActorTools(server, client);
  registerActorExtendedTools(server, client);
  registerSceneTools(server, client);
  registerCompendiumTools(server, client);
  registerCombatTools(server, client);
  registerCombatExtendedTools(server, client);
  registerDiceTools(server, client);
  registerJournalTools(server, client);
  registerTokenTools(server, client);
  registerTokenExtendedTools(server, client);
  registerChatTools(server, client);
  registerOwnershipTools(server, client);
  registerMacroTools(server, client);
  registerEffectTools(server, client);
  registerFolderTools(server, client);
  registerTableTools(server, client);
  registerSceneDrawingTools(server, client);

  console.error('[register-tools] All tools registered');
}
