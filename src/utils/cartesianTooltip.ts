import { dataVisAt } from "./dataVisAt";
import {
  LineChartConfig,
  LineChartSeries,
  VerticalBarChartConfig,
  VerticalBarChartSeries,
} from "../types";
import { formatKeyInfoNumber } from "./cartesianKeyInfo";

export type CartesianTooltipKind = "bar" | "line";

export interface CartesianTooltipItem {
  label: string;
  value: string;
  color: string;
  colorTokenIndex: number;
}

export interface CartesianTooltipData {
  kind: CartesianTooltipKind;
  title: string;
  items: CartesianTooltipItem[];
}

function seriesName(
  series: VerticalBarChartSeries | LineChartSeries,
  index: number,
): string {
  return (
    String(series.name || "").trim() ||
    `Product ${String.fromCharCode(65 + index)}`
  );
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

export function buildBarTooltip(
  config: VerticalBarChartConfig,
): CartesianTooltipData | null {
  if (config.selectedIndex < 0 || config.selectedIndex >= config.periodCount) {
    return null;
  }

  const visibleSeries =
    config.barMode === "single"
      ? config.series.slice(0, 1)
      : config.series.slice(0, 2);
  const label = config.labels[config.selectedIndex] || "";
  const year = yearFromAxisTitle(config.xAxisTitle);
  const suffix = year ? ` ${year}` : "";

  return {
    kind: "bar",
    title: label ? `As of ${label}${suffix}` : "",
    items: visibleSeries.map((series, index) => ({
      label: seriesName(series, index),
      value: `${formatKeyInfoNumber(series.values[config.selectedIndex] || 0)} ${config.yAxisTitle}`,
      color: colorForSeries(series, index),
      colorTokenIndex: index,
    })),
  };
}

export function buildLineTooltip(
  config: LineChartConfig,
): CartesianTooltipData | null {
  if (config.selectedIndex < 0 || config.selectedIndex >= config.pointCount) {
    return null;
  }

  const visibleSeries = config.series;
  const yAxisDataType = config.yAxisDataType ?? "number";
  const label =
    config.pointLabels[config.selectedIndex] || `P${config.selectedIndex + 1}`;
  const valueSuffix =
    yAxisDataType === "percentage"
      ? "%"
      : config.yAxisTitle.trim()
        ? ` ${config.yAxisTitle}`
        : "";

  return {
    kind: "line",
    title: label ? `As of ${label}` : "",
    items: visibleSeries.map((series, index) => ({
      label: seriesName(series, index),
      value: `${formatKeyInfoNumber(series.values[config.selectedIndex] || 0)}${valueSuffix}`,
      color: colorForSeries(series, index),
      colorTokenIndex: index,
    })),
  };
}
