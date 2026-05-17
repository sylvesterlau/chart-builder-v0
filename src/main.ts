import { on, showUI } from "@create-figma-plugin/utilities";
import { pluginUISize } from "./config";
import { ChartData, LineChartConfig, VerticalBarChartConfig } from "./types";
import { getTokenVarKey } from "./helpers";
import { drawHorBarChart } from "./utils/drawHorBarChart";
import { drawLineChart } from "./utils/drawLineChart";
import { drawPieChart } from "./utils/drawPieChart";
import { drawSemiDonutChart } from "./utils/drawSemiDonutChart";
import { drawVerticalBarChart } from "./utils/drawVerticalBarChart";

export default function () {
  function handleResizePluginUiWindow(size: { width: number; height: number }) {
    figma.ui.resize(size.width, size.height);
  }

  async function handleSemiDonutChartData(chartData: ChartData) {
    await drawSemiDonutChart(chartData);
  }

  async function handleHorizontalBarChartData(chartData: ChartData) {
    await drawHorBarChart(chartData);
  }

  async function handlePieChartData(chartData: ChartData) {
    await drawPieChart(chartData);
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

  async function handleLineChartData(
    chartData: Partial<LineChartConfig>,
  ) {
    try {
      await drawLineChart(chartData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create line chart.";
      figma.notify(message, { error: true, timeout: 4000 });
    }
  }

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
  on("SUBMIT_VERTICAL_BAR_CHART_DATA", handleVerticalBarChartData);
  on("SUBMIT_LINE_CHART_DATA", handleLineChartData);
  on("LOOKUP_TOKEN_VAR_KEY", handleLookupTokenVarKey);
  on("RESIZE_PLUGIN_UI_WINDOW", handleResizePluginUiWindow);

  showUI({
    width: pluginUISize.homePage.width,
    height: pluginUISize.homePage.height,
  });
}
