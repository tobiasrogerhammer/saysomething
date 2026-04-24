"use client";

import { useMemo } from "react";
import type { MiniGameProps } from "./types";

export function FishTankGame({ topics, onResult }: MiniGameProps) {
  const fishTopics = useMemo(() => topics.slice(0, 8), [topics]);

  return (
    <div className="space-y-3">
      <div className="relative h-72 overflow-hidden rounded-2xl border bg-cyan-100/80">
        {fishTopics.map((topic, index) => (
          <button
            key={topic.id}
            type="button"
            onClick={() => onResult(topic)}
            className="group absolute rounded-full bg-cyan-500 px-4 py-2 text-sm font-medium text-white shadow-lg transition hover:bg-cyan-600"
            style={{
              top: `${12 + (index % 4) * 22}%`,
              left: `${(index * 11) % 70}%`,
              animation: `swim${index % 3} ${12 + index}s linear infinite`,
            }}
          >
            Fish #{index + 1}
            <span className="ml-2 inline-block -rotate-6 group-hover:rotate-0">&lt;&gt;&lt;</span>
          </button>
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground">Tap a fish to catch a topic.</p>

      <style jsx>{`
        @keyframes swim0 {
          0% { transform: translateX(-40px); }
          50% { transform: translateX(120px); }
          100% { transform: translateX(-40px); }
        }
        @keyframes swim1 {
          0% { transform: translateX(160px); }
          50% { transform: translateX(-40px); }
          100% { transform: translateX(160px); }
        }
        @keyframes swim2 {
          0% { transform: translateX(40px) translateY(0); }
          50% { transform: translateX(120px) translateY(12px); }
          100% { transform: translateX(40px) translateY(0); }
        }
      `}</style>
    </div>
  );
}
