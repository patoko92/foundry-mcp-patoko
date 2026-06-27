import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { IFoundryClient } from '../types.js';

export function registerTokenExtendedTools(server: McpServer, client: IFoundryClient): void {
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
}
