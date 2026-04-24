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

export function isPersonalWheelTopic(topic: Topic): boolean {
  return topic.id.startsWith("custom-");
}

/**
 * Default wheel only (no `custom-` topics): up to 8 slices — tag matches capped at 8, then padded to 8 from pool.
 */
export function buildInitialWheelTopics(pool: Topic[], suggestionTags: SuggestionTag[], random: RandomFn): Topic[] {
  if (pool.length === 0) return [];
  let selected: Topic[] = [];
  if (suggestionTags.length === 0) {
    selected = pickDiverseRandomTopics(pool, Math.min(TARGET_MIN, pool.length), random);
  } else {
    const matched = topicsMatchingTags(pool, suggestionTags);
    selected =
      matched.length <= BASE_WHEEL_MAX
        ? [...matched]
        : pickDiverseRandomTopics(matched, BASE_WHEEL_MAX, random);
    const onWheel = new Set(selected.map((t) => t.id));
    const padSource = shuffle(
      pool.filter((t) => !onWheel.has(t.id)),
      random,
    );
    while (selected.length < TARGET_MIN && padSource.length > 0) {
      const next = padSource.pop();
      if (next && !onWheel.has(next.id)) {
        selected.push(next);
        onWheel.add(next.id);
      } else {
        break;
      }
    }
    if (selected.length < TARGET_MIN) {
      const filler = shuffle(pool, random).filter((t) => !onWheel.has(t.id));
      for (const t of filler) {
        if (selected.length >= TARGET_MIN) break;
        selected.push(t);
        onWheel.add(t.id);
      }
    }
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
