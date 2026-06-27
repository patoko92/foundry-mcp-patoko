import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { IFoundryClient } from '../types.js';

export function registerCombatExtendedTools(server: McpServer, client: IFoundryClient): void {
  server.tool(
    'start-combat',
    'Create and start a new combat encounter, optionally adding combatants by token ID.',
    {
      sceneId: z.string().optional().describe('Scene ID for the combat (defaults to active scene)'),
      combatantTokenIds: z.array(z.string()).optional().describe('Token IDs to add as combatants'),
    },
    async (args) => {
      const content = await client.callMethod('start-combat', args);
      return { content };
    }
  );

  server.tool(
    'end-combat',
    'End the current combat encounter.',
    {},
    async () => {
      const content = await client.callMethod('end-combat', {});
      return { content };
    }
  );

  server.tool(
    'next-turn',
    'Advance to the next turn in the current combat.',
    {},
    async () => {
      const content = await client.callMethod('next-turn', {});
      return { content };
    }
  );

  server.tool(
    'previous-turn',
    'Go back to the previous turn in the current combat.',
    {},
    async () => {
      const content = await client.callMethod('previous-turn', {});
      return { content };
    }
  );

  server.tool(
    'add-combatant',
    'Add a token or actor to the current combat encounter.',
    {
      tokenId: z.string().optional().describe('Token ID to add as combatant'),
      actorId: z.string().optional().describe('Actor ID to add as combatant'),
      name: z.string().optional().describe('Custom name for the combatant'),
      hidden: z.boolean().optional().describe('Whether the combatant is hidden from players'),
    },
    async (args) => {
      const content = await client.callMethod('add-combatant', args);
      return { content };
    }
  );

  server.tool(
    'remove-combatant',
    'Remove a combatant from the current combat encounter.',
    {
      combatantId: z.string().describe('Combatant ID to remove'),
    },
    async (args) => {
      const content = await client.callMethod('remove-combatant', args);
      return { content };
    }
  );

  server.tool(
    'roll-all-initiative',
    'Roll initiative for all combatants that do not have initiative yet.',
    {},
    async () => {
      const content = await client.callMethod('roll-all-initiative', {});
      return { content };
    }
  );

  server.tool(
    'set-initiative',
    'Manually set a combatant\'s initiative value.',
    {
      combatantId: z.string().describe('Combatant ID to set initiative for'),
      value: z.number().describe('Initiative value to set'),
    },
    async (args) => {
      const content = await client.callMethod('set-initiative', args);
      return { content };
    }
  );
}
