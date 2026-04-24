import type { Topic } from "@/data/topics";
import type { SuggestionTag } from "@/lib/filterTopics";
import { pickDiverseRandomTopics } from "@/lib/filterTopics";

const TARGET_MIN = 8;
/** Max slices from defaults + tags (no personal topics). */
const BASE_WHEEL_MAX = 8;
/** Max slices when personal topics (input field) are included. */
export const TOTAL_WHEEL_MAX_WITH_PERSONAL = 15;

type RandomFn = () => number;

function shuffle<T>(items: T[], random: RandomFn): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
  }
  return copy;
}

function topicsMatchingTags(pool: Topic[], tags: SuggestionTag[]): Topic[] {
  if (tags.length === 0) return [];
  const set = new Set<string>();
  const out: Topic[] = [];
  for (const topic of pool) {
    if (tags.some((tag) => topic.tags.includes(tag))) {
      if (!set.has(topic.id)) {
        set.add(topic.id);
        out.push(topic);
      }
    }
  }
  return out;
}

function pickEvenlyAcrossTags(pool: Topic[], tags: SuggestionTag[], random: RandomFn): Topic[] {
  const matched = topicsMatchingTags(pool, tags);
  const uniqueTags = Array.from(new Set(tags));
  const target = Math.min(BASE_WHEEL_MAX, matched.length);
  const tagOrder = shuffle(uniqueTags, random);
  const remainderTags = new Set(tagOrder.slice(0, target % tagOrder.length));
  const basePerTag = Math.floor(target / tagOrder.length);

  const buckets = new Map<SuggestionTag, Topic[]>(
    tagOrder.map((tag) => [tag, shuffle(matched.filter((topic) => topic.tags.includes(tag)), random)]),
  );

  const selected: Topic[] = [];
  const selectedIds = new Set<string>();
  const quotaRemaining = new Map<SuggestionTag, number>(
    tagOrder.map((tag) => [tag, basePerTag + (remainderTags.has(tag) ? 1 : 0)]),
  );

  // Round-robin pick: take at most one per selected tag each pass, so slices alternate by tag.
  while (selected.length < target) {
    let madeProgress = false;
    for (const tag of tagOrder) {
      if (selected.length >= target) break;
      const left = quotaRemaining.get(tag) ?? 0;
      if (left <= 0) continue;
      const bucket = buckets.get(tag) ?? [];
      while (bucket.length > 0 && selectedIds.has(bucket[0]!.id)) {
        bucket.shift();
      }
      const next = bucket.shift();
      if (!next) continue;
      selected.push(next);
      selectedIds.add(next.id);
      quotaRemaining.set(tag, left - 1);
      madeProgress = true;
    }
    if (!madeProgress) break;
  }

  if (selected.length < target) {
    const fallback = shuffle(matched, random);
    for (const topic of fallback) {
      if (selected.length >= target) break;
      if (selectedIds.has(topic.id)) continue;
      selected.push(topic);
      selectedIds.add(topic.id);
    }
  }

  return selected;
}

export function isPersonalWheelTopic(topic: Topic): boolean {
  return topic.id.startsWith("custom-");
}

/**
 * Default wheel only (no `custom-` topics): up to 8 slices.
 * - No tag filter: diverse random picks from full filtered pool.
 * - Tag filter active: picks only from matched-tag pool (no non-tag padding).
 */
export function buildInitialWheelTopics(pool: Topic[], suggestionTags: SuggestionTag[], random: RandomFn): Topic[] {
  if (pool.length === 0) return [];
  let selected: Topic[] = [];
  if (suggestionTags.length === 0) {
    selected = pickDiverseRandomTopics(pool, Math.min(TARGET_MIN, pool.length), random);
  } else {
    selected = pickEvenlyAcrossTags(pool, suggestionTags, random);
  }
  return selected.slice(0, BASE_WHEEL_MAX);
}

/** Append personal (`custom-`) topics from the full pool until `totalMax` (default 15). */
export function mergePersonalTopicsOntoWheel(
  base: Topic[],
  fullPool: Topic[],
  totalMax: number = TOTAL_WHEEL_MAX_WITH_PERSONAL,
): Topic[] {
  const baseIds = new Set(base.map((t) => t.id));
  const personalInPool = fullPool.filter((t) => isPersonalWheelTopic(t) && !baseIds.has(t.id));
  const room = Math.max(0, totalMax - base.length);
  return [...base, ...personalInPool.slice(0, room)];
}
