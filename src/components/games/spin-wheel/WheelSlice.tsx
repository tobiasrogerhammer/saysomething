"use client";

import type { Topic } from "@/data/topics";
import { pieSlicePath, polarFromTopCw } from "./svgWheelGeometry";

type WheelSliceProps = {
  topic: Topic;
  startDeg: number;
  endDeg: number;
  fill: string;
  cx: number;
  cy: number;
  radius: number;
  label: string;
};

export function WheelSlice({ topic, startDeg, endDeg, fill, cx, cy, radius, label }: WheelSliceProps) {
  const mid = (startDeg + endDeg) / 2;
  const labelR = radius * 0.62;
  const { x, y } = polarFromTopCw(cx, cy, labelR, mid);
  const textRotation = mid - 90;
  const d = pieSlicePath(cx, cy, radius, startDeg, endDeg);

  return (
    <g data-topic-id={topic.id}>
      <path d={d} fill={fill} stroke="white" strokeWidth={2} vectorEffect="non-scaling-stroke" />
      <text
        x={x}
        y={y}
        fill="white"
        fontSize={11}
        fontWeight={700}
        textAnchor="middle"
        dominantBaseline="middle"
        transform={`rotate(${textRotation}, ${x}, ${y})`}
        className="pointer-events-none select-none uppercase tracking-wide"
        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.75)" }}
      >
        <title>{label}</title>
        <tspan className="fill-white">{truncate(label, 18)}</tspan>
      </text>
    </g>
  );
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}
