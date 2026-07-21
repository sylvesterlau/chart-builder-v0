import { describe, expect, it } from "vitest";
import { pieChartConfig, semiDonutChartLayout } from "../../src/config";
import {
  donutGapPxToPercent,
  donutRingWidthPxToRatio,
  getDonutRingWidthBounds,
  isValidDonutRingWidth,
  resolveIndicatorLineExtend,
} from "../../src/utils/chart/pieDonutCalculate";
import {
  createLinePointLabels,
  createSeededLineValues,
} from "../../src/utils/chart/lineChartCalculate";
import {
  getSemiDonutMidRadius,
  getSemiDonutRingWidthBounds,
  isValidSemiDonutRingWidth,
  semiDonutGapPxToPercent,
  semiDonutRingWidthPxToRatio,
} from "../../src/utils/chart/semiDonutCalculate";
import { getChartSizeBounds } from "../../src/utils/chart/sizeBounds";

describe("chart size calculations", () => {
  it("calculates min and max chart sizes from the frame width", () => {
    expect(getChartSizeBounds(800, 0.3, 0.6)).toEqual({
      min: 240,
      max: 480,
    });
  });

  it("rounds fractional size bounds to whole pixels", () => {
    expect(getChartSizeBounds(333, 0.3, 0.6)).toEqual({
      min: 100,
      max: 200,
    });
  });
});

describe("pie and donut calculations", () => {
  it("converts a ring width in pixels to an inner-radius ratio", () => {
    expect(donutRingWidthPxToRatio(40, 400)).toBeCloseTo(0.8);
  });

  it("falls back safely when chart size is zero", () => {
    expect(donutRingWidthPxToRatio(40, 0)).toBe(pieChartConfig.ratioMin);
  });

  it("accepts the inclusive ring-width bounds", () => {
    const chartSize = 400;
    const bounds = getDonutRingWidthBounds(chartSize);

    expect(isValidDonutRingWidth(bounds.min, chartSize)).toBe(true);
    expect(isValidDonutRingWidth(bounds.max, chartSize)).toBe(true);
    expect(isValidDonutRingWidth(bounds.min - 1, chartSize)).toBe(false);
    expect(isValidDonutRingWidth(bounds.max + 1, chartSize)).toBe(false);
  });

  it("rejects non-finite ring widths", () => {
    expect(isValidDonutRingWidth(Number.NaN, 400)).toBe(false);
    expect(isValidDonutRingWidth(Number.POSITIVE_INFINITY, 400)).toBe(false);
  });

  it("clamps indicator line extension to configured bounds", () => {
    const { lineExtendMin, lineExtendMax } = pieChartConfig.indicator;

    expect(resolveIndicatorLineExtend(lineExtendMin - 100)).toBe(lineExtendMin);
    expect(resolveIndicatorLineExtend(lineExtendMax + 100)).toBe(lineExtendMax);
  });

  it("converts a donut gap using the mid-ring circumference", () => {
    const chartSize = 400;
    const ratio = 0.8;
    const gapPx = 4;
    const midRadius = getSemiDonutMidRadius(chartSize, ratio);

    expect(donutGapPxToPercent(gapPx, chartSize, ratio)).toBeCloseTo(
      (gapPx * 100) / (2 * Math.PI * midRadius),
    );
  });

  it("returns zero percent for non-positive gaps", () => {
    expect(donutGapPxToPercent(0, 400, 0.8)).toBe(0);
    expect(donutGapPxToPercent(-1, 400, 0.8)).toBe(0);
  });
});

describe("semi-donut calculations", () => {
  it("converts ring width and clamps it to configured ratios", () => {
    expect(semiDonutRingWidthPxToRatio(40, 400)).toBeCloseTo(0.8);
    expect(semiDonutRingWidthPxToRatio(0, 400)).toBe(
      semiDonutChartLayout.ratioMax,
    );
    expect(semiDonutRingWidthPxToRatio(400, 400)).toBe(
      semiDonutChartLayout.ratioMin,
    );
  });

  it("validates inclusive semi-donut ring-width bounds", () => {
    const chartSize = 400;
    const bounds = getSemiDonutRingWidthBounds(chartSize);

    expect(isValidSemiDonutRingWidth(bounds.min, chartSize)).toBe(true);
    expect(isValidSemiDonutRingWidth(bounds.max, chartSize)).toBe(true);
    expect(isValidSemiDonutRingWidth(bounds.min - 1, chartSize)).toBe(false);
    expect(isValidSemiDonutRingWidth(bounds.max + 1, chartSize)).toBe(false);
  });

  it("uses the semicircle length when converting a gap", () => {
    const chartSize = 400;
    const ratio = 0.8;
    const gapPx = 4;
    const midRadius = getSemiDonutMidRadius(chartSize, ratio);

    expect(semiDonutGapPxToPercent(gapPx, chartSize, ratio)).toBeCloseTo(
      (gapPx * 100) / (Math.PI * midRadius),
    );
  });
});

describe("line chart fixture calculations", () => {
  it("generates deterministic values for a fixed seed", () => {
    const args = [10, 123, 50, 10, 1, 0, 100] as const;

    expect(createSeededLineValues(...args)).toEqual(
      createSeededLineValues(...args),
    );
  });

  it("keeps generated values within the requested range", () => {
    const values = createSeededLineValues(100, 123, 50, 30, 2, -20, 80);

    expect(values).toHaveLength(100);
    values.forEach((value) => {
      expect(value).toBeGreaterThanOrEqual(-20);
      expect(value).toBeLessThanOrEqual(80);
      expect(Number.isFinite(value)).toBe(true);
    });
  });

  it("generates stable UTC date labels", () => {
    expect(createLinePointLabels(3)).toEqual(["01 Jan", "02 Jan", "03 Jan"]);
  });
});
