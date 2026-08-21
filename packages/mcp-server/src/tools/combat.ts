import { McpServer } from "@modelcontextprotocol/server";
import { z } from 'zod';
import type { IFoundryClient } from '../types.js';

export function registerCombatTools(server: McpServer, client: IFoundryClient): void {
  server.registerTool('get-combat-state', { description: 'Get the current combat state (round, turn, combatants, initiative order)', inputSchema: z.object({}) }, async () => {
              const content = await client.callMethod('get-combat-state', {});
              return { content };
            });

  server.registerTool('roll-initiative', { description: 'Roll initiative for a specific combatant in the current combat', inputSchema: z.object({
              combatantId: z.string().describe('Combatant ID to roll initiative for'),
            }) }, async (args) => {
              const content = await client.callMethod('roll-initiative', args);
              return { content };
            });

  server.registerTool('start-combat', { description: 'Create and start a new combat encounter, optionally adding combatants by token ID.', inputSchema: z.object({
              sceneId: z.string().optional().describe('Scene ID for the combat (defaults to active scene)'),
              combatantTokenIds: z.array(z.string()).optional().describe('Token IDs to add as combatants'),
            }) }, async (args) => {
              const content = await client.callMethod('start-combat', args);
              return { content };
            });

  server.registerTool('end-combat', { description: 'End the current combat encounter.', inputSchema: z.object({}) }, async () => {
              const content = await client.callMethod('end-combat', {});
              return { content };
            });

  server.registerTool('next-turn', { description: 'Advance to the next turn in the current combat.', inputSchema: z.object({}) }, async () => {
              const content = await client.callMethod('next-turn', {});
              return { content };
            });

  server.registerTool('previous-turn', { description: 'Go back to the previous turn in the current combat.', inputSchema: z.object({}) }, async () => {
              const content = await client.callMethod('previous-turn', {});
              return { content };
            });

  server.registerTool('add-combatant', { description: 'Add a token or actor to the current combat encounter.', inputSchema: z.object({
              tokenId: z.string().optional().describe('Token ID to add as combatant'),
              actorId: z.string().optional().describe('Actor ID to add as combatant'),
              name: z.string().optional().describe('Custom name for the combatant'),
              hidden: z.boolean().optional().describe('Whether the combatant is hidden from players'),
            }) }, async (args) => {
              const content = await client.callMethod('add-combatant', args);
              return { content };
            });

  server.registerTool('remove-combatant', { description: 'Remove a combatant from the current combat encounter.', inputSchema: z.object({
              combatantId: z.string().describe('Combatant ID to remove'),
            }) }, async (args) => {
              const content = await client.callMethod('remove-combatant', args);
              return { content };
            });

  server.registerTool('roll-all-initiative', { description: 'Roll initiative for all combatants that do not have initiative yet.', inputSchema: z.object({}) }, async () => {
              const content = await client.callMethod('roll-all-initiative', {});
              return { content };
            });

  server.registerTool('set-initiative', { description: 'Manually set a combatant\'s initiative value.', inputSchema: z.object({
              combatantId: z.string().describe('Combatant ID to set initiative for'),
              value: z.number().describe('Initiative value to set'),
            }) }, async (args) => {
              const content = await client.callMethod('set-initiative', args);
              return { content };
            });
}
