import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { IFoundryClient } from '../types.js';

export function registerWorldTools(server: McpServer, client: IFoundryClient): void {
  server.tool(
    'get-world-info',
    'Get information about the current Foundry VTT world (name, system, version, users)',
    {},
    async () => {
      const content = await client.callMethod('get-world-info', {});
      return { content };
    }
  );

  server.tool(
    'get-world-users',
    'List all registered users in the current Foundry world with their IDs, names, roles, and active status.',
    {},
    async () => {
      const content = await client.callMethod('get-world-users', {});
      return { content };
    }
  );
}
