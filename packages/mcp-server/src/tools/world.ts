import { McpServer } from "@modelcontextprotocol/server";
import { z } from 'zod';
import type { IFoundryClient } from '../types.js';

export function registerWorldTools(server: McpServer, client: IFoundryClient): void {
  server.registerTool('get-world-info', { description: 'Get information about the current Foundry VTT world (name, system, version, users)', inputSchema: z.object({}) }, async () => {
              const content = await client.callMethod('get-world-info', {});
              return { content };
            });

  server.registerTool('get-world-users', { description: 'List all registered users in the current Foundry world with their IDs, names, roles, and active status.', inputSchema: z.object({}) }, async () => {
              const content = await client.callMethod('get-world-users', {});
              return { content };
            });
}
