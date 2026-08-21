import { McpServer } from "@modelcontextprotocol/server";
import { z } from 'zod';
import type { IFoundryClient } from '../types.js';

export function registerTableTools(server: McpServer, client: IFoundryClient): void {
  server.registerTool('list-roll-tables', { description: 'List all rollable tables in the Foundry VTT world.', inputSchema: z.object({}) }, async () => {
              const content = await client.callMethod('list-roll-tables', {});
              return { content };
            });

  server.registerTool('roll-table', { description: 'Roll on a rollable table by ID and get the result.', inputSchema: z.object({
              tableId: z.string().describe('RollTable ID to roll on'),
            }) }, async (args) => {
              const content = await client.callMethod('roll-table', args);
              return { content };
            });
}
