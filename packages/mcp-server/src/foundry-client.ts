import WebSocket from 'ws';
import { randomUUID } from 'node:crypto';
import type {
  McpContent,
  WebSocketMessage,
  McpResponseMessage,
  McpErrorMessage,
  ModuleInfoMessage,
} from '@foundry-mcp/shared';
import type { IFoundryClient } from './types.js';

const DEFAULT_WS_HOST = '127.0.0.1';
const DEFAULT_WS_PORT = 31415;
const DEFAULT_WS_NAMESPACE = '/foundry-mcp';
const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_RECONNECT_DELAY = 30_000;

interface PendingRequest {
  resolve: (value: McpContent[]) => void;
  reject: (reason: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

/**
 * WebSocket client that connects to the Foundry VTT module and sends MCP queries.
 */
export class FoundryClient implements IFoundryClient {
  private ws: WebSocket | null = null;
  private pending = new Map<string, PendingRequest>();
  private reconnectDelay = 1000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private _connected = false;
  private _shouldReconnect = true;
  private readonly url: string;
  private readonly timeout: number;

  constructor() {
    const host = process.env.WS_HOST || DEFAULT_WS_HOST;
    const port = process.env.WS_PORT || String(DEFAULT_WS_PORT);
    const namespace = process.env.WS_NAMESPACE || DEFAULT_WS_NAMESPACE;
    this.url = `ws://${host}:${port}${namespace}`;
    this.timeout = DEFAULT_TIMEOUT_MS;
  }

  isConnected(): boolean {
    return this._connected;
  }

  async connect(): Promise<void> {
    this._shouldReconnect = true;
    return this.doConnect();
  }

  private doConnect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
      } catch (err) {
        this.scheduleReconnect();
        reject(err);
        return;
      }

      this.ws.on('open', () => {
        this._connected = true;
        this.reconnectDelay = 1000; // reset backoff
        console.error(`[FoundryClient] Connected to ${this.url}`);
        resolve();
      });

      this.ws.on('message', (data) => {
        try {
          const msg: WebSocketMessage = JSON.parse(data.toString());
          this.handleMessage(msg);
        } catch (err) {
          console.error('[FoundryClient] Failed to parse message:', err);
        }
      });

      this.ws.on('close', () => {
        this._connected = false;
        console.error('[FoundryClient] Connection closed');
        this.rejectAllPending(new Error('WebSocket connection closed'));
        if (this._shouldReconnect) {
          this.scheduleReconnect();
        }
      });

      this.ws.on('error', (err) => {
        console.error('[FoundryClient] WebSocket error:', err.message);
        // Don't reject here — 'close' will fire and handle reconnect
      });

      // Timeout for initial connection
      const initTimeout = setTimeout(() => {
        if (!this._connected) {
          this.ws?.close();
          reject(new Error('Connection timeout'));
        }
      }, this.timeout);

      // Clear the init timeout once connected
      this.ws.once('open', () => clearTimeout(initTimeout));
    });
  }

  disconnect(): void {
    this._shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.rejectAllPending(new Error('Client disconnected'));
    this.ws?.close();
    this.ws = null;
    this._connected = false;
  }

  async callMethod(method: string, args: Record<string, unknown>): Promise<McpContent[]> {
    if (!this._connected || !this.ws) {
      throw new Error('Not connected to Foundry');
    }

    const id = randomUUID();
    const message = {
      type: 'mcp-query' as const,
      id,
      data: { method, args },
    };

    return new Promise<McpContent[]>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Request timed out after ${this.timeout}ms: ${method}`));
      }, this.timeout);

      this.pending.set(id, { resolve, reject, timer });
      this.ws!.send(JSON.stringify(message));
    });
  }

  private handleMessage(msg: WebSocketMessage): void {
    switch (msg.type) {
      case 'mcp-response': {
        const response = msg as McpResponseMessage;
        const pending = this.pending.get(response.id);
        if (pending) {
          this.pending.delete(response.id);
          clearTimeout(pending.timer);
          if (response.data.isError) {
            pending.reject(new Error(response.data.content.map(c => ('text' in c ? c.text : '')).join('')));
          } else {
            pending.resolve(response.data.content);
          }
        }
        break;
      }
      case 'mcp-error': {
        const error = msg as McpErrorMessage;
        const pending = this.pending.get(error.id);
        if (pending) {
          this.pending.delete(error.id);
          clearTimeout(pending.timer);
          pending.reject(new Error(error.data.error));
        }
        break;
      }
      case 'module-info': {
        const info = msg as ModuleInfoMessage;
        console.error(`[FoundryClient] Module info: ${info.data.worldName} (${info.data.systemId})`);
        break;
      }
      case 'ping': {
        this.ws?.send(JSON.stringify({ type: 'pong', id: msg.id }));
        break;
      }
      case 'pong':
        // Nothing to do
        break;
    }
  }

  private rejectAllPending(err: Error): void {
    for (const [, pending] of this.pending) {
      clearTimeout(pending.timer);
      pending.reject(err);
    }
    this.pending.clear();
  }

  private scheduleReconnect(): void {
    if (!this._shouldReconnect) return;
    if (this.reconnectTimer) return;

    console.error(`[FoundryClient] Reconnecting in ${this.reconnectDelay}ms...`);
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      try {
        await this.doConnect();
      } catch {
        // doConnect already schedules next reconnect
      }
    }, this.reconnectDelay);

    // Exponential backoff capped at 30s
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, MAX_RECONNECT_DELAY);
  }
}
