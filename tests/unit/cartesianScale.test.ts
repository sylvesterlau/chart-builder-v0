import { describe, expect, it } from "vitest";
import {
  buildZeroAnchoredScale,
  cartesianRulerY,
  resolveBarDomain,
  resolveBarScale,
  resolveLineDomain,
  resolveLineScale,
  valueToY,
} from "../../src/helpers";

describe("cartesian domains", () => {
  it("anchors an all-positive bar domain at zero", () => {
    expect(resolveBarDomain([20, 80, 40])).toEqual({
      minValue: 0,
      maxValue: 80,
    });
  });

  it("anchors an all-negative bar domain at zero", () => {
    expect(resolveBarDomain([-20, -80, -40])).toEqual({
      minValue: -80,
      maxValue: 0,
    });
  });

  it("preserves both sides of a mixed-sign bar domain", () => {
    expect(resolveBarDomain([-20, 80, -40])).toEqual({
      minValue: -40,
      maxValue: 80,
    });
  });

  it("uses a safe fallback for empty and non-finite bar values", () => {
    expect(resolveBarDomain([])).toEqual({ minValue: 0, maxValue: 10 });
    expect(resolveBarDomain([Number.NaN, Number.POSITIVE_INFINITY])).toEqual({
      minValue: 0,
      maxValue: 10,
    });
  });

  it("expands a zero-width line domain", () => {
    expect(resolveLineDomain([50, 50], 50, 50)).toEqual({
      minValue: 50,
      maxValue: 51,
    });
  });

  it("expands requested line bounds to contain actual data", () => {
    expect(resolveLineDomain([-20, 120], 0, 100)).toEqual({
      minValue: -20,
      maxValue: 120,
    });
  });
});

describe("zero-anchored scales", () => {
  it("includes an exact zero tick for mixed-sign data", () => {
    const scale = buildZeroAnchoredScale(-35, 80, 5);

    expect(scale.ticks).toHaveLength(6);
    expect(scale.ticks).toContain(0);
    expect(scale.minValue).toBeLessThanOrEqual(-35);
    expect(scale.maxValue).toBeGreaterThanOrEqual(80);
  });

  it("creates descending finite ticks for negative bar data", () => {
    const scale = resolveBarScale([-10, -45, -90], 3);

    expect(scale.ticks).toHaveLength(4);
    expect(scale.ticks[0]).toBe(0);
    expect(scale.ticks.at(-1)).toBeLessThanOrEqual(-90);
    scale.ticks.forEach((tick) => expect(Number.isFinite(tick)).toBe(true));
  });

  it("uses a zero-anchored scale when a line crosses zero", () => {
    const scale = resolveLineScale([-25, 75], -25, 75, 4);

    expect(scale.ticks).toContain(0);
    expect(scale.minValue).toBeLessThanOrEqual(-25);
    expect(scale.maxValue).toBeGreaterThanOrEqual(75);
  });
});

describe("cartesian coordinate mapping", () => {
  it("maps max, zero, and min values into chart coordinates", () => {
    expect(valueToY(100, -100, 100, 400)).toBe(0);
    expect(valueToY(0, -100, 100, 400)).toBe(200);
    expect(valueToY(-100, -100, 100, 400)).toBe(400);
  });

  it("clamps values outside the domain", () => {
    expect(valueToY(200, -100, 100, 400)).toBe(0);
    expect(valueToY(-200, -100, 100, 400)).toBe(400);
  });

  it("positions the ruler on zero for mixed-sign domains", () => {
    expect(cartesianRulerY(-100, 100, 400)).toBe(200);
  });

  it("positions the ruler at the bottom for positive-only domains", () => {
    expect(cartesianRulerY(0, 100, 400)).toBe(399);
  });
});
