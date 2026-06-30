import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { IFoundryClient } from '../types.js';

export function registerSceneTools(server: McpServer, client: IFoundryClient): void {
  server.tool(
    'list-scenes',
    'List all scenes in the Foundry VTT world',
    {},
    async () => {
      const content = await client.callMethod('list-scenes', {});
      return { content };
    }
  );

  server.tool(
    'get-current-scene',
    'Get the currently active scene with its tokens',
    {},
    async () => {
      const content = await client.callMethod('get-current-scene', {});
      return { content };
    }
  );

  server.tool(
    'switch-scene',
    'Switch to a different scene by ID (view only, does not activate for players)',
    {
      id: z.string().describe('Scene ID to activate'),
    },
    async (args) => {
      const content = await client.callMethod('switch-scene', args);
      return { content };
    }
  );

  server.tool(
    'create-scene',
    'Create a new scene in the Foundry world.',
    {
      name: z.string().describe('Name of the scene'),
      width: z.number().optional().describe('Scene width in pixels (default: 4000)'),
      height: z.number().optional().describe('Scene height in pixels (default: 3000)'),
      background: z.string().optional().describe('Path to background image'),
      gridSize: z.number().optional().describe('Grid size in pixels (default: 100)'),
      gridType: z.number().optional().describe('0=square, 1=hex flat-top, 2=hex pointy-top, 3=gridless (default: 0)'),
      gridDistance: z.number().optional().describe('Distance per grid cell in game units (default: 5 for D&D)'),
      gridUnits: z.string().optional().describe('Distance unit label (default: ft)'),
    },
    async (args) => {
      const content = await client.callMethod('create-scene', args);
      return { content };
    }
  );

  server.tool(
    'activate-scene',
    'Activate a scene, making it the current scene for all connected players.',
    {
      sceneId: z.string().describe('The _id of the scene to activate'),
    },
    async (args) => {
      const content = await client.callMethod('activate-scene', args);
      return { content };
    }
  );

  server.tool(
    'update-scene',
    'Update properties of an existing scene (name, grid, dimensions, background).',
    {
      id: z.string().describe('Scene ID to update'),
      data: z.record(z.unknown()).describe('Scene properties to update (e.g. name, width, height, grid, background)'),
    },
    async (args) => {
      const content = await client.callMethod('update-scene', args);
      return { content };
    }
  );
}
