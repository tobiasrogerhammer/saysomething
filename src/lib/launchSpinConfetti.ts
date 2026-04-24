/** Confetti when the spin wheel stops — runs only in the browser. */
export function launchSpinConfetti(): void {
  if (typeof window === "undefined") return;

  void import("canvas-confetti").then((mod) => {
    const confetti = mod.default;
    const palette = ["#f472b6", "#c084fc", "#22d3ee", "#fbbf24", "#34d399", "#fb7185", "#818cf8"];

    void confetti({
      particleCount: 110,
      spread: 82,
      startVelocity: 28,
      gravity: 0.92,
      drift: 0.02,
      origin: { x: 0.5, y: 0.08 },
      colors: palette,
      ticks: 320,
      scalar: 1,
    });

    const end = Date.now() + 2200;
    const sprinkle = () => {
      void confetti({
        particleCount: 2,
        spread: 65,
        startVelocity: 22,
        gravity: 1,
        origin: { x: Math.random() * 0.7 + 0.15, y: 0 },
        colors: palette,
        ticks: 260,
        scalar: 0.85,
      });
      if (Date.now() < end) requestAnimationFrame(sprinkle);
    };
    requestAnimationFrame(sprinkle);

    window.setTimeout(() => {
      void confetti({
        particleCount: 45,
        angle: 125,
        spread: 55,
        origin: { x: 0.12, y: 0.06 },
        colors: palette,
        ticks: 280,
      });
      void confetti({
        particleCount: 45,
        angle: 55,
        spread: 55,
        origin: { x: 0.88, y: 0.06 },
        colors: palette,
        ticks: 280,
      });
    }, 180);
  });
}
