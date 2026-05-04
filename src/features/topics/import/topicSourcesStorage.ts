import { topics, type Topic } from "@/allTopics/topics";

export const TOPIC_SOURCES_STORAGE_KEY = "saysomething.topicSources.v1";

export type StoredTopicSources = {
  fileTopics: Topic[] | null;
  selectedTopicFileName: string | null;
  pastedTopics: Topic[] | null;
  pastedTopicsDraft: string;
  lastAppliedPastedRaw: string;
};

export function mergeTopicSources(nextFileTopics: Topic[] | null, nextPastedTopics: Topic[] | null): Topic[] {
  if (!nextFileTopics && !nextPastedTopics) {
    return topics;
  }

  const out: Topic[] = [];
  const seen = new Set<string>();
  const appendSource = (source: Topic[] | null, prefix: string) => {
    if (!source) return;
    source.forEach((topic, index) => {
      const normalized = { ...topic, id: `${prefix}-${index + 1}-${topic.id}` };
      if (seen.has(normalized.id)) return;
      seen.add(normalized.id);
      out.push(normalized);
    });
  };

  appendSource(nextFileTopics, "file");
  appendSource(nextPastedTopics, "paste");
  return out;
}

export function emptyStoredTopicSources(): StoredTopicSources {
  return {
    fileTopics: null,
    selectedTopicFileName: null,
    pastedTopics: null,
    pastedTopicsDraft: "",
    lastAppliedPastedRaw: "",
  };
}

export function readStoredTopicSources(): StoredTopicSources {
  if (typeof window === "undefined") {
    return emptyStoredTopicSources();
  }

  const raw = window.localStorage.getItem(TOPIC_SOURCES_STORAGE_KEY);
  if (!raw) {
    return emptyStoredTopicSources();
  }

  try {
    const parsed = JSON.parse(raw) as {
      version?: number;
      fileTopics?: Topic[] | null;
      selectedTopicFileName?: string | null;
      pastedTopics?: Topic[] | null;
      pastedTopicsDraft?: string;
      lastAppliedPastedRaw?: string;
    };
    if (parsed.version !== 1) throw new Error("invalid-version");

    return {
      fileTopics: Array.isArray(parsed.fileTopics) ? parsed.fileTopics : null,
      selectedTopicFileName: typeof parsed.selectedTopicFileName === "string" ? parsed.selectedTopicFileName : null,
      pastedTopics: Array.isArray(parsed.pastedTopics) ? parsed.pastedTopics : null,
      pastedTopicsDraft: typeof parsed.pastedTopicsDraft === "string" ? parsed.pastedTopicsDraft : "",
      lastAppliedPastedRaw: typeof parsed.lastAppliedPastedRaw === "string" ? parsed.lastAppliedPastedRaw : "",
    };
  } catch {
    window.localStorage.removeItem(TOPIC_SOURCES_STORAGE_KEY);
    return emptyStoredTopicSources();
  }
}
