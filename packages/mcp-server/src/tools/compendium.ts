import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { IFoundryClient } from '../types.js';

export function registerCompendiumTools(server: McpServer, client: IFoundryClient): void {
  server.tool(
    'search-compendium',
    'Search across Foundry VTT compendium packs for items, spells, monsters, etc.',
    {
      query: z.string().describe('Search query string'),
      packs: z.array(z.string()).optional().describe('Limit search to specific pack IDs'),
      type: z.string().optional().describe('Filter by document type (e.g. spell, npc, weapon)'),
      limit: z.number().optional().describe('Maximum number of results to return'),
    },
    async (args) => {
      const content = await client.callMethod('search-compendium', args);
      return { content };
    }
  );

  server.tool(
    'get-compendium-item',
    'Get a specific item from a compendium pack by pack ID and item ID',
    {
      pack: z.string().describe('Compendium pack ID (e.g. dnd5e.spells)'),
      id: z.string().describe('Item ID within the compendium'),
    },
    async (args) => {
      const content = await client.callMethod('get-compendium-item', args);
      return { content };
    }
  );

  server.tool(
    'list-compendium-packs',
    'List all available compendium packs in the Foundry VTT world',
    {},
    async () => {
      const content = await client.callMethod('list-compendium-packs', {});
      return { content };
    }
  );
}
