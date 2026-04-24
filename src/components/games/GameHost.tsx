"use client";

import type { Topic } from "@/data/topics";
import type { GameKey } from "@/store/useTopicStore";
import { FishTankGame } from "./FishTankGame";
import { HotPotatoGame } from "./HotPotatoGame";
import { MysteryEnvelopeGame } from "./MysteryEnvelopeGame";
import { SlotMachineGame } from "./SlotMachineGame";
import { SpinWheelMiniGame } from "./SpinWheelGame";

type GameHostProps = {
  selectedGame: GameKey;
  topics: Topic[];
  onResult: (topic: Topic) => void;
};

export function GameHost({ selectedGame, topics, onResult }: GameHostProps) {
  if (selectedGame === "slot-machine") return <SlotMachineGame topics={topics} onResult={onResult} />;
  if (selectedGame === "fish-tank") return <FishTankGame topics={topics} onResult={onResult} />;
  if (selectedGame === "hot-potato") return <HotPotatoGame topics={topics} onResult={onResult} />;
  if (selectedGame === "mystery-envelope") return <MysteryEnvelopeGame topics={topics} onResult={onResult} />;
  return <SpinWheelMiniGame topics={topics} onResult={onResult} />;
}
