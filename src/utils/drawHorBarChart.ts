import { dataVisAt } from "../config";
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
  startPercent: number,
  endPercent: number,
  exactPercent: number,
  layerName: string,
  fillToken: ColorToken,
  isFirst: Boolean = false,
): Promise<RectangleNode | null> {
  if (endPercent - startPercent <= 0) {
    return null;
  }
  const bar = figma.createRectangle();
  const barWidth = (exactPercent * 358) / 100 - 2;
  bar.resize(barWidth, 12);
  Object.assign(bar, {
    x: startPercent,
    name: layerName,
  });
  await applyColorTokenToFills(bar, fillToken);
  return bar;
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
  chartContainerFrame.resize(390, 44);
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
  chartFrame.resize(358, 12);
  Object.assign(chartFrame, {
    name: "Horizontal Bar Chart area",
    layoutMode: "HORIZONTAL",
    primaryAxisSizingMode: "FIXED",
    counterAxisSizingMode: "AUTO",
    itemSpacing: 2,
    layoutAlign: "STRETCH",
  });
  for (let i = 0; i < transformedData.length; i++) {
    const item = transformedData[i];
    const layerName = `${item.label} (${item.value})`;
    const isFirstSlice = i == 0 ? true : false;
    const barColor = dataVisAt(i);
    if (item.value > 0) {
      const bar = await createHorBar(
        item.startPercent,
        item.endPercent,
        item.exactPercent,
        layerName,
        barColor,
        isFirstSlice,
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
        );
        if (legend) {
          legendList.appendChild(legend);
        }
      }
    }
  }
  const finalFrame = await createFinalFrame();
  const titleFrame = await createChartTitle(chartTitle);
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
