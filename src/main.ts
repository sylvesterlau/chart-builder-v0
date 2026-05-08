import { on, showUI } from "@create-figma-plugin/utilities";
import { pluginUI, chartConfig, teamLibrary } from "./config";
import { ChartData, VerticalBarChartConfig } from "./types";
import {
  transformToPercents,
  TransformedChartItem,
  getSum,
  getTokenVarKey,
} from "./helpers";
import {
  createSemiDonutSlice,
  createLegend,
  createLegendList,
  createFinalFrame,
  createTotalValueFrame,
  loadLegendFonts,
} from "./utils/figmaOperations";
import { drawHorBarChart } from "./utils/drawHorBarChart";
import { drawVerticalBarChart } from "./utils/drawVerticalBarChart";
const themeColKey = teamLibrary.coreToolKit.collectionKey; // "Theme" collection key
export default function () {
  function handleResizePluginUiWindow(size: { width: number; height: number }) {
    figma.ui.resize(size.width, size.height);
  }
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
    await figma.currentPage.loadAsync();
    await loadLegendFonts();
    const legendList = createLegendList();
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
    await drawHorBarChart(chartData);
  }
  async function handleVerticalBarChartData(
    chartData: Partial<VerticalBarChartConfig>,
  ) {
    try {
      await drawVerticalBarChart(chartData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create bar chart.";
      figma.notify(message, { error: true, timeout: 4000 });
    }
  }
  // Token key lookup
  async function handleLookupTokenVarKey(tokenPath: string) {
    if (!tokenPath || !tokenPath.trim()) {
      figma.notify("Please enter a token path");
      return;
    }
    await getTokenVarKey(tokenPath);
  }
  on("SUBMIT_SEMI_DONUT_CHART_DATA", handleSemiDonutChartData);
  on("SUBMIT_HORIZONTAL_BAR_CHART_DATA", handleHorizontalBarChartData);
  on("SUBMIT_VERTICAL_BAR_CHART_DATA", handleVerticalBarChartData);
  on("LOOKUP_TOKEN_VAR_KEY", handleLookupTokenVarKey);
  on("RESIZE_PLUGIN_UI_WINDOW", handleResizePluginUiWindow);
  // UI window size
  showUI({
    width: pluginUI.size.width,
    height: pluginUI.size.height,
  });
}
