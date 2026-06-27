#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { IFoundryClient } from './types.js';
import { FoundryClient } from './foundry-client.js';
import { MockFoundryClient } from './mock-client.js';
import { registerAllTools } from './register-tools.js';

const isMock = process.env.MOCK === 'true';

async function main(): Promise<void> {
  console.error(`[foundry-mcp-patoko] Starting in ${isMock ? 'MOCK' : 'LIVE'} mode`);

  // Create the appropriate client
  const client: IFoundryClient = isMock ? new MockFoundryClient() : new FoundryClient();

  // Connect to Foundry (or init mock)
  await client.connect();

  // Create MCP server
  const server = new McpServer({
    name: 'foundry-mcp-patoko',
    version: '0.1.0',
  });

  // Register all tools
  registerAllTools(server, client);

  // Connect to stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('[foundry-mcp-patoko] Server started, waiting for connections...');

  // Graceful shutdown
  const shutdown = () => {
    console.error('[foundry-mcp-patoko] Shutting down...');
    client.disconnect();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('[foundry-mcp-patoko] Fatal error:', err);
  process.exit(1);
});
