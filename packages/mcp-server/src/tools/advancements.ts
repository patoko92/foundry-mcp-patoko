import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { IFoundryClient } from '../types.js';

export function registerAdvancementTools(server: McpServer, client: IFoundryClient): void {
  server.tool(
    'list-advancements',
    'List advancements on a D&D 5e item (class, subclass, background, race) with their configuration, current value, and what choices need to be made. Use this before apply-advancement to discover what choices are available.',
    {
      actorId: z.string().describe('Actor ID'),
      itemId: z.string().describe('Item ID on the actor (class, subclass, background, or race item)'),
      level: z.number().optional().optional().describe('Level to check advancement status for (useful for multi-level advancements like HitPoints, ItemChoice)'),
    },
    async (args) => {
      const content = await client.callMethod('list-advancements', args);
      return { content };
    }
  );

  server.tool(
    'apply-advancement',
    'Apply a choice to a D&D 5e advancement on an actor\'s item. Use list-advancements first to discover available choices. The data parameter depends on the advancement type: Trait uses {chosen: ["skills:athletics"]}, ItemGrant/ItemChoice uses {selected: ["Compendium.dnd5e.items.ItemUUID"]}, AbilityScoreImprovement uses {assignments: {str: 1, dex: 1}} for ASI or {type: "feat", uuid: "Compendium..."} for a feat, HitPoints uses {[level]: "avg"} or {[level]: 5}, Size uses {size: "med"}.',
    {
      actorId: z.string().describe('Actor ID'),
      itemId: z.string().describe('Item ID on the actor (class, subclass, background, or race)'),
      advancementId: z.string().describe('Advancement ID (from list-advancements)'),
      level: z.number().describe('Level to apply the advancement for'),
      data: z.record(z.unknown()).describe('Advancement-specific choice data. Format depends on type — see tool description.'),
    },
    async (args) => {
      const content = await client.callMethod('apply-advancement', args);
      return { content };
    }
  );
}
