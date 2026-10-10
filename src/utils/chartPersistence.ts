import type { ChartData, LegendStyle, LineChartConfig } from "../types";

export const CHART_CONFIG_KEY = "hive_chart_config";

/** JSON travels with the root frame, independently of its node ID. */
export interface HorizontalBarDraft {
  chartTitle: string;
  showChartTitle: boolean;
  data: { label: string; value: number }[];
  frameWidth: number;
  showLegend: boolean;
  legendStyle: LegendStyle;
  showPercentage: boolean;
  valuePrefix: string;
  valueSuffix: string;
  othersLabel: string;
}

export interface LineChartDraft {
  config: Omit<LineChartConfig, "color">;
  editor: {
    chartTitle: string;
    showChartTitle: boolean;
    xAxisMode: "date" | "time";
    xAxisStartInput: string;
    xAxisEndInput: string;
    yAxisUnit: string;
    tooltipPercent: number;
    showTooltip: boolean;
  };
}

export type ChartRecord = {
  schemaVersion: 1;
  chartType: "horizontalBar";
  revision: number;
  draft: HorizontalBarDraft;
} | {
  schemaVersion: 1;
  chartType: "lineChart";
  revision: number;
  draft: LineChartDraft;
};

export interface ChartEditSession {
  nodeId: string;
  /** Optimistic concurrency token; do not update a chart changed by another session. */
  savedJson: string;
  record: ChartRecord;
}

export function parseChartRecord(raw: string): ChartRecord {
  const record = JSON.parse(raw);
  if (record?.schemaVersion !== 1 || !["horizontalBar", "lineChart"].includes(record?.chartType)) {
    throw new Error("Unsupported chart configuration version or chart type.");
  }
  const d = record.draft;
  if (record.chartType === "lineChart") {
    validateLineDraft(d);
    if (!Number.isSafeInteger(record.revision) || record.revision < 1) throw new Error("Invalid chart revision.");
    return record;
  }
  if (!Number.isInteger(record.revision) || record.revision < 1 || !d ||
      !["chartTitle", "valuePrefix", "valueSuffix", "othersLabel"].every(k => typeof d[k] === "string") ||
      !["showChartTitle", "showLegend", "showPercentage"].every(k => typeof d[k] === "boolean") ||
      !["none", "leftAndRight", "topAndBottom"].includes(d.legendStyle) ||
      !Number.isFinite(d.frameWidth) || d.frameWidth < 360 || d.frameWidth > 1000 ||
      !Array.isArray(d.data) || d.data.length < 2 || d.data.length > 10 ||
      !d.data.every((item: {label: unknown; value: unknown}) =>
        item && typeof item.label === "string" && typeof item.value === "number" &&
        Number.isFinite(item.value) && item.value >= 0) ||
      !Number.isFinite(d.data.reduce((sum: number, item: {value: number}) => sum + item.value, 0)) ||
      d.data.reduce((sum: number, item: {value: number}) => sum + item.value, 0) <= 0) {
    throw new Error("Invalid saved chart configuration. The original chart was not changed.");
  }
  return record;
}

export function serializeChartRecord(draft: HorizontalBarDraft, revision = 1): string {
  return serializeRecord({ schemaVersion: 1, chartType: "horizontalBar", revision, draft });
}

export function serializeLineChartRecord(draft: LineChartDraft, revision = 1): string {
  return serializeRecord({ schemaVersion: 1, chartType: "lineChart", revision, draft });
}

function serializeRecord(record: ChartRecord): string {
  const raw = JSON.stringify(record);
  parseChartRecord(raw);
  // Reserve space for Figma's plugin ID and key within the 100 kB entry limit.
  const byteLength = encodeURIComponent(raw).replace(/%[A-F\d]{2}/gi, "x").length;
  if (byteLength > 90000) throw new Error("Chart configuration exceeds this spike's 90 kB limit.");
  return raw;
}

function validateLineDraft(d: LineChartDraft): void {
  const c = d?.config;
  const e = d?.editor;
  const finite = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);
  const strings = (a: unknown): a is string[] => Array.isArray(a) && a.every(s => typeof s === "string");
  if (!c || !e || c.chartType !== "lineChart" ||
      !["single", "multi"].includes(c.lineMode) || !["partial", "full"].includes(c.lineRange) ||
      !["left", "right"].includes(c.yAxisPosition ?? "") ||
      !["none", "x", "y", "both"].includes(c.axisLineVisibility ?? "") ||
      !["number", "percentage"].includes(c.yAxisDataType ?? "") ||
      !Number.isInteger(c.pointCount) || c.pointCount < 2 || c.pointCount > 180 ||
      !Number.isInteger(c.selectedIndex) || c.selectedIndex < -1 || c.selectedIndex >= c.pointCount ||
      !finite(c.width) || c.width < 260 || c.width > 1200 ||
      !finite(c.height) || c.height < 260 || c.height > 900 ||
      !finite(c.minValue) || !finite(c.maxValue) || c.minValue >= c.maxValue ||
      !Number.isInteger(c.yAxisDivisions) || c.yAxisDivisions! < 2 || c.yAxisDivisions! > 10 ||
      typeof c.chartTitle !== "string" || typeof c.yAxisTitle !== "string" || typeof c.xAxisTitle !== "string" ||
      !strings(c.xAxisLabels) || !strings(c.pointLabels) || c.pointLabels.length !== c.pointCount ||
      !Array.isArray(c.series) || c.series.length < 1 || c.series.length > 3 ||
      !c.series.every(s => s && typeof s.name === "string" && typeof s.color === "string" &&
        Array.isArray(s.values) && s.values.length === c.pointCount && s.values.every(finite)) ||
      typeof e.chartTitle !== "string" || typeof e.yAxisUnit !== "string" ||
      typeof e.showChartTitle !== "boolean" || typeof e.showTooltip !== "boolean" ||
      !finite(e.tooltipPercent) || e.tooltipPercent < 0 || e.tooltipPercent > 100 ||
      !["date", "time"].includes(e.xAxisMode) ||
      typeof e.xAxisStartInput !== "string" || typeof e.xAxisEndInput !== "string") {
    throw new Error("Invalid saved line chart configuration. The original chart was not changed.");
  }
  const parseAxis = (value: string) => {
    if (e.xAxisMode === "time") {
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return NaN;
      const [h, m] = value.split(":").map(Number);
      return h * 60 + m;
    }
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return NaN;
    const [y, m] = value.split("-").map(Number);
    return y * 12 + m;
  };
  if (!(parseAxis(e.xAxisStartInput) < parseAxis(e.xAxisEndInput))) throw new Error("Invalid saved X-axis range.");
}

export function toChartData(d: HorizontalBarDraft): ChartData {
  return { ...d, chartTitle: d.showChartTitle ? d.chartTitle : "",
    legendStyle: d.showLegend ? d.legendStyle : "none" };
}

export interface ChartDataNode {
  id: string;
  type: string;
  parent: ChartDataNode | null;
  getPluginData(key: string): string;
}

/** A selected bar or label resolves to its owning chart, not a global node-ID index. */
export function findChartSession(node: ChartDataNode | null): ChartEditSession | null {
  while (node && node.type !== "PAGE" && node.type !== "DOCUMENT") {
    const savedJson = node.getPluginData(CHART_CONFIG_KEY);
    if (savedJson) {
      if (node.type !== "FRAME") throw new Error("The saved chart root must be a frame.");
      return { nodeId: node.id, savedJson, record: parseChartRecord(savedJson) };
    }
    node = node.parent;
  }
  return null;
}

export function assertUnchanged(savedJson: string, currentJson: string): void {
  if (savedJson !== currentJson) {
    throw new Error("This chart changed after you opened it. Reopen it before updating.");
  }
}
