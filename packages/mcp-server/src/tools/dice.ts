import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { IFoundryClient } from '../types.js';

export function registerDiceTools(server: McpServer, client: IFoundryClient): void {
  server.tool(
    'roll-dice',
    'Roll dice using standard notation (e.g. 2d20+5, 8d6, 1d20). Results are displayed in Foundry VTT chat.',
    {
      formula: z.string().describe('Dice formula in standard notation (e.g. 2d20+5, 8d6, 1d20)'),
      flavor: z.string().optional().describe('Flavor text to display with the roll'),
      speaker: z.string().optional().describe('Speaker name for the chat message'),
    },
    async (args) => {
      const content = await client.callMethod('roll-dice', args);
      return { content };
    }
  );
}
