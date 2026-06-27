import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { IFoundryClient } from '../types.js';

export function registerCombatTools(server: McpServer, client: IFoundryClient): void {
  server.tool(
    'get-combat-state',
    'Get the current combat state (round, turn, combatants, initiative order)',
    {},
    async () => {
      const content = await client.callMethod('get-combat-state', {});
      return { content };
    }
  );

  server.tool(
    'roll-initiative',
    'Roll initiative for a specific combatant in the current combat',
    {
      combatantId: z.string().describe('Combatant ID to roll initiative for'),
    },
    async (args) => {
      const content = await client.callMethod('roll-initiative', args);
      return { content };
    }
  );
}
