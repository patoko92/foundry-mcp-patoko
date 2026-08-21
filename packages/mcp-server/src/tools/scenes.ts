import { McpServer } from "@modelcontextprotocol/server";
import { z } from 'zod';
import type { IFoundryClient } from '../types.js';

export function registerSceneTools(server: McpServer, client: IFoundryClient): void {
  server.registerTool('list-scenes', { description: 'List all scenes in the Foundry VTT world', inputSchema: z.object({}) }, async () => {
              const content = await client.callMethod('list-scenes', {});
              return { content };
            });

  server.registerTool('get-current-scene', { description: 'Get the currently active scene with its tokens', inputSchema: z.object({}) }, async () => {
              const content = await client.callMethod('get-current-scene', {});
              return { content };
            });

  server.registerTool('preview-scene', { description: 'Preview a scene by ID (GM-only view, does not activate for players)', inputSchema: z.object({
              id: z.string().describe('Scene ID to preview'),
            }) }, async (args) => {
              const content = await client.callMethod('switch-scene', args);
              return { content };
            });

  server.registerTool('create-scene', { description: 'Create a new scene in the Foundry world.', inputSchema: z.object({
              name: z.string().describe('Name of the scene'),
              width: z.number().optional().describe('Scene width in pixels (default: 4000)'),
              height: z.number().optional().describe('Scene height in pixels (default: 3000)'),
              background: z.string().optional().describe('Path to background image'),
              gridSize: z.number().optional().describe('Grid size in pixels (default: 100)'),
              gridType: z.number().optional().describe('0=square, 1=hex flat-top, 2=hex pointy-top, 3=gridless (default: 0)'),
              gridDistance: z.number().optional().describe('Distance per grid cell in game units (default: 5 for D&D)'),
              gridUnits: z.string().optional().describe('Distance unit label (default: ft)'),
            }) }, async (args) => {
              const content = await client.callMethod('create-scene', args);
              return { content };
            });

  server.registerTool('activate-scene', { description: 'Activate a scene, making it the current scene for all connected players.', inputSchema: z.object({
              sceneId: z.string().describe('The _id of the scene to activate'),
            }) }, async (args) => {
              const content = await client.callMethod('activate-scene', args);
              return { content };
            });

  server.registerTool('update-scene', { description: 'Update properties of an existing scene (name, grid, dimensions, background).', inputSchema: z.object({
              id: z.string().describe('Scene ID to update'),
              data: z.record(z.string(), z.unknown()).describe('Scene properties to update (e.g. name, width, height, grid, background)'),
            }) }, async (args) => {
              const content = await client.callMethod('update-scene', args);
              return { content };
            });

  server.registerTool('get-scene-notes', { description: 'Get scene notes and journal pins for a scene.', inputSchema: z.object({
              sceneId: z.string().optional().describe('Scene ID (defaults to active scene)'),
            }) }, async (args) => {
              const content = await client.callMethod('get-scene-notes', args);
              return { content };
            });
}
