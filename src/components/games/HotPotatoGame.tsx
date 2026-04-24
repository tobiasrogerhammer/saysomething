"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { pickRandomTopic } from "@/lib/filterTopics";
import type { MiniGameProps } from "./types";

export function HotPotatoGame({ topics, onResult }: MiniGameProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (timeLeft <= 0 || !selectedId) return;

    const timer = window.setInterval(() => {
      setTimeLeft((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          const selected = topics.find((topic) => topic.id === selectedId);
          if (selected) {
            onResult(selected);
          }
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [timeLeft, selectedId, topics, onResult]);

  const start = () => {
    const selected = pickRandomTopic(topics);
    if (!selected) return;
    setSelectedId(selected.id);
    setTimeLeft(7);
  };

  const dangerColor = timeLeft <= 2 ? "bg-rose-500" : timeLeft <= 4 ? "bg-orange-500" : "bg-amber-400";

  return (
    <div className="space-y-4">
      <div className={`mx-auto flex h-36 w-36 items-center justify-center rounded-full text-3xl font-bold text-white transition-colors ${dangerColor}`}>
        {timeLeft > 0 ? timeLeft : "GO"}
      </div>
      <p className="text-center text-sm text-muted-foreground">Timer gets hotter as it counts down.</p>
      <div className="flex justify-center">
        <Button onClick={start} disabled={timeLeft > 0 || topics.length === 0} className="bg-orange-600 hover:bg-orange-700">
          {timeLeft > 0 ? "Tick... Tick..." : "Start Hot Potato"}
        </Button>
      </div>
    </div>
  );
}
