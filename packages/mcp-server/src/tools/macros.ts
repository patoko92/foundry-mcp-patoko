import { McpServer } from "@modelcontextprotocol/server";
import { z } from 'zod';
import type { IFoundryClient } from '../types.js';

export function registerMacroTools(server: McpServer, client: IFoundryClient): void {
  server.registerTool('list-macros', { description: 'List all available macros in the Foundry VTT world.', inputSchema: z.object({}) }, async () => {
              const content = await client.callMethod('list-macros', {});
              return { content };
            });

  server.registerTool('execute-macro', { description: 'Execute a macro by name or ID.', inputSchema: z.object({
              name: z.string().optional().describe('Macro name to execute'),
              id: z.string().optional().describe('Macro ID to execute'),
            }) }, async (args) => {
              const content = await client.callMethod('execute-macro', args);
              return { content };
            });
}
