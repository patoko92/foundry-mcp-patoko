import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { IFoundryClient } from '../types.js';

export function registerWallTools(server: McpServer, client: IFoundryClient): void {
  server.tool(
    'create-wall',
    'Create a wall segment on a scene. Provide either pixel coordinates (x1,y1,x2,y2) or grid coordinates (gridX1,gridY1,gridX2,gridY2) — not both.',
    {
      sceneId: z.string().optional().describe('Scene ID (defaults to active scene)'),
      x1: z.number().optional().describe('Start X coordinate in pixels'),
      y1: z.number().optional().describe('Start Y coordinate in pixels'),
      x2: z.number().optional().describe('End X coordinate in pixels'),
      y2: z.number().optional().describe('End Y coordinate in pixels'),
      gridX1: z.number().optional().describe('Start grid column'),
      gridY1: z.number().optional().describe('Start grid row'),
      gridX2: z.number().optional().describe('End grid column'),
      gridY2: z.number().optional().describe('End grid row'),
      door: z.boolean().optional().describe('Is this a door? (default: false)'),
      doorState: z.enum(['closed', 'open', 'locked']).optional().describe('Door state (default: closed)'),
      movement: z.number().optional().describe('Movement restriction: 0=None, 1=Base, 2=Centaur (default: 1)'),
      sight: z.number().optional().describe('Sight restriction: 0=None, 1=Normal, 2=Limited (default: 1)'),
      light: z.number().optional().describe('Light restriction: 0=None, 1=Normal, 2=Limited (default: 1)'),
      direction: z.number().optional().describe('Wall direction: 0=Both, 1=Left, 2=Right (default: 0)'),
    },
    async (args) => {
      const content = await client.callMethod('create-wall', args);
      return { content };
    }
  );

  server.tool(
    'create-room',
    'Create a rectangular room with 4 walls and optional doors. Grid-aware — coordinates are in grid cells.',
    {
      sceneId: z.string().optional().describe('Scene ID (defaults to active scene)'),
      x: z.number().describe('Top-left X in grid coordinates'),
      y: z.number().describe('Top-left Y in grid coordinates'),
      width: z.number().describe('Width in grid cells'),
      height: z.number().describe('Height in grid cells'),
      doors: z.array(z.object({
        wall: z.enum(['top', 'bottom', 'left', 'right']).describe('Which wall the door is on'),
        position: z.number().optional().describe('Position along wall (0.0=start, 1.0=end, default: 0.5)'),
        doorState: z.enum(['closed', 'open', 'locked']).optional().describe('Door state (default: closed)'),
      })).optional().describe('Doors to add to walls'),
    },
    async (args) => {
      const content = await client.callMethod('create-room', args);
      return { content };
    }
  );

  server.tool(
    'list-walls',
    'List all walls on a scene.',
    {
      sceneId: z.string().optional().describe('Scene ID (defaults to active scene)'),
    },
    async (args) => {
      const content = await client.callMethod('list-walls', args);
      return { content };
    }
  );

  server.tool(
    'delete-wall',
    'Delete a wall by ID.',
    {
      wallId: z.string().describe('Wall ID to delete'),
      sceneId: z.string().optional().describe('Scene ID (defaults to active scene)'),
    },
    async (args) => {
      const content = await client.callMethod('delete-wall', args);
      return { content };
    }
  );
}
