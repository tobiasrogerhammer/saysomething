"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { pickRandomTopic } from "@/lib/filterTopics";
import type { MiniGameProps } from "./types";

export function MysteryEnvelopeGame({ topics, onResult }: MiniGameProps) {
  const [isOpening, setIsOpening] = useState(false);

  const openEnvelope = () => {
    const selected = pickRandomTopic(topics);
    if (!selected) return;

    setIsOpening(true);
    window.setTimeout(() => {
      onResult(selected);
      setIsOpening(false);
    }, 1000);
  };

  return (
    <div className="space-y-4">
      <div className="mx-auto flex h-48 w-72 items-center justify-center">
        <div className="relative h-40 w-full">
          <div className="absolute inset-x-0 bottom-0 h-24 rounded-b-xl bg-violet-500" />
          <div
            className={`absolute inset-x-0 top-0 mx-auto h-20 w-full origin-top rounded-t-xl bg-violet-400 transition-transform duration-700 ${
              isOpening ? "-rotate-[140deg]" : "rotate-0"
            }`}
          />
          <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white">
            {isOpening ? "Opening..." : "Mystery Envelope"}
          </div>
        </div>
      </div>
      <p className="text-center text-sm text-muted-foreground">Click to tear it open and reveal a topic.</p>
      <div className="flex justify-center">
        <Button onClick={openEnvelope} disabled={isOpening || topics.length === 0} className="bg-violet-600 hover:bg-violet-700">
          {isOpening ? "Revealing..." : "Open Envelope"}
        </Button>
      </div>
    </div>
  );
}
