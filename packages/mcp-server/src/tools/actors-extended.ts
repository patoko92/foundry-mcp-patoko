import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { IFoundryClient } from '../types.js';

export function registerActorExtendedTools(server: McpServer, client: IFoundryClient): void {
  server.tool(
    'get-actor-items',
    'Get all items for an actor (inventory, spells, features, weapons, armor). Optionally filter by item type.',
    {
      actorId: z.string().describe('Actor ID to get items for'),
      type: z.enum(['weapon', 'equipment', 'consumable', 'spell', 'feature', 'loot', 'class', 'race', 'background']).optional().describe('Filter items by type'),
    },
    async (args) => {
      const content = await client.callMethod('get-actor-items', args);
      return { content };
    }
  );

  server.tool(
    'get-actor-spells',
    'Get spells for an actor with spell slot information. Optionally filter by spell level.',
    {
      actorId: z.string().describe('Actor ID to get spells for'),
      level: z.number().optional().describe('Filter spells by level (0 for cantrips)'),
    },
    async (args) => {
      const content = await client.callMethod('get-actor-spells', args);
      return { content };
    }
  );

  server.tool(
    'update-actor-hp',
    'Quick HP modify: damage, heal, or set to a specific value.',
    {
      actorId: z.string().describe('Actor ID to modify HP for'),
      amount: z.number().describe('Amount of damage, healing, or new HP value'),
      mode: z.enum(['damage', 'heal', 'set']).describe('Mode: damage (reduce HP), heal (increase HP), or set (set to exact value)'),
    },
    async (args) => {
      const content = await client.callMethod('update-actor-hp', args);
      return { content };
    }
  );

  server.tool(
    'add-item-to-actor',
    'Add an item to an actor from a compendium or inline data.',
    {
      actorId: z.string().describe('Actor ID to add the item to'),
      itemId: z.string().optional().describe('Item ID from a compendium'),
      pack: z.string().optional().describe('Compendium pack ID (e.g. dnd5e.items)'),
      data: z.record(z.unknown()).optional().describe('Inline item data to create directly'),
    },
    async (args) => {
      const content = await client.callMethod('add-item-to-actor', args);
      return { content };
    }
  );

  server.tool(
    'remove-item-from-actor',
    'Remove an item from an actor by item ID.',
    {
      actorId: z.string().describe('Actor ID to remove the item from'),
      itemId: z.string().describe('Item ID to remove'),
    },
    async (args) => {
      const content = await client.callMethod('remove-item-from-actor', args);
      return { content };
    }
  );

  server.tool(
    'delete-actor',
    'Delete an actor from the world by ID.',
    {
      actorId: z.string().describe('The _id of the actor to delete'),
    },
    async (args) => {
      const content = await client.callMethod('delete-actor', args);
      return { content };
    }
  );

  server.tool(
    'delete-actors-by-type',
    'Delete all actors matching a type (e.g. npc) or excluding types (e.g. keep only character). Useful for batch cleanup.',
    {
      actorType: z.string().optional().describe('Actor type to delete (e.g. npc, character, vehicle)'),
      excludeTypes: z.array(z.string()).optional().describe('Actor types to keep (skip deletion)'),
    },
    async (args) => {
      const content = await client.callMethod('delete-actors-by-type', args);
      return { content };
    }
  );
}
