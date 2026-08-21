import { McpServer } from "@modelcontextprotocol/server";
import { z } from 'zod';
import type { IFoundryClient } from '../types.js';

export function registerJournalTools(server: McpServer, client: IFoundryClient): void {
  server.registerTool('list-journals', { description: 'List all journal entries in the Foundry VTT world', inputSchema: z.object({}) }, async () => {
              const content = await client.callMethod('list-journals', {});
              return { content };
            });

  server.registerTool('create-journal', { description: 'Create a new journal entry in the Foundry VTT world', inputSchema: z.object({
              name: z.string().describe('Name/title of the journal entry'),
              content: z.string().describe('HTML content for the journal entry'),
              folder: z.string().optional().describe('Folder ID to place the journal in'),
            }) }, async (args) => {
              const content = await client.callMethod('create-journal', args);
              return { content };
            });

  server.registerTool('search-journals', { description: 'Search journal entries by text query (searches names and content)', inputSchema: z.object({
              query: z.string().describe('Search query to match against journal names and content'),
            }) }, async (args) => {
              const content = await client.callMethod('search-journals', args);
              return { content };
            });
}
