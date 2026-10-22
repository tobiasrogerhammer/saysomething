"use client";

import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type WheelControlsProps = {
  phase: "setup" | "spinning" | "redistributing" | "result" | "finished";
  sliceCount: number;
  onSpin: () => void;
  onReset: () => void;
};

export function WheelControls({ phase, sliceCount, onSpin, onReset }: WheelControlsProps) {
  const busy = phase === "spinning" || phase === "redistributing";
  const spinDisabled = busy || sliceCount === 0 || phase === "finished";

  const spinLabel = (() => {
    if (phase === "spinning") return "Spinning…";
    if (phase === "redistributing") return "Updating…";
    if (phase === "finished") return "Spin";
    if (phase === "result") return "Spin again";
    return "Spin the wheel";
  })();

  return (
    <div className="flex w-full min-w-0 shrink-0 flex-row items-center justify-center gap-2.5 sm:gap-3">
      <Button
        type="button"
        variant="secondary"
        className="min-h-11 flex-1 touch-manipulation border-violet-200 bg-violet-50/90 text-base text-violet-900 hover:bg-violet-100 sm:h-13 sm:min-h-13 sm:min-w-48 sm:flex-none sm:px-7 sm:text-lg"
        onClick={onReset}
      >
        <span className="inline-flex items-center gap-1.5">
          <RefreshCcw className="size-4" aria-hidden />
          <span>Reset game</span>
        </span>
      </Button>
      <Button
        type="button"
        onClick={onSpin}
        disabled={spinDisabled}
        className="min-h-11 flex-1 touch-manipulation bg-fuchsia-600 text-base hover:bg-fuchsia-700 sm:h-13 sm:min-h-13 sm:min-w-48 sm:flex-none sm:px-7 sm:text-lg"
      >
        {spinLabel}
      </Button>
    </div>
  );
}
