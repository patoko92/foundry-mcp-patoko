/**
 * Advancement handler — D&D 5e advancement support for MCP.
 *
 * The D&D5e system v4 uses an Advancement system for class/background/race/subclass
 * choices: skill proficiencies, fighting styles, subclass selection, ASI, etc.
 *
 * This module provides two tools:
 * - listAdvancements: List advancements on an item with their state
 * - applyAdvancement: Apply a choice to a specific advancement
 *
 * Approach: Rather than reimplementing each advancement type's apply() logic,
 * we create a shallow actor clone, call advancement.apply() on it, then diff
 * the clone against the real actor to determine database updates.
 */

// Import types for Foundry globals (dnd5e, foundry, fromUuidSync, etc.)
import './types.js';

interface QueryResult {
  content: { type: 'text'; text: string }[];
  isError?: boolean;
}

function success(data: unknown): QueryResult {
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  };
}

function error(message: string): QueryResult {
  return {
    content: [{ type: 'text', text: message }],
    isError: true,
  };
}

// ─── listAdvancements ──────────────────────────────────────────────

/**
 * List all advancements on an item (class, subclass, background, race).
 * Returns each advancement's type, configuration, current value, and whether
 * it's been configured for the relevant level.
 */
export async function listAdvancements(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    const actorId = args.actorId as string;
    const itemId = args.itemId as string;
    const level = args.level as number | undefined;

    if (!actorId) return error('actorId is required');
    if (!itemId) return error('itemId is required');

    const actor = game.actors.get(actorId);
    if (!actor) return error(`Actor not found: ${actorId}`);

    const item = actor.items.get(itemId);
    if (!item) return error(`Item not found on actor: ${itemId}`);

    const advData = item.system?.advancement;
    if (!advData || !Array.isArray(advData) || advData.length === 0) {
      return success({
        itemId,
        itemName: item.name,
        itemType: item.type,
        advancements: [],
        msg: 'No advancements on this item',
      });
    }

    // Get the D&D5e advancement class types for metadata
    const Advancement = dnd5e?.documents?.advancement?.Advancement;
    const advTypes: Record<string, any> = {};
    if (Advancement?.typeLabels) {
      for (const [key] of Object.entries(Advancement.typeLabels)) {
        advTypes[key] = true;
      }
    }

    const advancements = advData.map((a: any) => {
      // Determine if configured: check if value is non-empty
      const value = a.value ?? {};
      const hasValue = !foundry.utils.isEmpty(value);

      // For multi-level advancements (HitPoints, ItemChoice, ScaleValue),
      // check if the specific level has been configured
      let configured = hasValue;
      if (level !== undefined && a.type === 'HitPoints') {
        configured = value[level] !== undefined && value[level] !== null;
      } else if (level !== undefined && a.type === 'ItemChoice') {
        configured = !!(value.added && value.added[level] !== undefined);
      } else if (level !== undefined && a.type === 'ScaleValue') {
        // ScaleValue doesn't require user input — it auto-applies
        configured = true;
      }

      return {
        id: a._id,
        type: a.type,
        title: a.title || a.type,
        hint: a.hint || '',
        level: a.level,
        configured,
        configuration: a.configuration ?? {},
        value,
      };
    });

    return success({
      itemId,
      itemName: item.name,
      itemType: item.type,
      actorLevel: actor.system?.details?.level ?? 1,
      advancements,
    });
  } catch (err) {
    return error(`Failed to list advancements: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// ─── applyAdvancement ──────────────────────────────────────────────

/**
 * Apply a choice to a specific advancement on an actor's item.
 *
 * Uses a clone-and-diff pattern: creates a shallow actor clone, applies the
 * advancement on the clone using the system's own apply() method, then diffs
 * the clone against the real actor to determine and execute database updates.
 *
 * This approach reuses all of D&D5e's advancement logic without reimplementation.
 */
export async function applyAdvancement(
  args: Record<string, unknown>
): Promise<QueryResult> {
  try {
    const actorId = args.actorId as string;
    const itemId = args.itemId as string;
    const advancementId = args.advancementId as string;
    const level = args.level as number;
    const data = args.data as Record<string, unknown>;

    if (!actorId) return error('actorId is required');
    if (!itemId) return error('itemId is required');
    if (!advancementId) return error('advancementId is required');
    if (level === undefined || level === null) return error('level is required');
    if (!data) return error('data is required');

    const actor = game.actors.get(actorId);
    if (!actor) return error(`Actor not found: ${actorId}`);

    const item = actor.items.get(itemId);
    if (!item) return error(`Item not found on actor: ${itemId}`);

    // Get the advancement class from the D&D5e system
    const advancementClasses = dnd5e?.documents?.advancement;
    if (!advancementClasses) {
      return error('D&D5e advancement system not available');
    }

    // Find the raw advancement data on the item
    const advRawData = (item.system?.advancement ?? []).find(
      (a: any) => a._id === advancementId
    );
    if (!advRawData) {
      return error(`Advancement not found: ${advancementId}`);
    }

    // Map type names to classes
    const typeToClass: Record<string, any> = {
      Trait: advancementClasses.TraitAdvancement,
      ItemGrant: advancementClasses.ItemGrantAdvancement,
      ItemChoice: advancementClasses.ItemChoiceAdvancement,
      AbilityScoreImprovement: advancementClasses.AbilityScoreImprovementAdvancement,
      HitPoints: advancementClasses.HitPointsAdvancement,
      Size: advancementClasses.SizeAdvancement,
      Subclass: advancementClasses.SubclassAdvancement,
      ScaleValue: advancementClasses.ScaleValueAdvancement,
      ModifyItems: advancementClasses.ModifyItemsAdvancement,
    };

    const AdvClass = typeToClass[advRawData.type];
    if (!AdvClass) {
      return error(`Unknown advancement type: ${advRawData.type}`);
    }

    // ── Clone-and-diff approach ──
    // Create a shallow clone of the actor
    const clone = actor.clone({}, { keepId: true });
    const clonedItem = clone.items.get(itemId);
    if (!clonedItem) {
      return error(`Item not found on cloned actor: ${itemId}`);
    }

    // Get the Advancement instance on the clone
    const clonedAdvancement = clonedItem.advancement?.byId?.[advancementId];
    if (!clonedAdvancement) {
      return error(`Advancement not found on cloned item: ${advancementId}`);
    }

    // Record pre-apply item state for diffing
    const preItemIds = new Set(clone.items.map((i: any) => i.id));

    // Call apply() on the clone — this is the D&D5e system's own logic
    await clonedAdvancement.apply(level, data, { initial: false });

    // ── Diff: find what changed ──
    const postItems = clone.items.contents;

    // New items created by the advancement (e.g. ItemGrant, ItemChoice, Subclass)
    const newItems: any[] = [];
    for (const i of postItems) {
      if (!preItemIds.has(i.id)) {
        newItems.push(i.toObject());
      }
    }

    // Actor-level changes (from updateSource on clone)
    // We compute the diff between clone and original actor data
    const cloneData = clone.toObject();
    delete cloneData.items; // Handle items separately

    const actorData = actor.toObject();
    delete actorData.items;

    // Build actor updates by diffing the relevant paths
    const actorUpdates: Record<string, any> = {};
    _diffActorUpdates(actorData, cloneData, actorUpdates, '');

    // Get the updated advancement data from the cloned item
    const clonedItemData = clonedItem.toObject();
    const updatedAdvData = (clonedItemData.system?.advancement ?? []).find(
      (a: any) => a._id === advancementId
    );

    // ── Apply changes to real actor ──
    const results: any = { advancementId, type: advRawData.type, level };

    // 1. Apply actor-level updates (ability scores, traits, size, etc.)
    if (Object.keys(actorUpdates).length > 0) {
      await actor.update(actorUpdates);
      results.actorUpdates = Object.keys(actorUpdates);
    }

    // 2. Create new items (from ItemGrant, ItemChoice, Subclass, ASI feat)
    if (newItems.length > 0) {
      const created = await actor.createEmbeddedDocuments('Item', newItems, { keepId: true });
      results.itemsCreated = created.map((i: any) => ({
        id: i.id,
        name: i.name,
        type: i.type,
      }));

      // Update advancement value on the real item to reflect created item IDs
      // The clone's advancement value references clone IDs, which are the same
      // as the created IDs (keepId: true), so we can use the updated adv data directly
    }

    // 3. Update the advancement value on the real actor's embedded item
    if (updatedAdvData) {
      // Build the update for just the advancement value
      const realItemData = item.toObject();
      const advIndex = (realItemData.system?.advancement ?? []).findIndex(
        (a: any) => a._id === advancementId
      );

      if (advIndex >= 0) {
        // Update the advancement's value in the item's data
        const advUpdatePath = `system.advancement.${advIndex}.value`;
        await actor.updateEmbeddedDocuments('Item', [{
          _id: itemId,
          [advUpdatePath]: updatedAdvData.value,
        }]);
        results.advancementValue = updatedAdvData.value;
      }
    }

    // 4. Handle embedded item updates (e.g. spell ability on granted spells)
    const preItems = actor.items.contents;
    const preItemMap = new Map<string, any>(preItems.map((i: any) => [i.id, i]));
    const postItemUpdates: any[] = [];
    for (const clonedI of postItems) {
      if (preItemIds.has(clonedI.id)) {
        // Existing item — check if it was modified
        const realItem = preItemMap.get(clonedI.id);
        if (realItem) {
          const clonedObj = clonedI.toObject();
          const realObj = realItem.toObject();
          // Only update if something actually changed
          if (JSON.stringify(clonedObj.system) !== JSON.stringify(realObj.system)) {
            postItemUpdates.push({
              _id: clonedI.id,
              system: clonedObj.system,
            });
          }
        }
      }
    }
    if (postItemUpdates.length > 0) {
      await actor.updateEmbeddedDocuments('Item', postItemUpdates);
      results.itemsUpdated = postItemUpdates.map((u: any) => u._id);
    }

    results.msg = `Advancement applied successfully`;
    return success(results);
  } catch (err) {
    return error(`Failed to apply advancement: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// ─── Helper: Diff actor data to find update paths ──────────────────

/**
 * Recursively diff two actor data objects to find paths that changed.
 * Only collects leaf-level changes suitable for actor.update().
 */
function _diffActorUpdates(
  original: any,
  modified: any,
  updates: Record<string, any>,
  prefix: string
): void {
  if (original === modified) return;
  if (typeof original !== 'object' || typeof modified !== 'object' ||
      original === null || modified === null) {
    if (original !== modified) {
      updates[prefix] = modified;
    }
    return;
  }

  // Handle arrays
  if (Array.isArray(original) && Array.isArray(modified)) {
    if (JSON.stringify(original) !== JSON.stringify(modified)) {
      updates[prefix] = modified;
    }
    return;
  }
  if (Array.isArray(original) !== Array.isArray(modified)) {
    updates[prefix] = modified;
    return;
  }

  // Diff object keys
  const allKeys = new Set([...Object.keys(original), ...Object.keys(modified)]);
  for (const key of allKeys) {
    // Skip items array (handled separately)
    if (key === 'items' && prefix === '') continue;
    // Skip flags (advancement system uses internal flags)
    if (key === 'flags') continue;
    // Skip _stats, _id, etc.
    if (key.startsWith('_')) continue;

    const path = prefix ? `${prefix}.${key}` : key;
    if (!(key in original)) {
      updates[path] = modified[key];
    } else if (!(key in modified)) {
      // Key was deleted — skip for safety
    } else {
      _diffActorUpdates(original[key], modified[key], updates, path);
    }
  }
}
