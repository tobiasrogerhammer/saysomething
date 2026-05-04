"use client";

import type { Topic } from "@/allTopics/topics";
import type { GameKey } from "@/store/useTopicStore";
import { SpinWheelMiniGame } from "./SpinWheelGame";

type GameHostProps = {
  selectedGame: GameKey;
  topics: Topic[];
  onResult: (topic: Topic) => void;
};

export function GameHost({ selectedGame, topics, onResult }: GameHostProps) {
  return <SpinWheelMiniGame topics={topics} onResult={onResult} />;
}
