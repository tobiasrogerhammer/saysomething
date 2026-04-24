import type { Topic, TopicTag } from "@/data/topics";
export const SUGGESTION_TAGS = [
  "sports",
  "hobbies",
  "goals",
  "experiences",
  "storytelling",
  "music",
  "nostalgia",
  "travel",
  "food",
  "learning",
  "relationships",
  "creativity",
] as const;
export type SuggestionTag = (typeof SUGGESTION_TAGS)[number];

export type TopicFilters = {
  safeMode: boolean;
  depthLevels: Array<1 | 2 | 3>;
  suggestionTags?: SuggestionTag[];
};

export function filterTopics(topics: Topic[], filters: TopicFilters): Topic[] {
  return topics.filter((topic) => {
    if (filters.safeMode && topic.safetyLevel !== "safe") {
      return false;
    }

    if (!filters.depthLevels.includes(topic.depthLevel)) {
      return false;
    }

    if (filters.suggestionTags && filters.suggestionTags.length > 0) {
      return filters.suggestionTags.some((suggestionTag) => topic.tags.includes(suggestionTag as TopicTag));
    }

    return true;
  });
}

export function matchesSuggestionTag(topic: Topic, suggestionTag: SuggestionTag): boolean {
  if (topic.tags.includes(suggestionTag as TopicTag)) {
    return true;
  }
  const text = topic.text.toLowerCase();
  const checks: Record<SuggestionTag, string[]> = {
    sports: ["sport", "game", "play", "team"],
    hobbies: ["hobby", "activity", "ritual", "skill", "book"],
    goals: ["goal", "success", "habit", "improve", "pursu"],
    experiences: ["memory", "childhood", "growing", "travel", "age"],
    storytelling: ["story", "moment", "scene", "remember", "laugh"],
    music: ["music", "song", "soundtrack", "lyrics", "sound"],
    nostalgia: ["smell", "sound", "takes you back", "picture", "relatable"],
    travel: ["travel", "trip", "destination", "city", "visit", "town"],
    food: ["food", "meal", "recipe", "cook", "picnic", "flavor"],
    learning: ["learn", "book", "teach", "skill", "advice", "subject"],
    relationships: ["friend", "family", "relationship", "apology", "kind", "empathy"],
    creativity: ["creative", "design", "fictional", "world", "soundtrack", "character"],
  };

  return checks[suggestionTag].some((keyword) => text.includes(keyword));
}

export function getPlayableTopics(topics: Topic[], seenTopicIds: Set<string>): Topic[] {
  const unseen = topics.filter((topic) => !seenTopicIds.has(topic.id));
  return unseen.length > 0 ? unseen : topics;
}

type RandomFn = () => number;

function shuffle<T>(items: T[], random: RandomFn = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
  }
  return copy;
}

export function pickDiverseRandomTopics(topics: Topic[], count: number, random: RandomFn = Math.random): Topic[] {
  if (count <= 0 || topics.length === 0) return [];
  if (topics.length <= count) return shuffle(topics, random);

  const byTag = new Map<TopicTag, Topic[]>();
  for (const topic of topics) {
    for (const tag of topic.tags) {
      const current = byTag.get(tag) ?? [];
      current.push(topic);
      byTag.set(tag, current);
    }
  }

  const selected: Topic[] = [];
  const selectedIds = new Set<string>();

  for (const tag of shuffle(Array.from(byTag.keys()), random)) {
    const bucket = shuffle(byTag.get(tag) ?? [], random);
    const candidate = bucket.find((topic) => !selectedIds.has(topic.id));
    if (!candidate) continue;
    selected.push(candidate);
    selectedIds.add(candidate.id);
    if (selected.length === count) return selected;
  }

  for (const candidate of shuffle(topics, random)) {
    if (selectedIds.has(candidate.id)) continue;
    selected.push(candidate);
    selectedIds.add(candidate.id);
    if (selected.length === count) break;
  }

  return selected;
}

export function pickRandomTopic(topics: Topic[]): Topic | null {
  if (topics.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * topics.length);
  return topics[randomIndex] ?? null;
}
