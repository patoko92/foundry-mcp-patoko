import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { IFoundryClient } from '../types.js';

export function registerItemTools(server: McpServer, client: IFoundryClient): void {
  server.tool(
    'update-item',
    'Update an item by ID (world item or compendium item). Merges data into the item.',
    {
      id: z.string().describe('Item document ID'),
      pack: z.string().optional().describe('Compendium pack ID (optional, for compendium items)'),
      data: z.record(z.unknown()).describe('Data to merge into the item\'s system data'),
    },
    async (args) => {
      const content = await client.callMethod('update-item', args);
      return { content };
    }
  );

  server.tool(
    'search-items',
    'Search across compendium packs AND world items by name. Returns results from both sources.',
    {
      query: z.string().describe('Search query string (matches item names)'),
      type: z.string().optional().describe('Filter by item type (e.g. weapon, spell, equipment)'),
      limit: z.number().optional().describe('Maximum number of results (default 20)'),
    },
    async (args) => {
      const content = await client.callMethod('search-items', args);
      return { content };
    }
  );

  server.tool(
    'search-all',
    'Search across ALL Foundry data: compendium packs, world items, journals, and actors. Unified search that eliminates multi-step lookups.',
    {
      query: z.string().describe('Search query string'),
      types: z.array(z.string()).optional().describe('Filter by document types (e.g. Item, Actor, JournalEntry)'),
      limit: z.number().optional().describe('Maximum number of results per source (default 10)'),
    },
    async (args) => {
      const content = await client.callMethod('search-all', args);
      return { content };
    }
  );
}
