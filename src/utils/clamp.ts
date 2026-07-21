export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clampRounded(value: number, min: number, max: number): number {
  return clamp(Math.round(value), min, max);
}
