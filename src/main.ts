import { emit, on, showUI } from "@create-figma-plugin/utilities";
import { pluginUISize } from "./config";
import { ChartData, VerticalBarChartConfig } from "./types";
import { lookupTokenVarKeys, readSelectedTextLayerStyleKey } from "./helpers";
import { drawHorBarChart } from "./utils/drawHorBarChart";
import { drawPieChart } from "./utils/drawPieChart";
import { drawSemiDonutChart } from "./utils/drawSemiDonutChart";
import { drawVerticalBarChart } from "./utils/drawVerticalBarChart";
import { resolveColorTokenPayload } from "./utils/resolveColorTokenSwatches";
import { resolveNumberTokenPayload } from "./utils/resolveNumberTokenValues";
import { resolveTypographyTokenPayload } from "./utils/resolveTypographyTokenValues";

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

  async function handleReadSelectedTextStyleKey() {
    const result = await readSelectedTextLayerStyleKey();
    emit("SELECTED_TEXT_STYLE_KEY_RESULT", result);
  }

  async function publishColorTokenSwatchValues() {
    const payload = await resolveColorTokenPayload();
    emit("COLOR_TOKEN_SWATCH_VALUES", payload);
  }

  async function publishNumberTokenResolvedValues() {
    const payload = await resolveNumberTokenPayload();
    emit("NUMBER_TOKEN_RESOLVED_VALUES", payload);
  }

  async function publishTypographyTokenResolvedValues() {
    const payload = await resolveTypographyTokenPayload();
    emit("TYPOGRAPHY_TOKEN_RESOLVED_VALUES", payload);
  }

  async function publishDesignTokenValues() {
    await Promise.all([
      publishColorTokenSwatchValues(),
      publishNumberTokenResolvedValues(),
      publishTypographyTokenResolvedValues(),
    ]);
  }

  let republishTimer: ReturnType<typeof setTimeout> | null = null;
  function scheduleRepublishDesignTokens() {
    if (republishTimer !== null) {
      clearTimeout(republishTimer);
    }
    republishTimer = setTimeout(() => {
      republishTimer = null;
      void publishDesignTokenValues();
    }, 200);
  }

  on("SUBMIT_SEMI_DONUT_CHART_DATA", handleSemiDonutChartData);
  on("SUBMIT_HORIZONTAL_BAR_CHART_DATA", handleHorizontalBarChartData);
  on("SUBMIT_PIE_CHART_DATA", handlePieChartData);
  on("SUBMIT_VERTICAL_BAR_CHART_DATA", handleVerticalBarChartData);
  on("LOOKUP_TOKEN_VAR_KEYS", handleLookupTokenVarKeys);
  on("READ_SELECTED_TEXT_STYLE_KEY", handleReadSelectedTextStyleKey);
  on("RESIZE_PLUGIN_UI_WINDOW", handleResizePluginUiWindow);
  on("REQUEST_COLOR_TOKEN_SWATCH_VALUES", publishColorTokenSwatchValues);
  on("REQUEST_NUMBER_TOKEN_RESOLVED_VALUES", publishNumberTokenResolvedValues);
  on(
    "REQUEST_TYPOGRAPHY_TOKEN_RESOLVED_VALUES",
    publishTypographyTokenResolvedValues,
  );

  showUI({
    width: pluginUISize.homePage.width,
    height: pluginUISize.homePage.height,
  });

  void publishDesignTokenValues();

  figma.on("currentpagechange", scheduleRepublishDesignTokens);
  figma.on("selectionchange", scheduleRepublishDesignTokens);
}
