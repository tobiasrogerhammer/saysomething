import type { Topic } from "@/allTopics/topics";

export function parseUploadedTopics(raw: string): Topic[] {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error("Topic #1 is missing text.");
  }

  const toTopic = (entry: unknown, index: number): Topic => {
    if (typeof entry === "string") {
      const text = entry.trim();
      if (!text) {
        throw new Error(`Topic #${index + 1} is empty.`);
      }
      return {
        id: `upload-${index + 1}`,
        text,
        tags: ["custom"],
        depthLevel: 1,
        safetyLevel: "safe",
      };
    }

    if (!entry || typeof entry !== "object") {
      throw new Error(`Topic #${index + 1} is not a valid object/string.`);
    }

    const candidate = entry as Partial<Topic>;
    const text = typeof candidate.text === "string" ? candidate.text.trim() : "";
    if (!text) {
      throw new Error(`Topic #${index + 1} is missing text.`);
    }

    const tags = Array.isArray(candidate.tags)
      ? candidate.tags.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      : ["custom"];
    const depthLevel = candidate.depthLevel === 1 || candidate.depthLevel === 2 || candidate.depthLevel === 3 ? candidate.depthLevel : 1;
    const safetyLevel = candidate.safetyLevel === "normal" ? "normal" : "safe";
    const id = typeof candidate.id === "string" && candidate.id.trim().length > 0 ? candidate.id : `upload-${index + 1}`;

    return {
      id,
      text,
      tags: tags.length > 0 ? tags : ["custom"],
      depthLevel,
      safetyLevel,
    };
  };

  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed) as unknown;
    } catch {
      throw new Error("Could not parse JSON input. Check formatting near the reported line in your editor.");
    }
    const topicList = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === "object" && Array.isArray((parsed as { topics?: unknown[] }).topics)
        ? (parsed as { topics: unknown[] }).topics
        : null;
    if (!topicList) {
      throw new Error('JSON must be an array or an object with a "topics" array.');
    }
    if (topicList.length === 0) {
      throw new Error("No topics were found in the uploaded JSON.");
    }
    return topicList.map(toTopic);
  }

  const lines = trimmed
    .split(/\r?\n/)
    .map((line, index) => ({ text: line.trim(), row: index + 1 }))
    .filter((entry) => entry.text.length > 0);
  if (lines.length === 0) {
    throw new Error("Topic #1 is missing text.");
  }
  return lines.map((line, index) => {
    if (!line.text) {
      throw new Error(`Topic #${line.row} is missing text.`);
    }
    return toTopic(line.text, index);
  });
}
