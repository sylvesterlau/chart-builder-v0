import { emit, on, showUI } from "@create-figma-plugin/utilities";
import { pluginUISize } from "./config";
import { ChartData, VerticalBarChartConfig } from "./types";
import { lookupTokenVarKeys } from "./helpers";
import { drawHorBarChart } from "./utils/drawHorBarChart";
import { drawPieChart } from "./utils/drawPieChart";
import { drawSemiDonutChart } from "./utils/drawSemiDonutChart";
import { drawVerticalBarChart } from "./utils/drawVerticalBarChart";
import { resolveColorTokenSwatchMap } from "./utils/resolveColorTokenSwatches";
import { resolveNumberTokenPayload } from "./utils/resolveNumberTokenValues";

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

  async function handleLookupTokenVarKeys(paths: string[]) {
    const results = await lookupTokenVarKeys(paths);
    emit("TOKEN_VAR_KEY_LOOKUP_RESULTS", results);
  }

  async function publishColorTokenSwatchValues() {
    const values = await resolveColorTokenSwatchMap();
    emit("COLOR_TOKEN_SWATCH_VALUES", values);
  }

  async function publishNumberTokenResolvedValues() {
    const payload = await resolveNumberTokenPayload();
    emit("NUMBER_TOKEN_RESOLVED_VALUES", payload);
  }

  async function publishDesignTokenValues() {
    await Promise.all([
      publishColorTokenSwatchValues(),
      publishNumberTokenResolvedValues(),
    ]);
  }

  on("SUBMIT_SEMI_DONUT_CHART_DATA", handleSemiDonutChartData);
  on("SUBMIT_HORIZONTAL_BAR_CHART_DATA", handleHorizontalBarChartData);
  on("SUBMIT_PIE_CHART_DATA", handlePieChartData);
  on("SUBMIT_VERTICAL_BAR_CHART_DATA", handleVerticalBarChartData);
  on("LOOKUP_TOKEN_VAR_KEYS", handleLookupTokenVarKeys);
  on("RESIZE_PLUGIN_UI_WINDOW", handleResizePluginUiWindow);
  on("REQUEST_COLOR_TOKEN_SWATCH_VALUES", publishColorTokenSwatchValues);
  on("REQUEST_NUMBER_TOKEN_RESOLVED_VALUES", publishNumberTokenResolvedValues);

  showUI({
    width: pluginUISize.homePage.width,
    height: pluginUISize.homePage.height,
  });

  void publishDesignTokenValues();
}
