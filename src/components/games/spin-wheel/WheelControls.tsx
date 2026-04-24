"use client";

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
    <div className="flex w-full min-w-0 flex-col items-stretch gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
      <Button
        type="button"
        onClick={onSpin}
        disabled={spinDisabled}
        className="min-h-11 w-full touch-manipulation bg-fuchsia-600 text-base hover:bg-fuchsia-700 sm:min-h-10 sm:w-auto sm:text-sm"
      >
        {spinLabel}
      </Button>
      <Button
        type="button"
        variant="secondary"
        className="min-h-11 w-full touch-manipulation border-violet-200 bg-violet-50/90 text-base text-violet-900 hover:bg-violet-100 sm:min-h-10 sm:w-auto sm:text-sm"
        onClick={onReset}
      >
        Reset game
      </Button>
    </div>
  );
}
