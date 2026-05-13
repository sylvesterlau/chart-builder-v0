import { dataVisAt, dataVisColor } from "../config";
import { ChartData } from "../types";
import { getSum, transformToPercents, TransformedChartItem } from "../helpers";
import {
  createChartTitle,
  createFinalFrame,
  loadChartTitleFont,
} from "./figmaOperations";
import {
  createLegend,
  createLegendList,
  loadLegendFonts,
} from "./drawLegend";

// Draw horizontal bar
export function createHorBar(
  startPercent: number,
  endPercent: number,
  exactPercent: number,
  layerName: string = "bar",
  hexColor: string = dataVisColor.general[0].value,
  isFirst: Boolean = false,
): RectangleNode | null {
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
  const convertedColor = figma.util.rgb(hexColor);
  const fillColor = convertedColor;
  bar.fills = [{ type: "SOLID", color: fillColor }];
  return bar;
}

export async function drawHorBarChart(chartData: ChartData) {
  // check if form value sum > 0
  const sum: number = getSum(chartData);
  if (sum <= 0) {
    figma.notify("Please enter correct value for items");
    return;
  }
  await figma.currentPage.loadAsync();
  // Transform data with helper
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
  // create chart frame
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
  // use indexed for loop (compatible with older TS targets)
  for (let i = 0; i < transformedData.length; i++) {
    const item = transformedData[i];
    const layerName = `${item.label} (${item.value})`;
    const isFirstSlice = i == 0 ? true : false;
    const fallbackColor = dataVisAt(i).value;
    if (item.value > 0) {
      const bar = createHorBar(
        item.startPercent,
        item.endPercent,
        item.exactPercent,
        layerName,
        fallbackColor,
        isFirstSlice,
      );
      if (bar) {
        chartFrame.appendChild(bar);
      }
      if (legendList) {
        const legend = createLegend(
          item.label,
          item.value,
          item.exactPercent,
          item.colorToken ?? null,
          fallbackColor,
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
  // create final frame
  const finalFrame = createFinalFrame();
  const titleFrame = createChartTitle(chartTitle);
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
