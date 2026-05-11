import { on, showUI } from "@create-figma-plugin/utilities";
import { pluginUISize } from "./config";
import { ChartData } from "./types";
import { getTokenVarKey } from "./helpers";
import { drawHorBarChart } from "./utils/drawHorBarChart";
import { drawPieChart } from "./utils/drawPieChart";
import { drawSemiDonutChart } from "./utils/drawSemiDonutChart";
export default function () {
  function handleResizePluginUiWindow(size: { width: number; height: number }) {
    figma.ui.resize(size.width, size.height);
  }
  // Semi donut chart
  async function handleSemiDonutChartData(chartData: ChartData) {
    await drawSemiDonutChart(chartData);
  }
  // Horizontal bar chart
  async function handleHorizontalBarChartData(chartData: ChartData) {
    await drawHorBarChart(chartData);
  }
  // Pie chart
  async function handlePieChartData(chartData: ChartData) {
    await drawPieChart(chartData);
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
  on("SUBMIT_PIE_CHART_DATA", handlePieChartData);
  on("LOOKUP_TOKEN_VAR_KEY", handleLookupTokenVarKey);
  on("RESIZE_PLUGIN_UI_WINDOW", handleResizePluginUiWindow);
  // UI window size
  showUI({
    width: pluginUISize.homePage.width,
    height: pluginUISize.homePage.height,
  });
}
