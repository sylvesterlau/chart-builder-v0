import { chartGeneralConfig, pieChartConfig } from "../../config";
import { getSemiDonutMidRadius } from "./semiDonutCalculate";
import { getChartSizeBounds } from "./sizeBounds";

export function getPieChartSizeBounds(frameWidth: number) {
  const { sizeMinRatio, sizeMaxRatio } = pieChartConfig;
  return getChartSizeBounds(frameWidth, sizeMinRatio, sizeMaxRatio);
}

export function getDonutRingWidthBounds(chartSize: number) {
  const { ratioMin, ratioMax } = pieChartConfig;
  return {
    min: Math.round((chartSize / 2) * (1 - ratioMax)),
    max: Math.round((chartSize / 2) * (1 - ratioMin)),
  };
}

export function donutRingWidthPxToRatio(
  ringWidthPx: number,
  chartSize: number,
): number {
  const { ratioMin, ratioMax } = pieChartConfig;
  if (chartSize <= 0) {
    return ratioMin;
  }
  const ratio = 1 - (2 * ringWidthPx) / chartSize;
  return Math.min(ratioMax, Math.max(ratioMin, ratio));
}

export function resolveDonutRingWidth(ringWidthPx: number | undefined): number {
  return ringWidthPx ?? pieChartConfig.ringWidth;
}

export function isValidDonutRingWidth(
  ringWidthPx: number,
  chartSize: number,
): boolean {
  if (!Number.isFinite(ringWidthPx) || chartSize <= 0) {
    return false;
  }
  const { min, max } = getDonutRingWidthBounds(chartSize);
  return ringWidthPx >= min && ringWidthPx <= max;
}

export function resolvePieSliceGap(gapPx: number | undefined): number {
  const { sliceGap, sliceGapMin, sliceGapMax } = pieChartConfig;
  const value = gapPx ?? sliceGap;
  return Math.min(sliceGapMax, Math.max(sliceGapMin, value));
}

export function isValidPieSliceGap(gapPx: number): boolean {
  const { sliceGapMin, sliceGapMax } = pieChartConfig;
  return Number.isFinite(gapPx) && gapPx >= sliceGapMin && gapPx <= sliceGapMax;
}

export function resolveIndicatorLineExtend(
  lineExtend: number | undefined,
): number {
  const {
    lineExtend: defaultLineExtend,
    lineExtendMin,
    lineExtendMax,
  } = pieChartConfig.indicator;
  const value = lineExtend ?? defaultLineExtend;
  return Math.round(Math.min(lineExtendMax, Math.max(lineExtendMin, value)));
}

export function getPieChartAreaHeight(
  frameWidth: number,
  chartSize: number,
  showIndicator: boolean,
  showIndicatorPercentage: boolean = true,
  indicatorLineExtend?: number,
): number {
  const ratioHeight = Math.round(
    frameWidth * (pieChartConfig.frameHeight / chartGeneralConfig.frameWidth),
  );
  if (!showIndicator) {
    return ratioHeight;
  }

  const pieRadius = chartSize / 2;
  const indicatorScale = pieRadius / pieChartConfig.radius;
  const { lineExtend, labelCenterOffset } = pieChartConfig.indicator;
  const resolvedLineExtend = resolveIndicatorLineExtend(indicatorLineExtend);
  const outerReach =
    pieRadius +
    resolvedLineExtend * indicatorScale +
    labelCenterOffset * indicatorScale;
  const { label, percentage } = pieChartConfig.indicator.typography;
  const textHeight = showIndicatorPercentage
    ? label.lineHeight + percentage.lineHeight
    : label.lineHeight;
  const indicatorHeight = Math.round(2 * outerReach + textHeight);
  return Math.max(ratioHeight, indicatorHeight);
}

/** Convert arc gap (px) at mid-ring to % of the full 360° donut. */
export function donutGapPxToPercent(
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
  return (gapPx * 100) / (2 * Math.PI * rMid);
}
