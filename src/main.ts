import { emit, on, showUI } from "@create-figma-plugin/utilities";
import { lineChartConfig, pluginUISize } from "./config";
import {
  EDIT_CONTROLS_PANEL_WIDTH_STORAGE_KEY,
  type SetEditControlsPanelWidthPayload,
} from "./utils/editControlsPanelSize";
import {
  PLUGIN_UI_USER_SIZE_STORAGE_KEY,
  type PluginWindowSize,
  type ResizePluginUiWindowPayload,
} from "./utils/pluginUiSize";
import { ChartData, LineChartConfig, VerticalBarChartConfig } from "./types";
import { lookupTokenVarKeys, readSelectedTextLayerStyleKey } from "./helpers";
import { drawHorBarChart } from "./utils/drawHorBarChart";
import { drawLineChart } from "./utils/drawLineChart";
import { drawPieChart } from "./utils/drawPieChart";
import { drawSemiDonutChart } from "./utils/drawSemiDonutChart";
import { drawVerticalBarChart } from "./utils/drawVerticalBarChart";
import { resolveColorTokenPayload } from "./utils/resolveColorTokenSwatches";
import { resolveNumberTokenPayload } from "./utils/resolveNumberTokenValues";
import { resolveTypographyTokenPayload } from "./utils/resolveTypographyTokenValues";

import { CHART_CONFIG_KEY, assertUnchanged, findChartSession, parseChartRecord,
  serializeChartRecord, serializeLineChartRecord, toChartData, type HorizontalBarDraft, type LineChartDraft, type ChartEditSession } from "./utils/chartPersistence";

export default function () {
  function handleResizePluginUiWindow(payload: ResizePluginUiWindowPayload) {
    figma.ui.resize(payload.width, payload.height);
    if (payload.persist) {
      void figma.clientStorage.setAsync(PLUGIN_UI_USER_SIZE_STORAGE_KEY, {
        width: payload.width,
        height: payload.height,
      });
    }
  }

  async function handleRequestPluginUiUserSize() {
    const savedSize = (await figma.clientStorage.getAsync(
      PLUGIN_UI_USER_SIZE_STORAGE_KEY,
    )) as PluginWindowSize | null | undefined;
    emit("PLUGIN_UI_USER_SIZE", savedSize ?? null);
  }

  function handleSetEditControlsPanelWidth(
    payload: SetEditControlsPanelWidthPayload,
  ) {
    if (payload.persist) {
      void figma.clientStorage.setAsync(
        EDIT_CONTROLS_PANEL_WIDTH_STORAGE_KEY,
        payload.width,
      );
    }
  }

  async function handleRequestEditControlsPanelWidth() {
    const savedWidth = (await figma.clientStorage.getAsync(
      EDIT_CONTROLS_PANEL_WIDTH_STORAGE_KEY,
    )) as number | null | undefined;
    emit(
      "EDIT_CONTROLS_PANEL_WIDTH",
      typeof savedWidth === "number" ? savedWidth : null,
    );
  }

  let savingChart = false;
  function requestSavedChart(silent = false) {
    try {
      const selected = figma.currentPage.selection;
      const session = selected.length === 1 ? findChartSession(selected[0]) : null;
      if (session) emit("SPIKE_CHART_OPENED", session);
      else if (!silent) figma.notify("Select one chart created by this spike (or a layer inside it).");
    } catch (error) {
      figma.notify(error instanceof Error ? error.message : "Cannot read saved chart.", { error: true });
    }
  }

  async function saveSpikeChart(draft: HorizontalBarDraft | LineChartDraft, session: ChartEditSession | null, chartType: "horizontalBar" | "lineChart" = "horizontalBar") {
    if (savingChart) return;
    savingChart = true;
    let generated: FrameNode | undefined;
    try {
      let target: FrameNode | null = null;
      let revision = 1;
      if (session) {
        const node = await figma.getNodeByIdAsync(session.nodeId);
        if (!node || node.type !== "FRAME" || node.removed) throw new Error("Original chart is missing. Insert a copy instead.");
        target = node;
        assertUnchanged(session.savedJson, target.getPluginData(CHART_CONFIG_KEY));
        const previous = parseChartRecord(session.savedJson);
        if (previous.chartType !== chartType) throw new Error("Chart type does not match the saved chart.");
        revision = previous.revision + 1;
      }
      const raw = chartType === "lineChart"
        ? serializeLineChartRecord(draft as LineChartDraft, revision)
        : serializeChartRecord(draft as HorizontalBarDraft, revision);
      const record = parseChartRecord(raw);
      generated = record.chartType === "lineChart"
        ? await drawLineChart({ ...record.draft.config, color: lineChartConfig.color }, false)
        : await drawHorBarChart(toChartData(record.draft), false);
      if (!generated) throw new Error("Chart could not be generated.");
      // Write to the staged frame first: failures leave an existing chart untouched.
      generated.setPluginData(CHART_CONFIG_KEY, raw);
      if (target) {
        if (target.removed) throw new Error("Original chart was deleted while generating.");
        assertUnchanged(session!.savedJson, target.getPluginData(CHART_CONFIG_KEY));
        const nextWidth = generated.width;
        const previousChildren = [...target.children];
        const replacements = [...generated.children];
        const previousWidth = target.width;
        const previousHeight = target.height;
        try {
          for (const child of replacements) target.appendChild(child);
          target.resize(nextWidth, target.height);
          target.setPluginData(CHART_CONFIG_KEY, raw);
        } catch (error) {
          // Keep the old layers until every fallible write has succeeded.
          for (const child of replacements) if (!child.removed) generated.appendChild(child);
          target.resize(previousWidth, previousHeight);
          throw error;
        }
        for (const child of previousChildren) child.remove();
        generated.remove();
      } else {
        target = generated;
      }
      generated = undefined;
      figma.currentPage.selection = [target];
      figma.viewport.scrollAndZoomIntoView([target]);
      emit("SPIKE_CHART_OPENED", { nodeId: target.id, savedJson: raw, record: parseChartRecord(raw) });
      figma.notify(session ? "Updated original chart; JSON revision " + revision : "Chart created with embedded JSON.");
    } catch (error) {
      if (generated && !generated.removed) generated.remove();
      figma.notify(error instanceof Error ? error.message : "Chart save failed.", { error: true });
    } finally {
      savingChart = false;
      emit("SPIKE_SAVE_FINISHED");
    }
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

  on("SPIKE_OPEN_SELECTED_CHART", requestSavedChart);
  on("SPIKE_READ_CHART_JSON", async (nodeId: string) => {
    try {
      const node = await figma.getNodeByIdAsync(nodeId);
      if (!node || node.type !== "FRAME" || node.removed) throw new Error("图表 Frame 已不存在。");
      const raw = node.getPluginData(CHART_CONFIG_KEY);
      if (!raw) throw new Error("这个 Frame 没有已保存的图表 JSON。");
      emit("SPIKE_CHART_JSON", { nodeId, raw });
    } catch (error) {
      emit("SPIKE_CHART_JSON", { nodeId, error: error instanceof Error ? error.message : "读取失败。" });
    }
  });
  on("SPIKE_SAVE_CHART", saveSpikeChart);
  on("SPIKE_SAVE_LINE_CHART", (draft: LineChartDraft, session: ChartEditSession | null) => saveSpikeChart(draft, session, "lineChart"));
  on("SUBMIT_SEMI_DONUT_CHART_DATA", handleSemiDonutChartData);
  on("SUBMIT_HORIZONTAL_BAR_CHART_DATA", handleHorizontalBarChartData);
  on("SUBMIT_PIE_CHART_DATA", handlePieChartData);
  on("SUBMIT_VERTICAL_BAR_CHART_DATA", handleVerticalBarChartData);
  on("SUBMIT_LINE_CHART_DATA", handleLineChartData);
  on("LOOKUP_TOKEN_VAR_KEYS", handleLookupTokenVarKeys);
  on("READ_SELECTED_TEXT_STYLE_KEY", handleReadSelectedTextStyleKey);
  on("RESIZE_PLUGIN_UI_WINDOW", handleResizePluginUiWindow);
  on("REQUEST_PLUGIN_UI_USER_SIZE", function () {
    void handleRequestPluginUiUserSize();
  });
  on("SET_EDIT_CONTROLS_PANEL_WIDTH", handleSetEditControlsPanelWidth);
  on("REQUEST_EDIT_CONTROLS_PANEL_WIDTH", function () {
    void handleRequestEditControlsPanelWidth();
  });
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
