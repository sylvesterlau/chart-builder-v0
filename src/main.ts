import { on, showUI } from "@create-figma-plugin/utilities";
import { pluginUI, chartConfig, teamLibrary } from "./config";
import { ChartData } from "./types";
import {
  bindVariableKeyToPaint,
  transformToPercents,
  TransformedChartItem,
  getSum,
} from "./helpers";
import {
  createSemiDonutSlice,
  createHorBar,
  createLegend,
  checkThemeCol,
  createLegendList,
  createFinalFrame,
  createTotalValueFrame,
} from "./utils/figmaOperations";
const themeColKey = teamLibrary.coreToolKit.collectionKey; // "Theme" collection key
export default function () {
  // Semi donut chart
  async function handleSemiDonutChartData(chartData: ChartData) {
    // check Theme collection by ID
    // checkThemeCol(themeColKey);
    //check if form value sum > 0
    let sum: number = getSum(chartData);
    if (sum <= 0) {
      figma.notify("Please enter correct value for items");
      return;
    }
    // Transform data with helper
    const transformedData: TransformedChartItem[] = transformToPercents(
      chartData.data,
    );
    // create chart frame to hold slices
    const chartFrame = figma.createFrame();
    chartFrame.fills = [];
    chartFrame.resize(chartConfig.size, chartConfig.size / 2);
    Object.assign(chartFrame, {
      name: "Chart area",
      x: figma.viewport.center.x - chartConfig.size / 2,
      y: figma.viewport.center.y - chartConfig.size / 2,
    });
    // use indexed for loop (compatible with older TS targets)
    for (let i = 0; i < transformedData.length; i++) {
      const item = transformedData[i];
      const layerName = `${item.label} (${item.value})`;
      let isFirstSlice = i == 0 ? true : false;
      if (item.value > 0) {
        const slice = await createSemiDonutSlice(
          item.startPercent,
          item.endPercent,
          layerName,
          chartConfig.defaultColor,
          isFirstSlice,
          item.colorToken ?? null,
        );
        if (slice) {
          slice.x = 0;
          slice.y = 0;
          chartFrame.appendChild(slice);
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
    const totalValFrame = await createTotalValueFrame(sum, "Total value");
    //chart + value frame
    const chartValueFrame = figma.createFrame();
    chartValueFrame.fills = [];
    Object.assign(chartValueFrame, {
      name: "Chart + total value",
      layoutMode: "VERTICAL",
      primaryAxisSizingMode: "AUTO",
      counterAxisSizingMode: "AUTO",
      counterAxisAlignItems: "CENTER",
    });
    chartValueFrame.appendChild(chartFrame);
    if (totalValFrame) {
      chartValueFrame.appendChild(totalValFrame);
      totalValFrame.layoutPositioning = "ABSOLUTE";
      totalValFrame.x = (chartFrame.width - totalValFrame.width) / 2;
      totalValFrame.y = 90;
    }
    const finalFrame = await createFinalFrame();
    finalFrame.appendChild(chartValueFrame);
    finalFrame.appendChild(legendList);
    figma.currentPage.appendChild(finalFrame);
    figma.currentPage.selection = [finalFrame];
    figma.viewport.scrollAndZoomIntoView([finalFrame]);
  }
  // Horizontal bar chart
  async function handleHorizontalBarChartData(chartData: ChartData) {
    // check Theme collection by ID
    checkThemeCol(themeColKey);
    //check if form value sum > 0
    let sum: number = getSum(chartData);
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
      let isFirstSlice = i == 0 ? true : false;
      if (item.value > 0) {
        const bar = await createHorBar(
          item.startPercent,
          item.endPercent,
          item.exactPercent,
          layerName,
          chartConfig.defaultColor,
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
    //create final frame
    const finalFrame = await createFinalFrame();
    finalFrame.appendChild(chartFrame);
    finalFrame.appendChild(legendList);
    figma.currentPage.appendChild(finalFrame);
    figma.currentPage.selection = [finalFrame];
    figma.viewport.scrollAndZoomIntoView([finalFrame]);
  }
  //Legend frame
  const legendList = createLegendList();
  on("SUBMIT_SEMI_DONUT_CHART_DATA", handleSemiDonutChartData);
  on("SUBMIT_HORIZONTAL_BAR_CHART_DATA", handleHorizontalBarChartData);
  // UI window size
  showUI({
    width: pluginUI.size.width,
    height: pluginUI.size.height,
  });
}
