import type { McpContent } from '@foundry-mcp/shared';
import type { IFoundryClient } from './types.js';

/**
 * Mock Foundry client for testing the MCP server without a real Foundry instance.
 * Returns realistic dummy data for all tool methods.
 */
export class MockFoundryClient implements IFoundryClient {
  isConnected(): boolean {
    return true;
  }

  async connect(): Promise<void> {
    console.error('[MockFoundryClient] Mock mode — no real WebSocket connection');
  }

  disconnect(): void {
    // No-op
  }

  async callMethod(method: string, args: Record<string, unknown>): Promise<McpContent[]> {
    console.error(`[MockFoundryClient] callMethod: ${method}`, JSON.stringify(args));

    const handler = this.handlers[method];
    if (handler) {
      return handler(args);
    }

    return [{ type: 'text', text: JSON.stringify({ error: `Unknown method: ${method}` }) }];
  }

  // ─── Handler map ────────────────────────────────────────────

  private handlers: Record<string, (args: Record<string, unknown>) => McpContent[]> = {
    'get-world-info': () => this.getWorldInfo(),
    'list-actors': (args) => this.listActors(args),
    'get-actor': (args) => this.getActor(args),
    'create-actor': (args) => this.createActor(args),
    'update-actor': (args) => this.updateActor(args),
    'list-scenes': () => this.listScenes(),
    'get-current-scene': () => this.getCurrentScene(),
    'switch-scene': (args) => this.switchScene(args),
    'search-compendium': (args) => this.searchCompendium(args),
    'get-compendium-item': (args) => this.getCompendiumItem(args),
    'list-compendium-packs': () => this.listCompendiumPacks(),
    'get-combat-state': () => this.getCombatState(),
    'roll-initiative': (args) => this.rollInitiative(args),
    'roll-dice': (args) => this.rollDice(args),
    'list-journals': () => this.listJournals(),
    'search-journals': (args) => this.searchJournals(args),
    'create-journal': (args) => this.createJournal(args),
    'list-tokens': (args) => this.listTokens(args),
    'get-token-details': (args) => this.getTokenDetails(args),
    'move-token': (args) => this.moveToken(args),
  };

  // ─── Data ───────────────────────────────────────────────────

  private actors: Record<string, unknown>[] = [
    {
      _id: 'actor-kaelith-001',
      name: 'Kaelith',
      type: 'character',
      img: 'systems/dnd5e/icons/svg/mystery-man.svg',
      system: {
        abilities: {
          str: { value: 10, proficient: 0 },
          dex: { value: 14, proficient: 0 },
          con: { value: 13, proficient: 0 },
          int: { value: 18, proficient: 1 },
          wis: { value: 15, proficient: 0 },
          cha: { value: 12, proficient: 0 },
        },
        attributes: {
          hp: { value: 34, max: 34, temp: 0 },
          ac: { value: 12 },
          speed: { value: 30 },
        },
        details: {
          race: 'Human',
          background: 'Sage',
          alignment: 'Neutral Good',
          level: 5,
          class: 'Wizard',
        },
        traits: {
          languages: { value: ['common', 'elvish', 'draconic'] },
        },
      },
      ownership: { default: 0 },
      folder: null,
    },
    {
      _id: 'actor-thrain-002',
      name: 'Thrain',
      type: 'character',
      img: 'systems/dnd5e/icons/svg/mystery-man.svg',
      system: {
        abilities: {
          str: { value: 18, proficient: 1 },
          dex: { value: 12, proficient: 0 },
          con: { value: 16, proficient: 1 },
          int: { value: 10, proficient: 0 },
          wis: { value: 13, proficient: 0 },
          cha: { value: 8, proficient: 0 },
        },
        attributes: {
          hp: { value: 52, max: 52, temp: 0 },
          ac: { value: 18 },
          speed: { value: 25 },
        },
        details: {
          race: 'Dwarf',
          background: 'Soldier',
          alignment: 'Lawful Good',
          level: 5,
          class: 'Fighter',
        },
        traits: {
          languages: { value: ['common', 'dwarvish'] },
        },
      },
      ownership: { default: 0 },
      folder: null,
    },
    {
      _id: 'actor-lyra-003',
      name: 'Lyra',
      type: 'character',
      img: 'systems/dnd5e/icons/svg/mystery-man.svg',
      system: {
        abilities: {
          str: { value: 10, proficient: 0 },
          dex: { value: 18, proficient: 1 },
          con: { value: 14, proficient: 0 },
          int: { value: 13, proficient: 0 },
          wis: { value: 12, proficient: 0 },
          cha: { value: 16, proficient: 1 },
        },
        attributes: {
          hp: { value: 38, max: 38, temp: 0 },
          ac: { value: 15 },
          speed: { value: 30 },
        },
        details: {
          race: 'Elf',
          background: 'Criminal',
          alignment: 'Chaotic Neutral',
          level: 5,
          class: 'Rogue',
        },
        traits: {
          languages: { value: ['common', 'elvish', 'thieves-cant'] },
        },
      },
      ownership: { default: 0 },
      folder: null,
    },
  ];

  private scenes: Record<string, unknown>[] = [
    {
      _id: 'scene-tavern-001',
      name: 'Tavern zur Goldenen Krone',
      img: 'scenes/tavern.webp',
      active: true,
      width: 2000,
      height: 1500,
      grid: 100,
      tokens: [
        {
          _id: 'token-kaelith-001',
          name: 'Kaelith',
          actorId: 'actor-kaelith-001',
          x: 500,
          y: 400,
          img: 'systems/dnd5e/icons/svg/mystery-man.svg',
          width: 1,
          height: 1,
          hidden: false,
          disposition: 1,
        },
        {
          _id: 'token-thrain-001',
          name: 'Thrain',
          actorId: 'actor-thrain-001',
          x: 700,
          y: 400,
          img: 'systems/dnd5e/icons/svg/mystery-man.svg',
          width: 1,
          height: 1,
          hidden: false,
          disposition: 1,
        },
        {
          _id: 'token-lyra-001',
          name: 'Lyra',
          actorId: 'actor-lyra-001',
          x: 600,
          y: 300,
          img: 'systems/dnd5e/icons/svg/mystery-man.svg',
          width: 1,
          height: 1,
          hidden: false,
          disposition: 1,
        },
      ],
    },
    {
      _id: 'scene-forest-002',
      name: 'Dunkler Wald',
      img: 'scenes/forest.webp',
      active: false,
      width: 3000,
      height: 2000,
      grid: 100,
      tokens: [
        {
          _id: 'token-goblin-001',
          name: 'Goblin Scout',
          actorId: 'actor-goblin-004',
          x: 1200,
          y: 800,
          img: 'tokens/goblin.webp',
          width: 1,
          height: 1,
          hidden: true,
          disposition: -1,
        },
      ],
    },
  ];

  private combat: Record<string, unknown> = {
    _id: 'combat-001',
    active: true,
    round: 2,
    turn: 1,
    combatants: [
      {
        _id: 'combatant-kaelith-001',
        name: 'Kaelith',
        tokenId: 'token-kaelith-001',
        actorId: 'actor-kaelith-001',
        initiative: 18,
        hidden: false,
      },
      {
        _id: 'combatant-thrain-001',
        name: 'Thrain',
        tokenId: 'token-thrain-001',
        actorId: 'actor-thrain-001',
        initiative: 12,
        hidden: false,
      },
    ],
  };

  private journals: { _id: string; name: string; content: string; folder: string | null }[] = [
    {
      _id: 'journal-quest-001',
      name: 'Quest: Die Verlorene Stadt',
      content: '<h1>Die Verlorene Stadt</h1><p>Die Legenden sprechen von einer alten Stadt, die vor tausenden Jahren unter den Bergen versank. Ihre Ruinen enthalten unermessliche Schätze — und noch gefährlichere Geheimnisse.</p><h2>Hinweise</h2><ul><li>Die alte Karte zeigt einen Eingang nahe dem Schwarzen Felsen.</li><li>Der Händler in der Taverne erwähnte seltsame Lichter in der Nacht.</li></ul>',
      folder: 'quests',
    },
    {
      _id: 'journal-notes-002',
      name: 'Notizen Session 3',
      content: '<h1>Session 3 — Notizen</h1><p><strong>Datum:</strong> 15. Mai 2026</p><h2>Zusammenfassung</h2><p>Die Gruppe erreichte die Taverne zur Goldenen Krone. Thrain handelte mit dem Wirt und erfuhr von verschwundenen Händlern. Kaelith studierte die alte Karte und entdeckte versteckte Runen. Lyra beobachtete einen verdächtigen Fremden im Schatten.</p><h2>Offene Fragen</h2><ul><li>Wer ist der mysteriöse Fremde?</li><li>Was bedeuten die Runen auf der Karte?</li></ul>',
      folder: null,
    },
  ];

  private compendiumPacks = [
    { id: 'dnd5e.spells', label: 'D&D 5e Spells', type: 'Item', system: 'dnd5e' },
    { id: 'dnd5e.monsters', label: 'D&D 5e Monsters', type: 'Actor', system: 'dnd5e' },
    { id: 'dnd5e.items', label: 'D&D 5e Items', type: 'Item', system: 'dnd5e' },
  ];

  private compendiumItems = [
    { pack: 'dnd5e.spells', packLabel: 'D&D 5e Spells', id: 'spell-fireball', name: 'Fireball', type: 'spell', img: 'icons/svg/fire.svg', system: { level: 3, school: 'evocation', range: '150 feet', damage: '8d6 fire' } },
    { pack: 'dnd5e.spells', packLabel: 'D&D 5e Spells', id: 'spell-magic-missile', name: 'Magic Missile', type: 'spell', img: 'icons/svg/ice-aura.svg', system: { level: 1, school: 'evocation', range: '120 feet', damage: '3 × (1d4+1) force' } },
    { pack: 'dnd5e.spells', packLabel: 'D&D 5e Spells', id: 'spell-cure-wounds', name: 'Cure Wounds', type: 'spell', img: 'icons/svg/heal.svg', system: { level: 1, school: 'evocation', range: 'touch', healing: '1d8+mod' } },
    { pack: 'dnd5e.monsters', packLabel: 'D&D 5e Monsters', id: 'monster-goblin', name: 'Goblin', type: 'npc', img: 'tokens/medium/goblin.webp', system: { cr: 0.25, hp: 7, ac: 15, size: 'Small' } },
    { pack: 'dnd5e.monsters', packLabel: 'D&D 5e Monsters', id: 'monster-red-dragon', name: 'Young Red Dragon', type: 'npc', img: 'tokens/large/dragon-red.webp', system: { cr: 10, hp: 178, ac: 18, size: 'Large' } },
    { pack: 'dnd5e.items', packLabel: 'D&D 5e Items', id: 'item-longsword', name: 'Longsword', type: 'weapon', img: 'icons/weapons/swords/sword-long.webp', system: { damage: '1d8 slashing', weight: 3, price: 15 } },
    { pack: 'dnd5e.items', packLabel: 'D&D 5e Items', id: 'item-healing-potion', name: 'Potion of Healing', type: 'consumable', img: 'icons/consumables/potions/potion-red.webp', system: { healing: '2d4+2', weight: 0.5, price: 50 } },
  ];

  // ─── Handlers ───────────────────────────────────────────────

  private getWorldInfo(): McpContent[] {
    const info = {
      id: 'world-ember-001',
      name: 'World in Ember',
      system: 'dnd5e',
      systemVersion: '3.3.1',
      foundryVersion: '14.332',
      title: 'World in Ember',
      description: 'A dark fantasy campaign set in a world where ancient embers still smolder beneath the earth.',
      users: [
        { id: 'user-gm', name: 'GameMaster', role: 4 },
        { id: 'user-alex', name: 'Alex', role: 1 },
        { id: 'user-sam', name: 'Sam', role: 1 },
      ],
    };
    return [{ type: 'text', text: JSON.stringify(info, null, 2) }];
  }

  private listActors(args: Record<string, unknown>): McpContent[] {
    let results = this.actors;
    if (args.type) {
      results = results.filter(a => a.type === args.type);
    }
    const summary = results.map(a => ({
      _id: a._id,
      name: a.name,
      type: a.type,
      level: (a.system as Record<string, unknown>).details
        ? ((a.system as Record<string, unknown>).details as Record<string, unknown>).level
        : undefined,
    }));
    return [{ type: 'text', text: JSON.stringify(summary, null, 2) }];
  }

  private getActor(args: Record<string, unknown>): McpContent[] {
    const actor = this.actors.find(
      a => a._id === args.id || String(a.name).toLowerCase() === String(args.name || '').toLowerCase()
    );
    if (!actor) {
      return [{ type: 'text', text: JSON.stringify({ error: 'Actor not found' }) }];
    }
    return [{ type: 'text', text: JSON.stringify(actor, null, 2) }];
  }

  private createActor(args: Record<string, unknown>): McpContent[] {
    const newActor: Record<string, unknown> = {
      _id: `actor-${Date.now()}`,
      name: String(args.name),
      type: String(args.type),
      img: 'systems/dnd5e/icons/svg/mystery-man.svg',
      system: args.data || {},
      ownership: { default: 0 },
      folder: args.folder ? String(args.folder) : null,
    };
    this.actors.push(newActor);
    return [{ type: 'text', text: JSON.stringify({ success: true, actor: newActor }, null, 2) }];
  }

  private updateActor(args: Record<string, unknown>): McpContent[] {
    const actor = this.actors.find(a => a._id === args.id);
    if (!actor) {
      return [{ type: 'text', text: JSON.stringify({ error: 'Actor not found' }) }];
    }
    // Deep merge into system
    const system = actor.system as Record<string, unknown>;
    const data = args.data as Record<string, unknown>;
    for (const [key, value] of Object.entries(data)) {
      if (
        typeof value === 'object' && value !== null &&
        typeof system[key] === 'object' && system[key] !== null
      ) {
        system[key] = { ...(system[key] as Record<string, unknown>), ...(value as Record<string, unknown>) };
      } else {
        system[key] = value;
      }
    }
    return [{ type: 'text', text: JSON.stringify({ success: true, actor }, null, 2) }];
  }

  private listScenes(): McpContent[] {
    const summary = this.scenes.map(s => ({
      _id: s._id,
      name: s.name,
      active: s.active,
      tokenCount: Array.isArray(s.tokens) ? s.tokens.length : 0,
    }));
    return [{ type: 'text', text: JSON.stringify(summary, null, 2) }];
  }

  private getCurrentScene(): McpContent[] {
    const scene = this.scenes.find(s => s.active);
    if (!scene) {
      return [{ type: 'text', text: JSON.stringify({ error: 'No active scene' }) }];
    }
    return [{ type: 'text', text: JSON.stringify(scene, null, 2) }];
  }

  private switchScene(args: Record<string, unknown>): McpContent[] {
    for (const s of this.scenes) {
      s.active = s._id === args.id;
    }
    const scene = this.scenes.find(s => s.active);
    return [{ type: 'text', text: JSON.stringify({ success: true, scene: scene?.name || 'Unknown' }) }];
  }

  private searchCompendium(args: Record<string, unknown>): McpContent[] {
    const query = String(args.query || '').toLowerCase();
    const packs = args.packs as string[] | undefined;
    let results = this.compendiumItems.filter(item =>
      item.name.toLowerCase().includes(query)
    );
    if (packs && packs.length > 0) {
      results = results.filter(item => packs.includes(item.pack));
    }
    const limit = Number(args.limit) || 10;
    return [{ type: 'text', text: JSON.stringify(results.slice(0, limit), null, 2) }];
  }

  private getCompendiumItem(args: Record<string, unknown>): McpContent[] {
    const item = this.compendiumItems.find(
      i => i.pack === args.pack && i.id === args.id
    );
    if (!item) {
      return [{ type: 'text', text: JSON.stringify({ error: 'Compendium item not found' }) }];
    }
    return [{ type: 'text', text: JSON.stringify(item, null, 2) }];
  }

  private listCompendiumPacks(): McpContent[] {
    return [{ type: 'text', text: JSON.stringify(this.compendiumPacks, null, 2) }];
  }

  private getCombatState(): McpContent[] {
    return [{ type: 'text', text: JSON.stringify(this.combat, null, 2) }];
  }

  private rollInitiative(args: Record<string, unknown>): McpContent[] {
    const roll = Math.floor(Math.random() * 20) + 1;
    const modifier = 2;
    const result = {
      combatantId: args.combatantId || 'combatant-kaelith-001',
      formula: '1d20 + 2',
      roll,
      total: roll + modifier,
    };
    return [{ type: 'text', text: JSON.stringify(result, null, 2) }];
  }

  private rollDice(args: Record<string, unknown>): McpContent[] {
    const formula = String(args.formula || '1d20');
    // Simple dice roller: parse XdY+Z
    const match = formula.match(/^(\d+)d(\d+)([+-]\d+)?$/i);
    let total = 0;
    const rolls: number[] = [];

    if (match) {
      const count = parseInt(match[1], 10);
      const sides = parseInt(match[2], 10);
      const modifier = match[3] ? parseInt(match[3], 10) : 0;

      for (let i = 0; i < count; i++) {
        const roll = Math.floor(Math.random() * sides) + 1;
        rolls.push(roll);
        total += roll;
      }
      total += modifier;
    } else {
      total = Math.floor(Math.random() * 20) + 1;
      rolls.push(total);
    }

    const result = {
      formula,
      rolls,
      total,
      flavor: args.flavor || null,
      speaker: args.speaker || null,
    };
    return [{ type: 'text', text: JSON.stringify(result, null, 2) }];
  }

  private listJournals(): McpContent[] {
    const summary = this.journals.map(j => ({
      _id: j._id,
      name: j.name,
      folder: j.folder,
    }));
    return [{ type: 'text', text: JSON.stringify(summary, null, 2) }];
  }

  private searchJournals(args: Record<string, unknown>): McpContent[] {
    const query = String(args.query || '').toLowerCase();
    const results = this.journals.filter(j =>
      j.name.toLowerCase().includes(query) || j.content.toLowerCase().includes(query)
    );
    return [{ type: 'text', text: JSON.stringify(results, null, 2) }];
  }

  private createJournal(args: Record<string, unknown>): McpContent[] {
    const journal = {
      _id: `journal-${Date.now()}`,
      name: String(args.name),
      content: String(args.content),
      folder: args.folder ? String(args.folder) : null,
    };
    this.journals.push(journal);
    return [{ type: 'text', text: JSON.stringify({ success: true, journal }, null, 2) }];
  }

  private listTokens(args: Record<string, unknown>): McpContent[] {
    const sceneId = args.sceneId as string | undefined;
    const scene = sceneId
      ? this.scenes.find(s => s._id === sceneId)
      : this.scenes.find(s => s.active);

    if (!scene) {
      return [{ type: 'text', text: JSON.stringify({ error: 'Scene not found' }) }];
    }
    return [{ type: 'text', text: JSON.stringify(scene.tokens, null, 2) }];
  }

  private getTokenDetails(args: Record<string, unknown>): McpContent[] {
    const tokenId = String(args.tokenId);
    for (const scene of this.scenes) {
      const tokens = scene.tokens as Array<Record<string, unknown>>;
      const token = tokens.find((t: Record<string, unknown>) => t._id === tokenId);
      if (token) {
        return [{ type: 'text', text: JSON.stringify(token, null, 2) }];
      }
    }
    return [{ type: 'text', text: JSON.stringify({ error: 'Token not found' }) }];
  }

  private moveToken(args: Record<string, unknown>): McpContent[] {
    const tokenId = String(args.tokenId);
    const x = Number(args.x);
    const y = Number(args.y);

    for (const scene of this.scenes) {
      const tokens = scene.tokens as Array<Record<string, unknown>>;
      const token = tokens.find((t: Record<string, unknown>) => t._id === tokenId);
      if (token) {
        token.x = x;
        token.y = y;
        return [{ type: 'text', text: JSON.stringify({ success: true, token }, null, 2) }];
      }
    }
    return [{ type: 'text', text: JSON.stringify({ error: 'Token not found' }) }];
  }
}
