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
    'Move a token to a new position. Provide either pixel coordinates (x, y) or grid coordinates (gridX, gridY) — not both.',
    {
      tokenId: z.string().describe('Token ID to move'),
      x: z.number().optional().describe('X coordinate in pixels'),
      y: z.number().optional().describe('Y coordinate in pixels'),
      gridX: z.number().optional().describe('Grid column (0-indexed from left)'),
      gridY: z.number().optional().describe('Grid row (0-indexed from top)'),
      sceneId: z.string().optional().describe('Scene ID (defaults to active scene)'),
    },
    async (args) => {
      const content = await client.callMethod('move-token', args);
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
    'Place an actor as a token on a scene. Provide either pixel coordinates (x, y) or grid coordinates (gridX, gridY) — not both.',
    {
      actorId: z.string().describe('The _id of the actor to place'),
      sceneId: z.string().optional().describe('Target scene ID (defaults to currently active scene)'),
      x: z.number().optional().describe('X coordinate in pixels'),
      y: z.number().optional().describe('Y coordinate in pixels'),
      gridX: z.number().optional().describe('Grid column (0-indexed from left)'),
      gridY: z.number().optional().describe('Grid row (0-indexed from top)'),
      name: z.string().optional().describe('Token display name (defaults to actor name)'),
      scale: z.number().optional().describe('Token scale (default: 1)'),
    },
    async (args) => {
      const content = await client.callMethod('place-token', args);
      return { content };
    }
  );
}
