#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
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

  // Serve over stdio via MCP SDK v2 (2026-07-28). serveStdio owns the transport and
  // calls the factory to build the server instance per connection. By default it
  // serves BOTH protocol eras: 2026-07-28 (MCP 2.0) AND legacy 2025-era clients
  // (initialize handshake), so it stays compatible with current MCP clients.
  const handle = serveStdio(() => {
    const server = new McpServer({
      name: 'foundry-mcp-patoko',
      version: '0.1.0',
    });

    // Register all tools
    registerAllTools(server, client);

    return server;
  });

  console.error('[foundry-mcp-patoko] Server started, waiting for connections...');

  // Graceful shutdown
  const shutdown = () => {
    console.error('[foundry-mcp-patoko] Shutting down...');
    void handle.close();
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
