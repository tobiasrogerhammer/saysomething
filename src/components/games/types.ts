import type { Topic } from "@/allTopics/topics";

export interface MiniGameProps {
  topics: Topic[];
  onResult: (topic: Topic) => void;
}
