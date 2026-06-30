import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { IFoundryClient } from '../types.js';

export function registerActorTools(server: McpServer, client: IFoundryClient): void {
  server.tool(
    'list-actors',
    'List all actors in the Foundry VTT world, optionally filtered by type (character, npc, vehicle)',
    {
      type: z.enum(['character', 'npc', 'vehicle']).optional().describe('Filter actors by type'),
    },
    async (args) => {
      const content = await client.callMethod('list-actors', args);
      return { content };
    }
  );

  server.tool(
    'get-actor',
    'Get detailed information about a specific actor by name or ID',
    {
      name: z.string().optional().describe('Actor name to search for'),
      id: z.string().optional().describe('Actor ID to look up'),
    },
    async (args) => {
      const content = await client.callMethod('get-actor', args);
      return { content };
    }
  );

  server.tool(
    'create-actor',
    'Create a new actor in the Foundry VTT world',
    {
      name: z.string().describe('Name of the new actor'),
      type: z.enum(['character', 'npc', 'vehicle']).describe('Type of actor'),
      data: z.record(z.unknown()).optional().describe('System-specific data for the actor'),
      folder: z.string().optional().describe('Folder ID to place the actor in'),
    },
    async (args) => {
      const content = await client.callMethod('create-actor', args);
      return { content };
    }
  );

  server.tool(
    'update-actor',
    'Update an existing actor\'s data by ID',
    {
      id: z.string().describe('Actor ID to update'),
      data: z.record(z.unknown()).describe('Data to merge into the actor\'s system data'),
    },
    async (args) => {
      const content = await client.callMethod('update-actor', args);
      return { content };
    }
  );

  server.tool(
    'list-player-characters',
    'List all player characters (actors of type character) with their owner info, HP, and level. Compact summary — much lighter than list-actors for this specific query.',
    {},
    async () => {
      const content = await client.callMethod('list-player-characters', {});
      return { content };
    }
  );
}
