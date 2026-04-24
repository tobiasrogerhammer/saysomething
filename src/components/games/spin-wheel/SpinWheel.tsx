"use client";

import { useId, useMemo } from "react";
import type { Topic } from "@/data/topics";
import { WHEEL_SLICE_COLORS } from "./wheelColors";
import { WheelSlice } from "./WheelSlice";

export type SpinWheelSegment = {
  topic: Topic;
  startDeg: number;
  endDeg: number;
};

type SpinWheelProps = {
  size: number;
  segments: SpinWheelSegment[];
  rotationDeg: number;
  transitionMs: number;
  spinning: boolean;
  labelForTopic: (topic: Topic) => string;
};

const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";

export function SpinWheel({ size, segments, rotationDeg, transitionMs, spinning, labelForTopic }: SpinWheelProps) {
  const gid = useId().replace(/:/g, "");
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 6;

  const slices = useMemo(() => {
    return segments.map((seg, i) => ({
      ...seg,
      fill: WHEEL_SLICE_COLORS[i % WHEEL_SLICE_COLORS.length] ?? WHEEL_SLICE_COLORS[0],
      label: labelForTopic(seg.topic),
    }));
  }, [segments, labelForTopic]);

  if (segments.length === 0) {
    return (
      <svg
        viewBox={`0 0 ${size} ${size}`}
        preserveAspectRatio="xMidYMid meet"
        className="mx-auto aspect-square w-full max-w-[min(100vw-1.5rem,390px)] shrink-0 drop-shadow-xl sm:max-w-[min(100%,520px)]"
        role="img"
        aria-label="Empty wheel"
      >
        <circle cx={cx} cy={cy} r={radius} fill="#e2e8f0" stroke="#cbd5e1" strokeWidth={2} />
      </svg>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      preserveAspectRatio="xMidYMid meet"
      className="mx-auto aspect-square w-full max-w-[min(100vw-1.5rem,390px)] shrink-0 drop-shadow-xl sm:max-w-[min(100%,520px)]"
      role="img"
      aria-label="Topic wheel"
    >
      <defs>
        <clipPath id={`${gid}-disc`}>
          <circle cx={cx} cy={cy} r={radius} />
        </clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={radius + 4} fill="#0f172a" opacity={0.12} />
      <g
        clipPath={`url(#${gid}-disc)`}
        style={{
          transform: `rotate(${rotationDeg}deg)`,
          transformOrigin: `${cx}px ${cy}px`,
          transition: spinning ? `transform ${transitionMs}ms ${EASE_OUT}` : "transform 700ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {slices.map((s) => (
          <WheelSlice
            key={s.topic.id}
            topic={s.topic}
            startDeg={s.startDeg}
            endDeg={s.endDeg}
            fill={s.fill}
            cx={cx}
            cy={cy}
            radius={radius}
            label={s.label}
          />
        ))}
      </g>
      <circle cx={cx} cy={cy} r={10} fill="white" stroke="#0f172a" strokeWidth={2} />
    </svg>
  );
}
