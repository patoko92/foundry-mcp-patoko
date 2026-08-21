import { McpServer } from "@modelcontextprotocol/server";
import { z } from 'zod';
import type { IFoundryClient } from '../types.js';

export function registerActorTools(server: McpServer, client: IFoundryClient): void {
  server.registerTool('list-actors', { description: 'List all actors in the Foundry VTT world, optionally filtered by type (character, npc, vehicle)', inputSchema: z.object({
              type: z.enum(['character', 'npc', 'vehicle']).optional().describe('Filter actors by type'),
            }) }, async (args) => {
              const content = await client.callMethod('list-actors', args);
              return { content };
            });

  server.registerTool('get-actor', { description: 'Get detailed information about a specific actor by name or ID', inputSchema: z.object({
              name: z.string().optional().describe('Actor name to search for'),
              id: z.string().optional().describe('Actor ID to look up'),
            }) }, async (args) => {
              const content = await client.callMethod('get-actor', args);
              return { content };
            });

  server.registerTool('create-actor', { description: 'Create a new actor in the Foundry VTT world', inputSchema: z.object({
              name: z.string().describe('Name of the new actor'),
              type: z.enum(['character', 'npc', 'vehicle']).describe('Type of actor'),
              data: z.record(z.string(), z.unknown()).optional().describe('System-specific data for the actor'),
              folder: z.string().optional().describe('Folder ID to place the actor in'),
            }) }, async (args) => {
              const content = await client.callMethod('create-actor', args);
              return { content };
            });

  server.registerTool('update-actor', { description: 'Update an existing actor\'s data by ID', inputSchema: z.object({
              id: z.string().describe('Actor ID to update'),
              data: z.record(z.string(), z.unknown()).describe('Data to merge into the actor\'s system data'),
            }) }, async (args) => {
              const content = await client.callMethod('update-actor', args);
              return { content };
            });

  server.registerTool('list-player-characters', { description: 'List all player characters (actors of type character) with their owner info, HP, and level. Compact summary — much lighter than list-actors for this specific query.', inputSchema: z.object({}) }, async () => {
              const content = await client.callMethod('list-player-characters', {});
              return { content };
            });

  server.registerTool('get-actor-items', { description: 'Get all items for an actor (inventory, spells, features, weapons, armor). Optionally filter by item type.', inputSchema: z.object({
              actorId: z.string().describe('Actor ID to get items for'),
              type: z.enum(['weapon', 'equipment', 'consumable', 'spell', 'feature', 'loot', 'class', 'race', 'background']).optional().describe('Filter items by type'),
              compact: z.boolean().optional().describe('Return compact item data (name, type, equipped, key stats only). Reduces response from ~130KB to ~1-3KB.'),
            }) }, async (args) => {
              const content = await client.callMethod('get-actor-items', args);
              return { content };
            });

  server.registerTool('get-actor-spells', { description: 'Get spells for an actor with spell slot information. Optionally filter by spell level.', inputSchema: z.object({
              actorId: z.string().describe('Actor ID to get spells for'),
              level: z.number().optional().describe('Filter spells by level (0 for cantrips)'),
            }) }, async (args) => {
              const content = await client.callMethod('get-actor-spells', args);
              return { content };
            });

  server.registerTool('update-actor-hp', { description: 'Quick HP modify: damage, heal, or set to a specific value.', inputSchema: z.object({
              actorId: z.string().describe('Actor ID to modify HP for'),
              amount: z.number().describe('Amount of damage, healing, or new HP value'),
              mode: z.enum(['damage', 'heal', 'set']).describe('Mode: damage (reduce HP), heal (increase HP), or set (set to exact value)'),
            }) }, async (args) => {
              const content = await client.callMethod('update-actor-hp', args);
              return { content };
            });

  server.registerTool('add-item-to-actor', { description: 'Add an item to an actor from a compendium or inline data.', inputSchema: z.object({
              actorId: z.string().describe('Actor ID to add the item to'),
              itemId: z.string().optional().describe('Item ID from a compendium'),
              pack: z.string().optional().describe('Compendium pack ID (e.g. dnd5e.items)'),
              data: z.record(z.string(), z.unknown()).optional().describe('Inline item data to create directly'),
            }) }, async (args) => {
              const content = await client.callMethod('add-item-to-actor', args);
              return { content };
            });

  server.registerTool('remove-item-from-actor', { description: 'Remove an item from an actor by item ID.', inputSchema: z.object({
              actorId: z.string().describe('Actor ID to remove the item from'),
              itemId: z.string().describe('Item ID to remove'),
            }) }, async (args) => {
              const content = await client.callMethod('remove-item-from-actor', args);
              return { content };
            });

  server.registerTool('delete-actor', { description: 'Delete an actor from the world by ID.', inputSchema: z.object({
              actorId: z.string().describe('The _id of the actor to delete'),
            }) }, async (args) => {
              const content = await client.callMethod('delete-actor', args);
              return { content };
            });

  server.registerTool('delete-actors-by-type', { description: 'Delete all actors matching a type (e.g. npc) or excluding types (e.g. keep only character). Useful for batch cleanup.', inputSchema: z.object({
              actorType: z.string().optional().describe('Actor type to delete (e.g. npc, character, vehicle)'),
              excludeTypes: z.array(z.string()).optional().describe('Actor types to keep (skip deletion)'),
            }) }, async (args) => {
              const content = await client.callMethod('delete-actors-by-type', args);
              return { content };
            });

  server.registerTool('get-character-summary', { description: 'Returns a compact (~2KB) summary of a character with all essential fields: class, race, level, HP, AC, abilities, saves, spell slots, items, spells, features. Much lighter than get-actor for character review.', inputSchema: z.object({
              actorId: z.string().describe('Actor ID to get summary for'),
            }) }, async (args) => {
              const content = await client.callMethod('get-character-summary', args);
              return { content };
            });

  server.registerTool('validate-character', { description: 'Validates a D&D 2024 character against PHB rules. Returns structured errors/warnings for: save proficiencies, spell slots, HP, proficiency bonus, point buy, spell lists, spell levels, cantrip count, armor/weapon proficiencies, background, and languages.', inputSchema: z.object({
              actorId: z.string().optional().describe('Actor ID to validate'),
              name: z.string().optional().describe('Actor name to search for'),
            }) }, async (args) => {
              const content = await client.callMethod('validate-character', args);
              return { content };
            });

  // Effects (merged from effects.ts — effects are per-actor operations)
  server.registerTool('list-actor-effects', { description: 'List all active effects on an actor.', inputSchema: z.object({
              actorId: z.string().describe('Actor ID to list effects for'),
            }) }, async (args) => {
              const content = await client.callMethod('list-actor-effects', args);
              return { content };
            });

  server.registerTool('add-effect-to-actor', { description: 'Add an active effect to an actor with specified changes.', inputSchema: z.object({
              actorId: z.string().describe('Actor ID to add the effect to'),
              name: z.string().describe('Name of the effect'),
              changes: z.array(z.object({
                key: z.string().describe('The property key affected (e.g. system.abilities.str.value)'),
                mode: z.number().describe('Change mode (0=custom, 1=multiply, 2=add, 3=downgrade, 4=upgrade, 5=override)'),
                value: z.string().describe('The value to apply'),
              })).describe('Array of changes the effect applies'),
              duration: z.record(z.string(), z.unknown()).optional().describe('Duration configuration (e.g. { seconds: 60, rounds: 10 })'),
            }) }, async (args) => {
              const content = await client.callMethod('add-effect-to-actor', args);
              return { content };
            });

  server.registerTool('remove-effect-from-actor', { description: 'Remove an active effect from an actor.', inputSchema: z.object({
              actorId: z.string().describe('Actor ID to remove the effect from'),
              effectId: z.string().describe('Effect ID to remove'),
            }) }, async (args) => {
              const content = await client.callMethod('remove-effect-from-actor', args);
              return { content };
            });
}
