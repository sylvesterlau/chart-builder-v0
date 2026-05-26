export function createSeededLineValues(
  count: number,
  seed: number,
  start: number,
  volatility: number,
  drift: number,
  min: number,
  max: number,
): number[] {
  let state = seed;
  let value = start;
  const values: number[] = [];
  for (let index = 0; index < count; index += 1) {
    state = (state * 1664525 + 1013904223) % 4294967296;
    const random = state / 4294967296 - 0.5;
    const wave = Math.sin(index / 6) * volatility * 0.35;
    value = Math.max(
      min,
      Math.min(max, value + random * volatility + drift + wave),
    );
    values.push(Math.round(value));
  }
  return values;
}

export function createLinePointLabels(count: number): string[] {
  const start = new Date(Date.UTC(2026, 0, 1));
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      timeZone: "UTC",
    });
  });
}
