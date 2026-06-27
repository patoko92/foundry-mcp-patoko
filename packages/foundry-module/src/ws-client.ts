/**
 * WebSocket client for connecting to the MCP Patoko server.
 * Uses the native browser WebSocket API.
 * Handles ping/pong keepalive, auto-reconnect, and message routing.
 */

import { MODULE_ID, getSettings, logDebug, logInfo, logWarn, logError } from './settings.js';
import { handleQuery } from './query-handler.js';

/** Generate a simple unique ID */
function generateId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

type ConnectionState = 'disconnected' | 'connecting' | 'connected';

export class McpWebSocketClient {
  private ws: WebSocket | null = null;
  private state: ConnectionState = 'disconnected';
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private baseReconnectDelay = 1000; // ms
  private pingInterval = 30_000; // 30 seconds
  private lastPong = 0;

  /**
   * Connect to the MCP WebSocket server.
   */
  connect(): void {
    if (this.state === 'connecting' || this.state === 'connected') {
      logDebug('Already connected or connecting, skipping');
      return;
    }

    const settings = getSettings();
    const url = `ws://${settings.mcpHost}:${settings.mcpPort}${settings.mcpNamespace}`;

    logInfo(`Connecting to ${url}...`);
    this.state = 'connecting';

    try {
      this.ws = new WebSocket(url);
    } catch (err) {
      logError('Failed to create WebSocket:', err);
      this.state = 'disconnected';
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => this.handleOpen();
    this.ws.onmessage = (event) => this.handleMessage(event);
    this.ws.onclose = (event) => this.handleClose(event);
    this.ws.onerror = (event) => this.handleError(event);
  }

  /**
   * Disconnect from the MCP server.
   */
  disconnect(): void {
    logInfo('Disconnecting...');
    this.clearTimers();
    this.maxReconnectAttempts = 0; // prevent auto-reconnect
    if (this.ws) {
      this.ws.close(1000, 'Module disconnect');
      this.ws = null;
    }
    this.state = 'disconnected';
  }

  /**
   * Send a typed JSON message to the server.
   */
  private send(data: Record<string, unknown>): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      logWarn('Cannot send message, WebSocket not open');
      return;
    }
    try {
      this.ws.send(JSON.stringify(data));
    } catch (err) {
      logError('Failed to send message:', err);
    }
  }

  // ─── Connection lifecycle ───────────────────────────────────────

  private handleOpen(): void {
    logInfo('Connected to MCP server');
    this.state = 'connected';
    this.reconnectAttempts = 0;
    this.lastPong = Date.now();

    // Send module-info
    this.sendModuleInfo();

    // Start ping keepalive
    this.startPingLoop();

    // UI notification
    try {
      ui?.notifications?.info?.('[MCP Patoko] Connected to MCP server');
    } catch {
      // Ignore if UI not ready
    }
  }

  private handleClose(event: CloseEvent): void {
    logWarn(`WebSocket closed: code=${event.code} reason=${event.reason}`);
    this.state = 'disconnected';
    this.clearTimers();
    this.ws = null;

    if (event.code !== 1000) {
      this.scheduleReconnect();
    }

    try {
      ui?.notifications?.warn?.('[MCP Patoko] Disconnected from MCP server');
    } catch {
      // Ignore
    }
  }

  private handleError(_event: Event): void {
    logError('WebSocket error');
    // onclose will fire after onerror in most browsers
  }

  // ─── Message handling ───────────────────────────────────────────

  private handleMessage(event: MessageEvent): void {
    let data: any;
    try {
      data = JSON.parse(event.data);
    } catch {
      logWarn('Received non-JSON message:', event.data);
      return;
    }

    logDebug('Received message:', data.type, data.id);

    switch (data.type) {
      case 'ping':
        this.send({ type: 'pong', id: data.id ?? generateId() });
        break;

      case 'pong':
        this.lastPong = Date.now();
        break;

      case 'mcp-query':
        this.handleMcpQuery(data);
        break;

      default:
        logDebug('Unknown message type:', data.type);
    }
  }

  private async handleMcpQuery(message: any): Promise<void> {
    const queryId = message.id;
    const method = message.data?.method;
    const args = message.data?.args ?? {};

    logInfo(`Handling query: ${method} (id: ${queryId})`);

    const result = await handleQuery(method, args);

    this.send({
      type: 'mcp-response',
      id: queryId,
      data: result,
    });
  }

  // ─── Module info ────────────────────────────────────────────────

  private sendModuleInfo(): void {
    try {
      const currentUser = game.user;
      this.send({
        type: 'module-info',
        id: generateId(),
        data: {
          worldId: game.world.id,
          worldName: game.world.name,
          systemId: game.system.id,
          systemVersion: game.system.version,
          foundryVersion: game.version || game.data?.version || 'unknown',
          userId: currentUser?.id ?? 'unknown',
          userName: currentUser?.name ?? 'unknown',
          connectedAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      logError('Failed to send module-info:', err);
    }
  }

  // ─── Keepalive ──────────────────────────────────────────────────

  private startPingLoop(): void {
    this.pingTimer = setInterval(() => {
      if (this.state !== 'connected') return;

      // Check if we haven't received a pong in too long
      const timeSincePong = Date.now() - this.lastPong;
      if (timeSincePong > this.pingInterval * 3) {
        logWarn('No pong received, connection may be dead');
        this.ws?.close(4000, 'Keepalive timeout');
        return;
      }

      this.send({ type: 'ping', id: generateId() });
    }, this.pingInterval);
  }

  // ─── Reconnect logic ────────────────────────────────────────────

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logError(
        `Max reconnect attempts (${this.maxReconnectAttempts}) reached. Giving up.`
      );
      return;
    }

    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts),
      30_000
    );
    this.reconnectAttempts++;

    logInfo(
      `Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  // ─── Cleanup ────────────────────────────────────────────────────

  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }
}
