/**
 * Module settings definitions and registration.
 * All settings are registered under the 'foundry-mcp-patoko' namespace.
 */

export const MODULE_ID = 'foundry-mcp-patoko';

export const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];

export interface ModuleSettings {
  mcpHost: string;
  mcpPort: number;
  mcpNamespace: string;
  autoConnect: boolean;
  logLevel: LogLevel;
}

export function registerSettings(): void {
  game.settings.register(MODULE_ID, 'mcpHost', {
    name: 'MCP Server Host',
    hint: 'Hostname or IP address of the MCP WebSocket server',
    scope: 'world',
    config: true,
    type: String,
    default: 'localhost',
  });

  game.settings.register(MODULE_ID, 'mcpPort', {
    name: 'MCP Server Port',
    hint: 'Port number of the MCP WebSocket server',
    scope: 'world',
    config: true,
    type: Number,
    default: 31415,
    range: {
      min: 1024,
      max: 65535,
      step: 1,
    },
  });

  game.settings.register(MODULE_ID, 'mcpNamespace', {
    name: 'MCP Namespace',
    hint: 'WebSocket namespace path',
    scope: 'world',
    config: true,
    type: String,
    default: '/foundry-mcp',
  });

  game.settings.register(MODULE_ID, 'autoConnect', {
    name: 'Auto Connect',
    hint: 'Automatically connect to MCP server on Foundry ready',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register(MODULE_ID, 'logLevel', {
    name: 'Log Level',
    hint: 'Verbosity of module log messages',
    scope: 'client',
    config: true,
    type: String,
    default: 'info',
    choices: {
      debug: 'Debug',
      info: 'Info',
      warn: 'Warning',
      error: 'Error',
    },
  });
}

export function getSettings(): ModuleSettings {
  return {
    mcpHost: game.settings.get(MODULE_ID, 'mcpHost') as string,
    mcpPort: game.settings.get(MODULE_ID, 'mcpPort') as number,
    mcpNamespace: game.settings.get(MODULE_ID, 'mcpNamespace') as string,
    autoConnect: game.settings.get(MODULE_ID, 'autoConnect') as boolean,
    logLevel: game.settings.get(MODULE_ID, 'logLevel') as LogLevel,
  };
}

const LOG_LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export function shouldLog(level: LogLevel): boolean {
  const currentLevel = game.settings.get(MODULE_ID, 'logLevel') as LogLevel;
  return LOG_LEVEL_ORDER[level] >= LOG_LEVEL_ORDER[currentLevel];
}

const PREFIX = '[MCP Patoko]';

export function logDebug(...args: unknown[]): void {
  if (shouldLog('debug')) console.log(PREFIX, ...args);
}

export function logInfo(...args: unknown[]): void {
  if (shouldLog('info')) console.log(PREFIX, ...args);
}

export function logWarn(...args: unknown[]): void {
  if (shouldLog('warn')) console.warn(PREFIX, ...args);
}

export function logError(...args: unknown[]): void {
  if (shouldLog('error')) console.error(PREFIX, ...args);
}
