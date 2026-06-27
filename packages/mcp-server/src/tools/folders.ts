import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { IFoundryClient } from '../types.js';

export function registerFolderTools(server: McpServer, client: IFoundryClient): void {
  server.tool(
    'list-folders',
    'List all folders, optionally filtered by document type.',
    {
      type: z.enum(['Actor', 'Item', 'Scene', 'JournalEntry', 'RollTable']).optional().describe('Filter folders by document type'),
    },
    async (args) => {
      const content = await client.callMethod('list-folders', args);
      return { content };
    }
  );

  server.tool(
    'create-folder',
    'Create a new folder for organizing documents.',
    {
      name: z.string().describe('Name of the new folder'),
      type: z.enum(['Actor', 'Item', 'Scene', 'JournalEntry', 'RollTable']).describe('Document type for the folder'),
      parent: z.string().optional().describe('Parent folder ID (for nested folders)'),
    },
    async (args) => {
      const content = await client.callMethod('create-folder', args);
      return { content };
    }
  );
}
