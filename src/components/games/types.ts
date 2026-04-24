import type { Topic } from "@/data/topics";

export interface MiniGameProps {
  topics: Topic[];
  onResult: (topic: Topic) => void;
}
