import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { IFoundryClient } from '../types.js';

export function registerEffectTools(server: McpServer, client: IFoundryClient): void {
  server.tool(
    'list-actor-effects',
    'List all active effects on an actor.',
    {
      actorId: z.string().describe('Actor ID to list effects for'),
    },
    async (args) => {
      const content = await client.callMethod('list-actor-effects', args);
      return { content };
    }
  );

  server.tool(
    'add-effect-to-actor',
    'Add an active effect to an actor with specified changes.',
    {
      actorId: z.string().describe('Actor ID to add the effect to'),
      name: z.string().describe('Name of the effect'),
      changes: z.array(z.object({
        key: z.string().describe('The property key affected (e.g. system.abilities.str.value)'),
        mode: z.number().describe('Change mode (0=custom, 1=multiply, 2=add, 3=downgrade, 4=upgrade, 5=override)'),
        value: z.string().describe('The value to apply'),
      })).describe('Array of changes the effect applies'),
      duration: z.record(z.unknown()).optional().describe('Duration configuration (e.g. { seconds: 60, rounds: 10 })'),
    },
    async (args) => {
      const content = await client.callMethod('add-effect-to-actor', args);
      return { content };
    }
  );

  server.tool(
    'remove-effect-from-actor',
    'Remove an active effect from an actor.',
    {
      actorId: z.string().describe('Actor ID to remove the effect from'),
      effectId: z.string().describe('Effect ID to remove'),
    },
    async (args) => {
      const content = await client.callMethod('remove-effect-from-actor', args);
      return { content };
    }
  );
}
