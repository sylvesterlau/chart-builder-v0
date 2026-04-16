import { chartConfig, dataVisColor } from "../config";
import { ChartData } from "../types";
import {
  getSum,
  transformToPercents,
  TransformedChartItem,
  bindVariableKeyToPaint,
} from "../helpers";
import {
  checkThemeCol,
  createFinalFrame,
  createLegend,
} from "./figmaOperations";

// Draw horizontal bar
export async function createHorBar(
  startPercent: number,
  endPercent: number,
  exactPercent: number,
  layerName: string = "bar",
  hexColor: string = chartConfig.defaultColor,
  isFirst: Boolean = false,
  variableKey?: string | null,
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
  const convertedColor = figma.util.rgb(hexColor);
  const fillColor = convertedColor;
  bar.fills = [{ type: "SOLID", color: fillColor }];
  // if variableKey（string), use bindVariableKeyToPaint
  if (variableKey && typeof variableKey === "string") {
    try {
      const boundPaint = await bindVariableKeyToPaint(
        variableKey,
        bar.fills[0] as SolidPaint,
      );
      bar.fills = [boundPaint];
    } catch (err) {
      console.error("createHorizontalBar: bindVariableKeyToPaint failed", err);
    }
  }
  return bar;
}

export async function drawHorBarChart(
  chartData: ChartData,
  legendList: FrameNode,
  themeColKey: string,
) {
  // check Theme collection by ID
  //   checkThemeCol(themeColKey);
  // check if form value sum > 0
  const sum: number = getSum(chartData);
  if (sum <= 0) {
    figma.notify("Please enter correct value for items");
    return;
  }
  // Transform data with helper
  const transformedData: TransformedChartItem[] = transformToPercents(
    chartData.data,
  );
  // create chart frame
  const chartFrame = figma.createFrame();
  chartFrame.fills = [];
  chartFrame.resize(358, 12);
  Object.assign(chartFrame, {
    name: "Horizontal Bar Chart area",
    layoutMode: "HORIZONTAL",
    primaryAxisSizingMode: "AUTO", // height = hug
    itemSpacing: 2,
  });
  // use indexed for loop (compatible with older TS targets)
  for (let i = 0; i < transformedData.length; i++) {
    const item = transformedData[i];
    const layerName = `${item.label} (${item.value})`;
    const isFirstSlice = i == 0 ? true : false;
    const fallbackColor = dataVisColor[i].value;
    if (item.value > 0) {
      const bar = await createHorBar(
        item.startPercent,
        item.endPercent,
        item.exactPercent,
        layerName,
        fallbackColor,
        isFirstSlice,
        item.colorToken ?? null,
      );
      if (bar) {
        chartFrame.appendChild(bar);
      }
      const legend = await createLegend(
        item.label,
        item.value,
        item.exactPercent,
        item.colorToken ?? null,
      );
      if (legend) {
        legendList.appendChild(legend);
      }
    }
  }
  // create final frame
  const finalFrame = await createFinalFrame();
  finalFrame.appendChild(chartFrame);
  finalFrame.appendChild(legendList);
  figma.currentPage.appendChild(finalFrame);
  figma.currentPage.selection = [finalFrame];
  figma.viewport.scrollAndZoomIntoView([finalFrame]);
}
