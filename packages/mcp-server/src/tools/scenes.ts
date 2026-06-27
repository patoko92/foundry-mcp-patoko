import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { IFoundryClient } from '../types.js';

export function registerSceneTools(server: McpServer, client: IFoundryClient): void {
  server.tool(
    'list-scenes',
    'List all scenes in the Foundry VTT world',
    {},
    async () => {
      const content = await client.callMethod('list-scenes', {});
      return { content };
    }
  );

  server.tool(
    'get-current-scene',
    'Get the currently active scene with its tokens',
    {},
    async () => {
      const content = await client.callMethod('get-current-scene', {});
      return { content };
    }
  );

  server.tool(
    'switch-scene',
    'Switch to a different scene by ID',
    {
      id: z.string().describe('Scene ID to activate'),
    },
    async (args) => {
      const content = await client.callMethod('switch-scene', args);
      return { content };
    }
  );
}
