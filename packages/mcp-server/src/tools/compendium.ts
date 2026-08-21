import { McpServer } from "@modelcontextprotocol/server";
import { z } from 'zod';
import type { IFoundryClient } from '../types.js';

export function registerCompendiumTools(server: McpServer, client: IFoundryClient): void {
  server.registerTool('search-compendium', { description: 'Search across Foundry VTT compendium packs for items, spells, monsters, etc.', inputSchema: z.object({
              query: z.string().describe('Search query string'),
              packs: z.array(z.string()).optional().describe('Limit search to specific pack IDs'),
              type: z.string().optional().describe('Filter by document type (e.g. spell, npc, weapon)'),
              limit: z.number().optional().describe('Maximum number of results to return'),
            }) }, async (args) => {
              const content = await client.callMethod('search-compendium', args);
              return { content };
            });

  server.registerTool('get-compendium-item', { description: 'Get a specific item from a compendium pack by pack ID and item ID', inputSchema: z.object({
              pack: z.string().describe('Compendium pack ID (e.g. dnd5e.spells)'),
              id: z.string().describe('Item ID within the compendium'),
            }) }, async (args) => {
              const content = await client.callMethod('get-compendium-item', args);
              return { content };
            });

  server.registerTool('list-compendium-packs', { description: 'List all available compendium packs in the Foundry VTT world', inputSchema: z.object({}) }, async () => {
              const content = await client.callMethod('list-compendium-packs', {});
              return { content };
            });
}
