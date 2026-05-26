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
import { createChartTitle, loadChartTitleFont } from "./drawChartTitle";
import { createFinalFrame } from "./figmaOperations";
import {
  createLegend,
  createLegendList,
  loadLegendFonts,
} from "./drawLegend";

async function createHorBar(
  exactPercent: number,
  layerName: string,
  fillToken: ColorToken,
  barTrackWidth: number,
): Promise<RectangleNode | null> {
  const barWidth = (exactPercent * barTrackWidth) / 100;
  if (barWidth <= 0) {
    return null;
  }
  const bar = figma.createRectangle();
  bar.resize(barWidth, 12);
  Object.assign(bar, {
    name: layerName,
  });
  await applyColorTokenToFills(bar, fillToken);
  return bar;
}

function resolveHorBarFrameWidth(frameWidth: number | undefined): number {
  const { frameWidthMin, frameWidthMax } = pieChartConfig;
  const value = frameWidth ?? chartGeneralConfig.frameWidth;
  return Math.round(Math.min(frameWidthMax, Math.max(frameWidthMin, value)));
}

function resolveHorBarSliceGap(gapPx: number | undefined): number {
  const { sliceGap, sliceGapMin, sliceGapMax } = horizontalBarChartLayout;
  const value = gapPx ?? sliceGap;
  return Math.min(sliceGapMax, Math.max(sliceGapMin, value));
}

export async function drawHorBarChart(chartData: ChartData) {
  const sum: number = getSum(chartData);
  if (sum <= 0) {
    figma.notify("Please enter correct value for items");
    return;
  }
  await figma.currentPage.loadAsync();
  const transformedData: TransformedChartItem[] = transformToPercents(
    chartData.data,
  );
  const shouldShowLegend = chartData.legendStyle !== "none";
  const showPercentage = chartData.showPercentage !== false;
  const chartTitle = chartData.chartTitle ?? "";
  const valuePrefix = chartData.valuePrefix ?? "";
  const valueSuffix = chartData.valueSuffix ?? "HKD";
  const frameWidth = resolveHorBarFrameWidth(chartData.frameWidth);
  const horizontalPadding = 16;
  const chartAreaWidth = frameWidth - horizontalPadding * 2;
  const sliceGapPx = resolveHorBarSliceGap(chartData.horBarSliceGap);
  const segmentCount = transformedData.filter((item) => item.value > 0).length;
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
  chartContainerFrame.resize(frameWidth, 44);
  Object.assign(chartContainerFrame, {
    name: "Horizontal Bar Chart container",
    layoutMode: "HORIZONTAL",
    primaryAxisSizingMode: "FIXED",
    counterAxisSizingMode: "AUTO",
    counterAxisAlignItems: "CENTER",
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 16,
    paddingBottom: 16,
    layoutAlign: "STRETCH",
  });
  const chartFrame = figma.createFrame();
  chartFrame.fills = [];
  chartFrame.resize(chartAreaWidth, 12);
  Object.assign(chartFrame, {
    name: "Horizontal Bar Chart area",
    layoutMode: "HORIZONTAL",
    primaryAxisSizingMode: "FIXED",
    counterAxisSizingMode: "AUTO",
    itemSpacing: sliceGapPx,
    layoutAlign: "STRETCH",
  });
  for (let i = 0; i < transformedData.length; i++) {
    const item = transformedData[i];
    const layerName = `${item.label} (${item.value})`;
    const barColor = dataVisAt(i);
    if (item.value > 0) {
      const bar = await createHorBar(
        item.exactPercent,
        layerName,
        barColor,
        barTrackWidth,
      );
      if (bar) {
        chartFrame.appendChild(bar);
      }
      if (legendList) {
        const legend = await createLegend(
          item.label,
          item.value,
          item.exactPercent,
          barColor,
          showPercentage,
          valuePrefix,
          valueSuffix,
          legendTileLayout,
          frameWidth,
        );
        if (legend) {
          legendList.appendChild(legend);
        }
      }
    }
  }
  const finalFrame = await createFinalFrame(frameWidth, "Chart + legend");
  const titleFrame = await createChartTitle(chartTitle, frameWidth);
  if (titleFrame) {
    finalFrame.appendChild(titleFrame);
  }
  chartContainerFrame.appendChild(chartFrame);
  finalFrame.appendChild(chartContainerFrame);
  if (legendList) {
    finalFrame.appendChild(legendList);
  }
  figma.currentPage.appendChild(finalFrame);
  figma.currentPage.selection = [finalFrame];
  figma.viewport.scrollAndZoomIntoView([finalFrame]);
}
