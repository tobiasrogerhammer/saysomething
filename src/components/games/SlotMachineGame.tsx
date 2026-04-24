"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { pickRandomTopic } from "@/lib/filterTopics";
import type { MiniGameProps } from "./types";

function getWords(text: string): [string, string, string] {
  const words = text.replace(/[?!.,]/g, "").split(" ").filter(Boolean);
  return [words[0] ?? "Talk", words[1] ?? "about", words[2] ?? "this"];
}

export function SlotMachineGame({ topics, onResult }: MiniGameProps) {
  const [reels, setReels] = useState(["?", "?", "?"]);
  const [isRolling, setIsRolling] = useState(false);

  const roll = () => {
    const selected = pickRandomTopic(topics);
    if (!selected) return;

    const [a, b, c] = getWords(selected.text);
    setIsRolling(true);
    setReels(["...", "...", "..."]);

    window.setTimeout(() => setReels([a, "...", "..."]), 300);
    window.setTimeout(() => setReels([a, b, "..."]), 600);
    window.setTimeout(() => {
      setReels([a, b, c]);
      setIsRolling(false);
      onResult(selected);
    }, 900);
  };

  return (
    <div className="space-y-4">
      <div className="mx-auto flex w-full max-w-sm gap-2 rounded-xl bg-emerald-100 p-4">
        {reels.map((word, index) => (
          <div key={`${word}-${index}`} className="flex h-20 flex-1 items-center justify-center rounded-lg bg-white font-semibold shadow-inner">
            {word}
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground">Reels stop one by one every 300ms.</p>
      <div className="flex justify-center">
        <Button onClick={roll} disabled={isRolling || topics.length === 0} className="bg-emerald-600 hover:bg-emerald-700">
          {isRolling ? "Rolling..." : "Roll Slots"}
        </Button>
      </div>
    </div>
  );
}
