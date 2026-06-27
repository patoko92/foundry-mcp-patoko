/**
 * Mock Foundry VTT WebSocket Server
 *
 * Simulates the Foundry module's WebSocket endpoint, allowing
 * end-to-end testing of the MCP server without a real Foundry VTT instance.
 *
 * Usage:
 *   npm run dev          # development with tsx
 *   npm run build && npm start  # production
 *   PORT=31415 npm start # custom port
 */

import { createServer } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import { randomUUID } from 'node:crypto';
import { handleQuery } from './handlers.js';
import { MODULE_INFO } from './data.js';

import type {
  WebSocketMessage,
  McpQueryMessage,
  McpResponseMessage,
  McpErrorMessage,
  PongMessage,
} from '../../shared/dist/index.js';

const PORT = parseInt(process.env.PORT || '31415', 10);
const PATH = '/foundry-mcp';

function log(msg: string): void {
  process.stderr.write(`[mock-server] ${new Date().toISOString()} ${msg}\n`);
}

// Create HTTP server (needed for path-based routing)
const httpServer = createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Foundry MCP Mock Server is running');
});

// Create WebSocket server attached to HTTP server
const wss = new WebSocketServer({ server: httpServer, path: PATH });

wss.on('connection', (ws: WebSocket, req) => {
  const remoteAddr = req.socket.remoteAddress || 'unknown';
  log(`New connection from ${remoteAddr}`);

  // Send module-info on connect
  const moduleInfo = {
    ...MODULE_INFO,
    id: randomUUID(),
    data: {
      ...MODULE_INFO.data,
      connectedAt: new Date().toISOString(),
    },
  };
  send(ws, moduleInfo);
  log(`Sent module-info to ${remoteAddr}`);

  // Track connection alive state
  let isAlive = true;

  ws.on('pong', () => {
    isAlive = true;
  });

  // Heartbeat interval
  const heartbeat = setInterval(() => {
    if (!isAlive) {
      log(`Terminating stale connection from ${remoteAddr}`);
      clearInterval(heartbeat);
      ws.terminate();
      return;
    }
    isAlive = false;
    ws.ping();
  }, 30000);

  ws.on('message', (raw: Buffer) => {
    let msg: WebSocketMessage;
    try {
      msg = JSON.parse(raw.toString()) as WebSocketMessage;
    } catch {
      log(`Invalid JSON from ${remoteAddr}: ${raw.toString().slice(0, 200)}`);
      return;
    }

    log(`← ${msg.type} [${msg.id}] from ${remoteAddr}`);

    switch (msg.type) {
      case 'mcp-query':
        handleMcpQuery(ws, msg);
        break;

      case 'ping': {
        const pong: PongMessage = { type: 'pong', id: msg.id };
        send(ws, pong);
        log(`→ pong [${msg.id}]`);
        break;
      }

      case 'pong':
        // Client responded to our ping — no action needed
        break;

      default:
        log(`Unhandled message type: ${msg.type}`);
    }
  });

  ws.on('close', (code, reason) => {
    clearInterval(heartbeat);
    log(`Connection closed from ${remoteAddr} (code=${code}, reason=${reason.toString() || 'none'})`);
  });

  ws.on('error', (err) => {
    clearInterval(heartbeat);
    log(`Error from ${remoteAddr}: ${err.message}`);
  });
});

/**
 * Handle an mcp-query message and send back an mcp-response.
 */
function handleMcpQuery(ws: WebSocket, msg: McpQueryMessage): void {
  const { method, args } = msg.data;

  log(`  method=${method}, args=${JSON.stringify(args).slice(0, 200)}`);

  const content = handleQuery(method, args);
  const isError = content.length === 1 &&
    typeof content[0] === 'object' &&
    'text' in content[0] &&
    content[0].text.includes('"error"');

  const response: McpResponseMessage = {
    type: 'mcp-response',
    id: msg.id,
    data: {
      content,
      isError: isError || undefined,
    },
  };

  send(ws, response);
  log(`→ mcp-response [${msg.id}] (${content.length} content blocks)`);
}

/**
 * Send a message over the WebSocket.
 */
function send(ws: WebSocket, msg: WebSocketMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

// Start server
httpServer.listen(PORT, () => {
  log(`Mock Foundry VTT server listening on ws://localhost:${PORT}${PATH}`);
  log(`Press Ctrl+C to stop`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  log('Shutting down...');
  wss.close(() => {
    httpServer.close(() => {
      process.exit(0);
    });
  });
});

process.on('SIGTERM', () => {
  log('Received SIGTERM, shutting down...');
  wss.close(() => {
    httpServer.close(() => {
      process.exit(0);
    });
  });
});
