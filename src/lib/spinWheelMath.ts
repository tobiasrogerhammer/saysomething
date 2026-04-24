/** Wheel local space: 0° at top, angles increase clockwise. Pointer fixed at top; wheel rotates `rotationDeg` clockwise (SVG transform). */
export function sliceIndexUnderPointer(rotationDeg: number, sliceCount: number): number {
  if (sliceCount <= 0) return 0;
  if (sliceCount === 1) return 0;
  const step = 360 / sliceCount;
  const R = ((rotationDeg % 360) + 360) % 360;
  const localUnderPointer = (360 - R) % 360;
  const idx = Math.floor(localUnderPointer / step);
  return Math.min(sliceCount - 1, Math.max(0, idx));
}

export function computeRotationToLandOnIndex(
  currentRotationDeg: number,
  selectedIndex: number,
  sliceCount: number,
  minExtraFullTurnsDeg = 1800,
): number {
  if (sliceCount <= 0) return currentRotationDeg;
  if (sliceCount === 1) return currentRotationDeg;
  const step = 360 / sliceCount;
  const selectedAngle = selectedIndex * step + step / 2;
  const extra = minExtraFullTurnsDeg + Math.floor(Math.random() * 1440);
  const target = ((360 - selectedAngle) % 360 + 360) % 360;
  const afterBase = currentRotationDeg + extra;
  const current = ((afterBase % 360) + 360) % 360;
  const adjustment = (target - current + 360) % 360;
  return afterBase + adjustment;
}

export function randomSpinDurationMs(minMs: number, maxMs: number): number {
  return minMs + Math.floor(Math.random() * (maxMs - minMs + 1));
}
