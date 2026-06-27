/**
 * Foundry MCP Patoko — Module entry point
 *
 * Bridges the Foundry VTT API to an external MCP server via WebSocket.
 * Runs as a client-side ES module inside Foundry VTT's browser context.
 */

import './types.js';
import { MODULE_ID, registerSettings, getSettings, logInfo } from './settings.js';
import { McpWebSocketClient } from './ws-client.js';
import { handleQuery } from './query-handler.js';

// Module-level client instance
let client: McpWebSocketClient | null = null;

/**
 * Register module settings on init.
 */
Hooks.once('init', () => {
  logInfo('Initializing Foundry MCP Patoko module');
  registerSettings();

  // Expose a public API on the module
  const mod = game.modules.get(MODULE_ID);
  if (mod) {
    (mod as any).api = {
      /**
       * Programmatically connect to the MCP server.
       */
      connect: () => {
        if (!client) {
          client = new McpWebSocketClient();
        }
        client.connect();
      },

      /**
       * Programmatically disconnect from the MCP server.
       */
      disconnect: () => {
        client?.disconnect();
      },

      /**
       * Execute an MCP method call directly (useful for testing).
       */
      query: async (method: string, args: Record<string, unknown> = {}) => {
        return handleQuery(method, args);
      },

      /**
       * Get current connection state.
       */
      getConnectionState: () => {
        return client ? 'available' : 'not initialized';
      },
    };
  }
});

/**
 * On ready, auto-connect to the MCP server if enabled.
 */
Hooks.once('ready', () => {
  const settings = getSettings();

  logInfo('Foundry MCP Patoko ready');

  if (settings.autoConnect) {
    logInfo('Auto-connect enabled, starting WebSocket client');
    client = new McpWebSocketClient();
    client.connect();
  } else {
    logInfo('Auto-connect disabled. Use the module API to connect manually.');
  }
});
