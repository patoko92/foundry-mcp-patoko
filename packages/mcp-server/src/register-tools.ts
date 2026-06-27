import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { IFoundryClient } from './types.js';
import { registerWorldTools } from './tools/world.js';
import { registerActorTools } from './tools/actors.js';
import { registerSceneTools } from './tools/scenes.js';
import { registerCompendiumTools } from './tools/compendium.js';
import { registerCombatTools } from './tools/combat.js';
import { registerDiceTools } from './tools/dice.js';
import { registerJournalTools } from './tools/journals.js';
import { registerTokenTools } from './tools/tokens.js';

/**
 * Register all MCP tools on the server.
 */
export function registerAllTools(server: McpServer, client: IFoundryClient): void {
  registerWorldTools(server, client);
  registerActorTools(server, client);
  registerSceneTools(server, client);
  registerCompendiumTools(server, client);
  registerCombatTools(server, client);
  registerDiceTools(server, client);
  registerJournalTools(server, client);
  registerTokenTools(server, client);

  console.error('[register-tools] All tools registered');
}
