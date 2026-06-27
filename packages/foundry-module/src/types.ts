/**
 * Foundry VTT ambient type declarations.
 * These globals are injected by the Foundry runtime in the browser.
 * We declare them here so TypeScript doesn't complain.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
  // Core Foundry globals
  const game: Game;
  const canvas: Canvas;
  const Hooks: HooksApi;
  const ui: UiApi;
  const Roll: RollConstructor;
  const Actor: DocumentConstructor;
  const Scene: DocumentConstructor;
  const JournalEntry: DocumentConstructor;
  const Token: any;
  const Combat: DocumentConstructor;
  const ChatMessage: DocumentConstructor;
  const Folder: DocumentConstructor;

  interface Game {
    world: { id: string; name: string; title: string; description: string };
    system: { id: string; version: string };
    version: string;
    data: { version: string };
    user: { id: string; name: string; role: number; isGM: boolean } | null;
    users: { id: string; name: string; role: number }[] & { get(id: string): any };
    actors: DocumentCollection<any>;
    scenes: DocumentCollection<any> & { current: any };
    journal: DocumentCollection<any>;
    combat: any;
    macros: DocumentCollection<any>;
    folders: DocumentCollection<any>;
    tables: DocumentCollection<any>;
    packs: CompendiumCollection;
    modules: {
      get(id: string): {
        id: string;
        active: boolean;
        api?: any;
        title?: string;
      } | undefined;
    };
    settings: {
      register(namespace: string, key: string, data: SettingConfig): void;
      get(namespace: string, key: string): any;
      set(namespace: string, key: string, value: any): Promise<any>;
    };
    i18n: {
      localize(key: string): string;
    };
  }

  interface Canvas {
    tokens: {
      placeables: TokenDocument[];
    };
    scene: any;
  }

  interface DocumentCollection<T> {
    contents: T[];
    get(id: string, options?: { strict?: boolean }): T | undefined;
    getName(name: string): T | undefined;
  }

  interface CompendiumCollection {
    filter(
      predicate: (pack: CompendiumPack) => boolean
    ): CompendiumPack[];
    get(packId: string): CompendiumPack | undefined;
  }

  interface CompendiumPack {
    collection: string;
    metadata: {
      id: string;
      label: string;
      type: string;
      name: string;
    };
    getDocuments(query?: any): Promise<any[]>;
    getDocument(id: string): Promise<any | null>;
  }

  interface TokenDocument {
    id: string;
    name: string;
    actorId: string;
    x: number;
    y: number;
    img: string;
    width: number;
    height: number;
    hidden: boolean;
    disposition: number;
    document: {
      update(data: Record<string, any>): Promise<any>;
    };
    actor: any;
  }

  interface HooksApi {
    once(event: string, fn: (...args: any[]) => void): void;
    on(event: string, fn: (...args: any[]) => void): void;
    off(event: string, fn: (...args: any[]) => void): void;
    call(event: string, ...args: any[]): boolean;
  }

  interface UiApi {
    notifications: {
      info(message: string): void;
      warn(message: string): void;
      error(message: string): void;
    };
  }

  interface RollConstructor {
    new (formula: string, data?: any): RollInstance;
  }

  interface RollInstance {
    evaluate(options?: any): Promise<RollInstance> | RollInstance;
    roll(): RollInstance;
    toMessage(data?: any, options?: any): Promise<any>;
    total: number;
    formula: string;
    terms: any[];
    json: string;
  }

  interface DocumentConstructor {
    create(
      data: Record<string, any> | Record<string, any>[],
      options?: any
    ): Promise<any>;
    new (...args: any[]): any;
  }

  interface SettingConfig {
    name: string;
    hint?: string;
    scope: 'world' | 'client';
    config: boolean;
    type: typeof String | typeof Number | typeof Boolean | typeof Object;
    default: any;
    choices?: Record<string, string>;
    range?: { min: number; max: number; step: number };
  }
}

export {};
