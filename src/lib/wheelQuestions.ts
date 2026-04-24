import type { Topic, TopicTag } from "@/data/topics";

const MIN_BANK = 3;

function primaryTag(topic: Topic): string {
  return topic.tags[0] ?? "storytelling";
}

/** Build at least `MIN_BANK` prompt strings per topic from the pool (topic text + same-tag neighbors). */
export function buildQuestionBank(topic: Topic, pool: Topic[]): string[] {
  const tag = primaryTag(topic);
  const sameTag = pool.filter((t) => t.id !== topic.id && t.tags.includes(tag as TopicTag)).map((t) => t.text);
  const out: string[] = [topic.text];
  for (const text of sameTag) {
    if (!out.includes(text)) out.push(text);
    if (out.length >= MIN_BANK) break;
  }
  for (const t of pool) {
    if (out.length >= MIN_BANK) break;
    if (t.id === topic.id) continue;
    if (!out.includes(t.text)) out.push(t.text);
  }
  while (out.length < MIN_BANK) {
    out.push(topic.text);
  }
  return out.slice(0, Math.max(MIN_BANK, out.length));
}

/** Deterministic next question: prefer unused in session, then cycle. */
export function pickNextQuestionText(topic: Topic, pool: Topic[], askedForTopic: string[]): string {
  const bank = buildQuestionBank(topic, pool);
  const unused = bank.find((q) => !askedForTopic.includes(q));
  if (unused) return unused;
  if (bank.length === 0) return topic.text;
  return bank[askedForTopic.length % bank.length] ?? topic.text;
}
