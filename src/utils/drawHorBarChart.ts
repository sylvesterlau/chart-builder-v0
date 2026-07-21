import { dataVisAt } from "./dataVisAt";
import {
  chartGeneralConfig,
  horizontalBarChartLayout,
  pieChartConfig,
} from "../config";
import { ChartData } from "../types";
import { getSum, transformToPercents, TransformedChartItem } from "../helpers";
import type { ColorToken } from "../types";
import { applyColorTokenToFills } from "./applyColorToken";
import {
  applyHeight,
  applyHorizontalPadding,
  applyItemSpacing,
  applyVerticalPadding,
  numberTokenValue,
} from "./applyNumberToken";
import type { NumberToken } from "../types";
import { createChartTitle, loadChartTitleFont } from "./drawChartTitle";
import { createFinalFrame } from "./figmaOperations";
import {
  appendAggregatedLegends,
  createLegendList,
  loadLegendFonts,
} from "./drawLegend";
import { buildChartSegments, toLegendSourceItems } from "./legendAggregate";

async function createHorBar(
  exactPercent: number,
  layerName: string,
  fillToken: ColorToken,
  barTrackWidth: number,
  barHeight: NumberToken,
): Promise<RectangleNode | null> {
  const barWidth = (exactPercent * barTrackWidth) / 100;
  if (barWidth <= 0) {
    return null;
  }
  const barHeightPx = numberTokenValue(barHeight);
  const bar = figma.createRectangle();
  bar.resize(barWidth, barHeightPx);
  Object.assign(bar, {
    name: layerName,
  });
  await applyColorTokenToFills(bar, fillToken);
  await applyHeight(bar, barHeight);
  return bar;
}

function resolveHorBarFrameWidth(frameWidth: number | undefined): number {
  const { frameWidthMin, frameWidthMax } = pieChartConfig;
  const value = frameWidth ?? chartGeneralConfig.frameWidth;
  return Math.round(Math.min(frameWidthMax, Math.max(frameWidthMin, value)));
}

function resolveHorBarSliceGap(): number {
  const { sliceGap, sliceGapMin, sliceGapMax } = horizontalBarChartLayout;
  const value = numberTokenValue(sliceGap);
  return Math.min(sliceGapMax, Math.max(sliceGapMin, value));
}

export async function drawHorBarChart(chartData: ChartData) {
  const sum: number = getSum(chartData);
  if (sum <= 0) {
    figma.notify("Please enter correct value for items");
    return;
  }
  await figma.currentPage.loadAsync();
  const sourceItems = toLegendSourceItems(chartData.data);
  const chartSegments = buildChartSegments(sourceItems);
  const transformedData: TransformedChartItem[] =
    transformToPercents(chartSegments);
  const shouldShowLegend = chartData.legendStyle !== "none";
  const showPercentage = chartData.showPercentage !== false;
  const chartTitle = chartData.chartTitle ?? "";
  const valuePrefix = chartData.valuePrefix ?? "";
  const valueSuffix = chartData.valueSuffix ?? "HKD";
  const frameWidth = resolveHorBarFrameWidth(chartData.frameWidth);
  const { horizontalPadding, verticalPadding, barHeight, sliceGap } =
    horizontalBarChartLayout;
  const barHeightPx = numberTokenValue(barHeight);
  const horizontalPaddingPx = numberTokenValue(horizontalPadding);
  const chartAreaWidth = frameWidth - horizontalPaddingPx * 2;
  const sliceGapPx = resolveHorBarSliceGap();
  const segmentCount = chartSegments.length;
  const barTrackWidth =
    chartAreaWidth - Math.max(0, segmentCount - 1) * sliceGapPx;
  if (chartTitle.trim()) {
    await loadChartTitleFont();
  }
  if (shouldShowLegend) {
    await loadLegendFonts();
  }
  const legendList = shouldShowLegend ? createLegendList() : null;
  const legendTileLayout =
    chartData.legendStyle === "topAndBottom" ? "topAndBottom" : "leftAndRight";
  const chartContainerFrame = figma.createFrame();
  chartContainerFrame.fills = [];
  chartContainerFrame.resize(frameWidth, barHeightPx);
  Object.assign(chartContainerFrame, {
    name: "Horizontal Bar Chart container",
    layoutMode: "HORIZONTAL",
    primaryAxisSizingMode: "FIXED",
    counterAxisSizingMode: "AUTO",
    counterAxisAlignItems: "CENTER",
    layoutAlign: "STRETCH",
  });
  await applyHorizontalPadding(chartContainerFrame, horizontalPadding);
  await applyVerticalPadding(chartContainerFrame, verticalPadding);
  await applyItemSpacing(chartContainerFrame, sliceGap);
  for (let i = 0; i < transformedData.length; i++) {
    const item = transformedData[i];
    const segment = chartSegments[i];
    const layerName = `${item.label} (${item.value})`;
    const barColor = dataVisAt(segment.colorIndex);
    const bar = await createHorBar(
      item.exactPercent,
      layerName,
      barColor,
      barTrackWidth,
      barHeight,
    );
    if (bar) {
      chartContainerFrame.appendChild(bar);
    }
  }
  if (legendList) {
    await appendAggregatedLegends(
      legendList,
      sourceItems.map((item) => ({
        index: item.index,
        label: item.label,
        value: item.value,
        percentage: (item.value / sum) * 100,
      })),
      showPercentage,
      valuePrefix,
      valueSuffix,
      legendTileLayout,
      frameWidth,
    );
  }
  const finalFrame = await createFinalFrame(frameWidth, "Horizontal Bar Chart");
  const titleFrame = await createChartTitle(chartTitle, frameWidth);
  if (titleFrame) {
    finalFrame.appendChild(titleFrame);
  }
  finalFrame.appendChild(chartContainerFrame);
  if (legendList) {
    finalFrame.appendChild(legendList);
  }
  figma.currentPage.appendChild(finalFrame);
  figma.currentPage.selection = [finalFrame];
  figma.viewport.scrollAndZoomIntoView([finalFrame]);
}
