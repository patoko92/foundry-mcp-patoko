import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { IFoundryClient } from '../types.js';

export function registerTokenTools(server: McpServer, client: IFoundryClient): void {
  server.tool(
    'list-tokens',
    'List all tokens on a scene (defaults to current active scene)',
    {
      sceneId: z.string().optional().describe('Scene ID to list tokens from (defaults to active scene)'),
    },
    async (args) => {
      const content = await client.callMethod('list-tokens', args);
      return { content };
    }
  );

  server.tool(
    'get-token-details',
    'Get detailed information about a specific token by ID',
    {
      tokenId: z.string().describe('Token ID to look up'),
      sceneId: z.string().optional().describe('Scene ID to search in (defaults to active scene)'),
    },
    async (args) => {
      const content = await client.callMethod('get-token-details', args);
      return { content };
    }
  );

  server.tool(
    'move-token',
    'Move a token to a new position on the scene grid',
    {
      tokenId: z.string().describe('Token ID to move'),
      x: z.number().describe('New X coordinate on the grid'),
      y: z.number().describe('New Y coordinate on the grid'),
      sceneId: z.string().optional().describe('Scene ID (defaults to active scene)'),
    },
    async (args) => {
      const content = await client.callMethod('move-token', args);
      return { content };
    }
  );
}
