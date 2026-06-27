import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { IFoundryClient } from '../types.js';

export function registerTableTools(server: McpServer, client: IFoundryClient): void {
  server.tool(
    'list-roll-tables',
    'List all rollable tables in the Foundry VTT world.',
    {},
    async () => {
      const content = await client.callMethod('list-roll-tables', {});
      return { content };
    }
  );

  server.tool(
    'roll-table',
    'Roll on a rollable table by ID and get the result.',
    {
      tableId: z.string().describe('RollTable ID to roll on'),
    },
    async (args) => {
      const content = await client.callMethod('roll-table', args);
      return { content };
    }
  );
}
