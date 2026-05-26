import {
  semiDonutChartConfig,
  semiDonutChartLayout,
} from "../../config";
import { getChartSizeBounds } from "./sizeBounds";

export function getSemiDonutSizeBounds(frameWidth: number) {
  const { sizeMinRatio, sizeMaxRatio } = semiDonutChartLayout;
  return getChartSizeBounds(frameWidth, sizeMinRatio, sizeMaxRatio);
}

/** Mid-ring radius used for semi-donut stroke / arc gap conversion. */
export function getSemiDonutMidRadius(
  chartSize: number,
  ratio: number,
): number {
  return (chartSize * (1 + ratio)) / 4;
}

export function getSemiDonutRingWidthBounds(chartSize: number) {
  const { ratioMin, ratioMax } = semiDonutChartLayout;
  return {
    min: Math.round((chartSize / 2) * (1 - ratioMax)),
    max: Math.round((chartSize / 2) * (1 - ratioMin)),
  };
}

export function semiDonutRingWidthPxToRatio(
  ringWidthPx: number,
  chartSize: number,
): number {
  const { ratioMin, ratioMax } = semiDonutChartLayout;
  if (chartSize <= 0) {
    return ratioMin;
  }
  const ratio = 1 - (2 * ringWidthPx) / chartSize;
  return Math.min(ratioMax, Math.max(ratioMin, ratio));
}

export function resolveSemiDonutRingWidth(
  ringWidthPx: number | undefined,
): number {
  return ringWidthPx ?? semiDonutChartConfig.ringWidth;
}

export function isValidSemiDonutRingWidth(
  ringWidthPx: number,
  chartSize: number,
): boolean {
  if (!Number.isFinite(ringWidthPx) || chartSize <= 0) {
    return false;
  }
  const { min, max } = getSemiDonutRingWidthBounds(chartSize);
  return ringWidthPx >= min && ringWidthPx <= max;
}

export function resolveSemiDonutSliceGapPx(gapPx: number | undefined): number {
  const { sliceGapMin, sliceGapMax } = semiDonutChartLayout;
  const value = gapPx ?? semiDonutChartConfig.sliceGap;
  return Math.min(sliceGapMax, Math.max(sliceGapMin, value));
}

/** Convert arc gap (px) at mid-ring to % of the 180° semicircle. */
export function semiDonutGapPxToPercent(
  gapPx: number,
  chartSize: number,
  ratio: number,
): number {
  if (gapPx <= 0 || chartSize <= 0) {
    return 0;
  }
  const rMid = getSemiDonutMidRadius(chartSize, ratio);
  if (rMid <= 0) {
    return 0;
  }
  return (gapPx * 100) / (Math.PI * rMid);
}
