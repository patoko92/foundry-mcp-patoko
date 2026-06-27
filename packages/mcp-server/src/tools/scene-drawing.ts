import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { IFoundryClient } from '../types.js';

export function registerSceneDrawingTools(server: McpServer, client: IFoundryClient): void {
  server.tool(
    'get-scene-notes',
    'Get scene notes and journal pins for a scene.',
    {
      sceneId: z.string().optional().describe('Scene ID (defaults to active scene)'),
    },
    async (args) => {
      const content = await client.callMethod('get-scene-notes', args);
      return { content };
    }
  );
}
