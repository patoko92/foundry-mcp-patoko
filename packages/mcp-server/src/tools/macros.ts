import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { IFoundryClient } from '../types.js';

export function registerMacroTools(server: McpServer, client: IFoundryClient): void {
  server.tool(
    'list-macros',
    'List all available macros in the Foundry VTT world.',
    {},
    async () => {
      const content = await client.callMethod('list-macros', {});
      return { content };
    }
  );

  server.tool(
    'execute-macro',
    'Execute a macro by name or ID.',
    {
      name: z.string().optional().describe('Macro name to execute'),
      id: z.string().optional().describe('Macro ID to execute'),
    },
    async (args) => {
      const content = await client.callMethod('execute-macro', args);
      return { content };
    }
  );
}
