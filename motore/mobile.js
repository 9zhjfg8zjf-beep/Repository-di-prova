// Politiche mobile pure: nessun clock, DOM o stato di gioco nascosto.
const DiteMobile = (() => {
  function stick(dx, dy, radius) {
    const distance = Math.hypot(dx, dy), dead = radius * 0.08;
    if (distance <= dead) return { x: 0, y: 0 };
    const strength = Math.min(1, (distance - dead) / (radius - dead));
    return { x: dx / distance * strength, y: dy / distance * strength };
  }
  function quality(maxRatio) {
    const ceiling = Math.max(0.7, Math.min(2, maxRatio));
    const levels = [];
    for (let ratio = ceiling; ratio > 1; ratio = Math.max(1, ratio - 0.25)) levels.push({ ratio, bloom: true });
    levels.push({ ratio: Math.min(1, ceiling), bloom: true }, { ratio: Math.min(1, ceiling), bloom: false });
    for (const ratio of [0.85, 0.7]) if (ratio < ceiling) levels.push({ ratio, bloom: false });
    let index = 0, elapsed = 0, frames = 0, stable = 0, warmup = 1, recoveryDelay = 12, probe = false;
    const snapshot = () => ({ ...levels[index], level: index });
    function reset() { elapsed = frames = stable = 0; warmup = 1; }
    function sample(seconds) {
      if (!Number.isFinite(seconds) || seconds <= 0) return null;
      // Una sospensione non e un campione di rendimento della GPU.
      if (seconds > 1) { reset(); return null; }
      if (warmup > 0) { warmup -= seconds; return null; }
      elapsed += seconds; frames++;
      if (elapsed < 2 || frames < 8) return null;
      const mean = elapsed / frames, span = elapsed; elapsed = frames = 0;
      if (mean > 0.024) {
        stable = 0;
        if (index < levels.length - 1) {
          index++; if (probe) recoveryDelay = Math.min(60, recoveryDelay * 2);
          probe = false; warmup = 1; return snapshot();
        }
      } else if (mean < 0.018) {
        stable += span;
        if (stable >= recoveryDelay && index > 0) { index--; stable = 0; warmup = 1; probe = true; return snapshot(); }
      } else stable = 0;
      return null;
    }
    return { sample, reset, snapshot };
  }
  return { stick, quality };
})();
if (typeof module !== 'undefined') module.exports = DiteMobile;
