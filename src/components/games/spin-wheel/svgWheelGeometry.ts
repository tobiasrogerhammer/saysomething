/** 0° = top, increasing clockwise (screen coords, y down). */
export function polarFromTopCw(cx: number, cy: number, r: number, angleDeg: number) {
  const angleInRadians = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleInRadians), y: cy + r * Math.sin(angleInRadians) };
}

export function pieSlicePath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const start = polarFromTopCw(cx, cy, r, startDeg);
  const end = polarFromTopCw(cx, cy, r, endDeg);
  const sweep = endDeg - startDeg;
  const largeArc = sweep > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}
