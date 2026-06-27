import type { McpContent } from '@foundry-mcp/shared';

/**
 * Interface that both FoundryClient and MockFoundryClient implement.
 */
export interface IFoundryClient {
  callMethod(method: string, args: Record<string, unknown>): Promise<McpContent[]>;
  isConnected(): boolean;
  connect(): Promise<void>;
  disconnect(): void;
}
