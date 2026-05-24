import { dataVisAt } from "../config";
import {
  LineChartConfig,
  LineChartSeries,
  VerticalBarChartConfig,
  VerticalBarChartSeries,
} from "../types";

export type CartesianKeyInfoKind = "bar" | "line";

export interface CartesianKeyInfoItem {
  label: string;
  value: string;
  unit: string;
  color: string;
  colorTokenIndex: number;
  percentageChange?: number;
}

export interface CartesianKeyInfoData {
  kind: CartesianKeyInfoKind;
  rangeLabel: string;
  items: CartesianKeyInfoItem[];
  layout: "inline" | "rows";
}

export function formatKeyInfoNumber(value: number): string {
  const rounded = Math.round(Number(value) || 0);
  const sign = rounded < 0 ? "-" : "";
  return `${sign}${String(Math.abs(rounded)).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

export function formatPercentageChange(value: number): string {
  const absolute = Math.abs(Number(value) || 0);
  return `${absolute.toFixed(2)}%`;
}

function seriesName(
  series: VerticalBarChartSeries | LineChartSeries,
  index: number,
): string {
  return String(series.name || "").trim() || `Data set ${index + 1}`;
}

function colorForSeries(
  series: VerticalBarChartSeries | LineChartSeries,
  index: number,
): string {
  return series.color || dataVisAt(index).value;
}

function yearFromAxisTitle(axisTitle: string): string {
  const match = String(axisTitle || "").match(/\b(19|20)\d{2}\b/);
  return match ? match[0] : "";
}

export function buildBarKeyInfo(config: VerticalBarChartConfig): CartesianKeyInfoData {
  const visibleSeries =
    config.barMode === "single"
      ? config.series.slice(0, 1)
      : config.series.slice(0, 2);
  const labels = config.labels.slice(0, config.periodCount);
  const startLabel = labels[0] || "";
  const endLabel = labels[labels.length - 1] || startLabel;
  const year = yearFromAxisTitle(config.xAxisTitle);
  const suffix = year ? ` ${year}` : "";

  return {
    kind: "bar",
    rangeLabel: startLabel && endLabel ? `${startLabel}${suffix} - ${endLabel}${suffix}` : "",
    layout: visibleSeries.length <= 2 ? "inline" : "rows",
    items: visibleSeries.map((series, index) => {
      const values = series.values.slice(0, config.periodCount).map((value) => Number(value) || 0);
      const min = values.length ? Math.min(...values) : 0;
      const max = values.length ? Math.max(...values) : 0;
      return {
        label: seriesName(series, index),
        value: `${formatKeyInfoNumber(min)}-${formatKeyInfoNumber(max)}`,
        unit: config.yAxisTitle,
        color: colorForSeries(series, index),
        colorTokenIndex: index,
      };
    }),
  };
}

export function buildLineKeyInfo(config: LineChartConfig): CartesianKeyInfoData {
  const visibleSeries =
    config.lineMode === "single"
      ? config.series.slice(0, 1)
      : config.series.slice(0, 3);
  const firstLabel = config.pointLabels[0] || config.xAxisLabels.find(Boolean) || "";
  const lastLabel =
    config.pointLabels[config.pointCount - 1] ||
    [...config.xAxisLabels].reverse().find(Boolean) ||
    firstLabel;

  return {
    kind: "line",
    rangeLabel: firstLabel && lastLabel ? `${firstLabel} - ${lastLabel}` : "",
    layout: visibleSeries.length <= 2 ? "inline" : "rows",
    items: visibleSeries.map((series, index) => {
      const values = series.values.slice(0, config.pointCount);
      const first = Number(values[0]) || 0;
      const last = Number(values[values.length - 1]) || 0;
      const percentageChange =
        config.lineMode === "single" && first !== 0
          ? ((last - first) / Math.abs(first)) * 100
          : undefined;
      return {
        label: seriesName(series, index),
        value: formatKeyInfoNumber(last),
        unit: config.yAxisTitle,
        color: colorForSeries(series, index),
        colorTokenIndex: index,
        percentageChange,
      };
    }),
  };
}
