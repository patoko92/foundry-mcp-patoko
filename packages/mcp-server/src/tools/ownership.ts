import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { IFoundryClient } from '../types.js';

export function registerOwnershipTools(server: McpServer, client: IFoundryClient): void {
  server.tool(
    'assign-actor-ownership',
    'Give a player ownership of an actor. Levels: 0=none, 1=limited, 2=observer, 3=owner.',
    {
      actorId: z.string().describe('Actor ID to assign ownership of'),
      userId: z.string().describe('User ID to grant ownership to'),
      level: z.number().min(0).max(3).optional().describe('Ownership level: 0=none, 1=limited, 2=observer, 3=owner'),
    },
    async (args) => {
      const content = await client.callMethod('assign-actor-ownership', args);
      return { content };
    }
  );

  server.tool(
    'remove-actor-ownership',
    'Remove a player\'s ownership of an actor.',
    {
      actorId: z.string().describe('Actor ID to remove ownership from'),
      userId: z.string().describe('User ID to remove ownership from'),
    },
    async (args) => {
      const content = await client.callMethod('remove-actor-ownership', args);
      return { content };
    }
  );

  server.tool(
    'list-actor-ownership',
    'List ownership permissions for an actor.',
    {
      actorId: z.string().describe('Actor ID to list ownership for'),
    },
    async (args) => {
      const content = await client.callMethod('list-actor-ownership', args);
      return { content };
    }
  );
}
