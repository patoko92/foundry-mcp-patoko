/**
 * WebSocket Bridge Server for foundry-mcp-patoko
 *
 * Routes MCP queries from the MCP server (stdio wrapper) to the
 * Foundry VTT module (browser) and relays responses back.
 *
 * Architecture:
 *   MCP Server ←stdio→ Hermes Agent
 *        ↓ (WebSocket)
 *   Bridge Server (this) ← listens on 0.0.0.0:31415/foundry-mcp
 *        ↓ (WebSocket)
 *   Foundry Module (browser on sv2)
 *
 * Client types:
 *   - "foundry": The Foundry module (browser). Sends module-info on connect.
 *   - "mcp": The MCP server (stdio wrapper). Waits for forwarded responses.
 *
 * Message flow:
 *   MCP → bridge → Foundry (mcp-query)
 *   Foundry → bridge → MCP (mcp-response / mcp-error)
 */

import { createServer, type IncomingMessage } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import { randomUUID } from 'node:crypto';

// ============================================================
// Config
// ============================================================

const PORT = parseInt(process.env.PORT || '31415', 10);
const PATH = '/foundry-mcp';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info'; // debug, info, warn, error

// ============================================================
// Types
// ============================================================

interface ClientInfo {
  ws: WebSocket;
  type: 'foundry' | 'mcp';
  id: string;
  remoteAddr: string;
  connectedAt: Date;
  moduleInfo?: Record<string, unknown>;
}

interface PendingQuery {
  mcpClientId: string;
  queryId: string;
  sentAt: Date;
}

// ============================================================
// State
// ============================================================

const clients = new Map<string, ClientInfo>();
const pendingQueries = new Map<string, PendingQuery>(); // queryId → PendingQuery

let foundryClient: ClientInfo | null = null;
let mcpClients: ClientInfo[] = [];

// ============================================================
// Logging
// ============================================================

const LOG_LEVELS: Record<string, number> = { debug: 0, info: 1, warn: 2, error: 3 };

function log(level: string, msg: string): void {
  if ((LOG_LEVELS[level] ?? 0) >= (LOG_LEVELS[LOG_LEVEL] ?? 1)) {
    process.stderr.write(`[bridge] ${new Date().toISOString()} [${level.toUpperCase()}] ${msg}\n`);
  }
}

// ============================================================
// Helpers
// ============================================================

function send(ws: WebSocket, data: Record<string, unknown>): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function generateId(): string {
  return randomUUID();
}

// ============================================================
// HTTP + WebSocket Server
// ============================================================

const httpServer = createServer((req, res) => {
  // Health check endpoint
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      foundryConnected: !!foundryClient,
      mcpClients: mcpClients.length,
      pendingQueries: pendingQueries.size,
    }));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Foundry MCP Bridge Server');
});

const wss = new WebSocketServer({ server: httpServer, path: PATH });

// ============================================================
// Connection Handling
// ============================================================

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
  const remoteAddr = req.socket.remoteAddress || 'unknown';
  const clientId = generateId();

  log('info', `New connection from ${remoteAddr} (${clientId})`);

  // Temporarily store as unidentified
  const client: ClientInfo = {
    ws,
    type: 'mcp', // default, will be updated
    id: clientId,
    remoteAddr,
    connectedAt: new Date(),
  };

  clients.set(clientId, client);

  // Timeout: if client doesn't identify within 5s, close
  const identifyTimeout = setTimeout(() => {
    if (!client.moduleInfo && client.type === 'mcp') {
      // MCP clients don't need to send anything — they just wait
      // Only close if this looks like an unidentified Foundry module
      log('debug', `Client ${clientId} didn't send module-info (assuming MCP client)`);
    }
  }, 5000);

  // Heartbeat
  let isAlive = true;
  const heartbeat = setInterval(() => {
    if (!isAlive) {
      log('warn', `Stale connection from ${remoteAddr} (${clientId}), terminating`);
      clearInterval(heartbeat);
      ws.terminate();
      return;
    }
    isAlive = false;
    ws.ping();
  }, 30000);

  ws.on('pong', () => {
    isAlive = true;
  });

  ws.on('message', (raw: Buffer) => {
    let msg: Record<string, unknown>;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      log('warn', `Invalid JSON from ${clientId}: ${raw.toString().slice(0, 100)}`);
      return;
    }

    const type = msg.type as string;

    // ---- Client Identification ----
    if (type === 'module-info') {
      // This is a Foundry module client
      client.type = 'foundry';
      client.moduleInfo = msg.data as Record<string, unknown>;

      const data = msg.data as Record<string, unknown>;
      log('info', `Foundry module identified: world="${data.worldId}", system="${data.systemId}", user="${data.userName}"`);

      // If there's already a Foundry client, disconnect the old one
      if (foundryClient && foundryClient.id !== clientId) {
        log('warn', `Replacing previous Foundry client (${foundryClient.id})`);
        foundryClient.ws.close(1000, 'Replaced by new connection');
        cleanupClient(foundryClient.id);
      }

      foundryClient = client;

      // Acknowledge
      send(ws, {
        type: 'module-info-ack',
        id: generateId(),
        data: { success: true, bridgeId: 'foundry-mcp-patoko-bridge' },
      });

      // Notify all MCP clients that Foundry is available
      for (const mcp of mcpClients) {
        send(mcp.ws, {
          type: 'bridge-status',
          id: generateId(),
          data: { foundryConnected: true },
        });
      }

      return;
    }

    // ---- MCP Client Registration ----
    if (type === 'register' && (msg as Record<string, unknown>).clientType === 'mcp') {
      client.type = 'mcp';
      mcpClients.push(client);
      log('info', `MCP client registered: ${clientId} (total: ${mcpClients.length})`);

      send(ws, {
        type: 'register-ack',
        id: generateId(),
        data: {
          success: true,
          foundryConnected: !!foundryClient,
          foundryInfo: foundryClient?.moduleInfo ?? null,
        },
      });
      return;
    }

    // ---- MCP Query (from MCP client → forward to Foundry) ----
    if (type === 'mcp-query') {
      const queryId = msg.id as string;
      const data = msg.data as Record<string, unknown> | undefined;

      if (!foundryClient) {
        log('warn', `Query ${queryId} from MCP but no Foundry module connected`);
        send(ws, {
          type: 'mcp-error',
          id: queryId,
          data: { error: 'Foundry VTT module not connected. Open Foundry in a browser as GM.', code: 'FOUNDRY_DISCONNECTED' },
        });
        return;
      }

      // Validate query structure
      if (!data || !data.method) {
        log('warn', `Malformed mcp-query from ${clientId}: missing data.method`);
        send(ws, {
          type: 'mcp-error',
          id: queryId,
          data: { error: 'Malformed mcp-query: data.method is required. Expected: { type: "mcp-query", id: "...", data: { method: "...", args: {...} } }', code: 'MALFORMED_QUERY' },
        });
        return;
      }

      // Normalize: accept both 'args' and 'arguments' (MCP SDK uses 'arguments')
      if (data.arguments && !data.args) {
        log('debug', `Normalizing 'arguments' → 'args' for query ${queryId}`);
        data.args = data.arguments;
        delete data.arguments;
      }

      // Ensure args exists (default to empty object)
      if (!data.args) {
        data.args = {};
      }

      log('debug', `Forwarding query ${queryId} from MCP → Foundry: ${data.method}`);
      pendingQueries.set(queryId, { mcpClientId: clientId, queryId, sentAt: new Date() });

      // Forward the (potentially normalized) query to the Foundry module
      send(foundryClient.ws, msg);
      return;
    }

    // ---- MCP Response/Error (from Foundry → forward to MCP) ----
    if (type === 'mcp-response' || type === 'mcp-error') {
      const queryId = msg.id as string;
      const pending = pendingQueries.get(queryId);

      if (!pending) {
        log('warn', `Response for unknown query ${queryId}`);
        return;
      }

      pendingQueries.delete(queryId);

      // Find the MCP client that sent this query
      const mcpClient = clients.get(pending.mcpClientId);
      if (mcpClient && mcpClient.ws.readyState === WebSocket.OPEN) {
        const latency = Date.now() - pending.sentAt.getTime();
        log('debug', `Forwarding response ${queryId} Foundry → MCP (${latency}ms)`);
        send(mcpClient.ws, msg);
      } else {
        log('warn', `MCP client ${pending.mcpClientId} no longer available for query ${queryId}`);
      }
      return;
    }

    // ---- Ping/Pong ----
    if (type === 'ping') {
      send(ws, { type: 'pong', id: (msg.id as string) || generateId() });
      return;
    }

    if (type === 'pong') {
      // Heartbeat response, ignore
      return;
    }

    log('warn', `Unknown message type from ${clientId}: ${type}`);
  });

  ws.on('close', (code: number, reason: Buffer) => {
    log('info', `Client ${clientId} (${client.type}) disconnected: code=${code} reason=${reason.toString() || 'none'}`);
    clearInterval(heartbeat);
    clearTimeout(identifyTimeout);
    cleanupClient(clientId);
  });

  ws.on('error', (err: Error) => {
    log('error', `WebSocket error for ${clientId}: ${err.message}`);
  });
});

// ============================================================
// Cleanup
// ============================================================

function cleanupClient(clientId: string): void {
  const client = clients.get(clientId);
  if (!client) return;

  clients.delete(clientId);

  if (client.type === 'foundry' && foundryClient?.id === clientId) {
    foundryClient = null;
    log('info', 'Foundry module disconnected');

    // Notify MCP clients
    for (const mcp of mcpClients) {
      send(mcp.ws, {
        type: 'bridge-status',
        id: generateId(),
        data: { foundryConnected: false },
      });
    }

    // Fail all pending queries
    for (const [queryId, pending] of pendingQueries) {
      if (pending.mcpClientId === clientId || true) {
        const mcpClient = clients.get(pending.mcpClientId);
        if (mcpClient) {
          send(mcpClient.ws, {
            type: 'mcp-error',
            id: queryId,
            data: { error: 'Foundry module disconnected during query', code: 'FOUNDRY_DISCONNECTED' },
          });
        }
        pendingQueries.delete(queryId);
      }
    }
  }

  if (client.type === 'mcp') {
    mcpClients = mcpClients.filter(c => c.id !== clientId);

    // Cancel pending queries from this client
    for (const [queryId, pending] of pendingQueries) {
      if (pending.mcpClientId === clientId) {
        pendingQueries.delete(queryId);
      }
    }
  }
}

// ============================================================
// Startup
// ============================================================

httpServer.listen(PORT, '0.0.0.0', () => {
  log('info', `Bridge server listening on ws://0.0.0.0:${PORT}${PATH}`);
  log('info', `Health check: http://0.0.0.0:${PORT}/health`);
  log('info', 'Waiting for connections...');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  log('info', 'Received SIGTERM, shutting down...');
  wss.close();
  httpServer.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  log('info', 'Received SIGINT, shutting down...');
  wss.close();
  httpServer.close();
  process.exit(0);
});
