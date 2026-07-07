import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { IFoundryClient } from '../types.js';

export function registerTokenTools(server: McpServer, client: IFoundryClient): void {
  server.tool(
    'list-tokens',
    'List all tokens on a scene. Without sceneId: scans ALL scenes and groups tokens by scene. With sceneId: returns tokens from that specific scene only.',
    {
      sceneId: z.string().optional().describe('Scene ID to list tokens from. Omit to scan all scenes.'),
    },
    async (args) => {
      const content = await client.callMethod('list-tokens', args);
      return { content };
    }
  );

  server.tool(
    'get-token-details',
    'Get detailed information about a specific token by ID. Without sceneId: searches canvas first, then all scenes. With sceneId: looks only on that scene.',
    {
      tokenId: z.string().describe('Token ID to look up'),
      sceneId: z.string().optional().describe('Scene ID to search in (optional — searches all scenes if omitted)'),
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

  server.tool(
    'move-token-grid',
    'Move a token to a grid-relative position. Auto-calculates pixel coordinates from grid column/row.',
    {
      tokenId: z.string().describe('Token ID to move'),
      gridX: z.number().describe('Target grid column (0-indexed from left)'),
      gridY: z.number().describe('Target grid row (0-indexed from top)'),
      sceneId: z.string().optional().describe('Scene ID (defaults to active scene)'),
    },
    async (args) => {
      const content = await client.callMethod('move-token-grid', args);
      return { content };
    }
  );

  server.tool(
    'update-token',
    'Update token properties such as image, name, disposition, hidden status, or elevation.',
    {
      tokenId: z.string().describe('Token ID to update'),
      data: z.record(z.unknown()).describe('Token properties to update (e.g. img, name, disposition, hidden, elevation)'),
      sceneId: z.string().optional().describe('Scene ID (defaults to active scene)'),
    },
    async (args) => {
      const content = await client.callMethod('update-token', args);
      return { content };
    }
  );

  server.tool(
    'delete-tokens',
    'Delete one or more tokens from a scene.',
    {
      tokenIds: z.array(z.string()).describe('Array of token IDs to delete'),
      sceneId: z.string().optional().describe('Scene ID (defaults to active scene)'),
    },
    async (args) => {
      const content = await client.callMethod('delete-tokens', args);
      return { content };
    }
  );

  server.tool(
    'toggle-token-condition',
    'Add or remove a condition on a token (e.g. blinded, charmed, frightened, grappled, incapacitated, invisible, paralyzed, petrified, poisoned, prone, restrained, stunned, unconscious, exhaustion).',
    {
      tokenId: z.string().describe('Token ID to toggle condition on'),
      condition: z.string().describe('Condition name (e.g. blinded, charmed, frightened, grappled, incapacitated, invisible, paralyzed, petrified, poisoned, prone, restrained, stunned, unconscious, exhaustion)'),
      active: z.boolean().describe('Whether to add (true) or remove (false) the condition'),
      level: z.number().optional().describe('Condition level (e.g. exhaustion level)'),
    },
    async (args) => {
      const content = await client.callMethod('toggle-token-condition', args);
      return { content };
    }
  );

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
}
