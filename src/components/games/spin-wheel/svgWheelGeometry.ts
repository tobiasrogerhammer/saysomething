/** 0° = top, increasing clockwise (screen coords, y down). */
export function polarFromTopCw(cx: number, cy: number, r: number, angleDeg: number) {
  const angleInRadians = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleInRadians), y: cy + r * Math.sin(angleInRadians) };
}

export function pieSlicePath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const sweep = endDeg - startDeg;
  // A full 360deg slice cannot be represented by a single SVG arc
  // from start to end (start/end overlap). Render as a full circle.
  if (sweep >= 359.999) {
    return `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;
  }

  const start = polarFromTopCw(cx, cy, r, startDeg);
  const end = polarFromTopCw(cx, cy, r, endDeg);
  const largeArc = sweep > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}
