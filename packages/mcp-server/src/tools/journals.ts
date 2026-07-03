import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { IFoundryClient } from '../types.js';

export function registerJournalTools(server: McpServer, client: IFoundryClient): void {
  server.tool(
    'list-journals',
    'List all journal entries in the Foundry VTT world',
    {},
    async () => {
      const content = await client.callMethod('list-journals', {});
      return { content };
    }
  );

  server.tool(
    'create-journal',
    'Create a new journal entry in the Foundry VTT world',
    {
      name: z.string().describe('Name/title of the journal entry'),
      content: z.string().describe('HTML content for the journal entry'),
      folder: z.string().optional().describe('Folder ID to place the journal in'),
    },
    async (args) => {
      const content = await client.callMethod('create-journal', args);
      return { content };
    }
  );
}
