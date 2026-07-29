/**
 * Deterministic pseudo-random helpers.
 *
 * Every mock dataset is generated from a fixed seed so the HTML produced on the
 * server is byte-identical to what React renders on the client. Never use
 * Math.random() or Date.now() inside the mock layer.
 */

export function createRng(seed: number) {
  let state = seed >>> 0;
  return function next() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Rng = ReturnType<typeof createRng>;

export const int = (rng: Rng, min: number, max: number) =>
  Math.floor(rng() * (max - min + 1)) + min;

export const float = (rng: Rng, min: number, max: number, digits = 2) =>
  Number((rng() * (max - min) + min).toFixed(digits));

export const pick = <T>(rng: Rng, items: readonly T[]): T =>
  items[Math.floor(rng() * items.length)];

export const pickMany = <T>(rng: Rng, items: readonly T[], count: number): T[] => {
  const pool = [...items];
  const out: T[] = [];
  for (let i = 0; i < count && pool.length; i++) {
    out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  }
  return out;
};

/** Weighted pick: `[value, weight]` pairs. */
export const weighted = <T>(rng: Rng, entries: readonly (readonly [T, number])[]): T => {
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = rng() * total;
  for (const [value, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return value;
  }
  return entries[entries.length - 1][0];
};

/** ISO string N days (and optional hours) before the reference date. */
export const daysAgo = (from: Date, days: number, hours = 0) =>
  new Date(from.getTime() - days * 86400000 - hours * 3600000).toISOString();

export const daysAhead = (from: Date, days: number, hours = 0) =>
  new Date(from.getTime() + days * 86400000 + hours * 3600000).toISOString();
