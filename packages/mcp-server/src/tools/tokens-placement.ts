import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { IFoundryClient } from '../types.js';

export function registerTokenPlacementTools(server: McpServer, client: IFoundryClient): void {
  server.tool(
    'place-token',
    'Place an actor as a token on a scene at given pixel coordinates.',
    {
      actorId: z.string().describe('The _id of the actor to place'),
      sceneId: z.string().optional().describe('Target scene ID (defaults to currently active scene)'),
      x: z.number().describe('X coordinate in pixels'),
      y: z.number().describe('Y coordinate in pixels'),
      name: z.string().optional().describe('Token display name (defaults to actor name)'),
      scale: z.number().optional().describe('Token scale (default: 1)'),
    },
    async (args) => {
      const content = await client.callMethod('place-token', args);
      return { content };
    }
  );

  server.tool(
    'place-token-grid',
    'Place a token at a grid-relative position. Auto-calculates pixel coordinates from grid column/row based on the scene grid size.',
    {
      actorId: z.string().describe('Actor to place as a token'),
      sceneId: z.string().optional().describe('Scene ID (defaults to active scene)'),
      gridX: z.number().describe('Grid column (0-indexed from left)'),
      gridY: z.number().describe('Grid row (0-indexed from top)'),
      name: z.string().optional().describe('Token display name'),
    },
    async (args) => {
      const content = await client.callMethod('place-token-grid', args);
      return { content };
    }
  );

  server.tool(
    'move-token-grid',
    'Move a token to a grid-relative position. Auto-calculates pixel coordinates from grid column/row.',
    {
      tokenId: z.string().describe('Token ID to move'),
      gridX: z.number().describe('Target grid column (0-indexed from left)'),
      gridY: z.number().describe('Target grid row (0-indexed from top)'),
    },
    async (args) => {
      const content = await client.callMethod('move-token-grid', args);
      return { content };
    }
  );
}
