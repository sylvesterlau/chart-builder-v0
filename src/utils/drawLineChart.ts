import {
  chartBackground,
  lineChartConfig,
  spacing,
  textColor,
} from "../config";
import { dataVisAt } from "./dataVisAt";
import {
  clamp,
  normalizeLineChartConfig,
} from "../helpers";
import {
  ColorToken,
  LineChartConfig,
  NormalizedLineChartConfig,
  TypographyToken,
} from "../types";
import { applyColorTokenToFills, applyColorTokenToStrokes } from "./applyColorToken";
import {
  applyHorizontalPadding,
  applyItemSpacing,
  applyPaddingBottom,
  numberTokenValue,
} from "./applyNumberToken";
import {
  applyTypographyTokenToText,
  loadTypographyTokenFontsBatch,
} from "./applyTypographyToken";
import { buildLineKeyInfo } from "./cartesianKeyInfo";
import { buildLineTooltip } from "./cartesianTooltip";
import {
  createCartesianKeyInfo,
  loadCartesianKeyInfoFonts,
} from "./drawCartesianKeyInfo";
import {
  createCartesianTooltip,
  loadCartesianTooltipFonts,
} from "./drawCartesianTooltip";
import {
  drawCartesianXAxis,
  drawCartesianYAxis,
  drawCartesianYAxisTitle,
} from "./drawCartesianAxis";
import { createChartTitle, loadChartTitleFont } from "./drawChartTitle";

const ROOT_NAME = "_demo/line chart/1";

function lineChartTypographyTokens(
  config: NormalizedLineChartConfig,
): TypographyToken[] {
  const { typography: ty, yAxisLabel } = config.color;
  return [ty.xAxisTitle, ty.yAxisTitle, ty.xAxisLabel, yAxisLabel];
}

async function loadLineChartFonts(config: NormalizedLineChartConfig) {
  await loadTypographyTokenFontsBatch(lineChartTypographyTokens(config));
}

async function createFrameNode(
  parent: BaseNode & ChildrenMixin,
  name: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fillToken?: ColorToken,
): Promise<FrameNode> {
  const frame = figma.createFrame();
  frame.name = name;
  frame.resize(Math.max(1, width), Math.max(1, height));
  frame.x = x;
  frame.y = y;
  frame.fills = [];
  if (fillToken) {
    await applyColorTokenToFills(frame, fillToken);
  }
  frame.clipsContent = false;
  parent.appendChild(frame);
  return frame;
}

async function createRect(
  parent: BaseNode & ChildrenMixin,
  name: string,
  x: number,
  y: number,
  width: number,
  height: number,
  token: ColorToken,
  nodeOpacity?: number,
): Promise<RectangleNode> {
  const rect = figma.createRectangle();
  rect.name = name;
  rect.resize(Math.max(1, width), Math.max(1, height));
  rect.x = x;
  rect.y = y;
  await applyColorTokenToFills(rect, token);
  if (nodeOpacity !== undefined) {
    rect.opacity = nodeOpacity;
  }
  parent.appendChild(rect);
  return rect;
}

async function createLine(
  parent: BaseNode & ChildrenMixin,
  name: string,
  x: number,
  y: number,
  length: number,
  token: ColorToken,
  strokeWeight = 1,
): Promise<LineNode> {
  const line = figma.createLine();
  line.name = name;
  line.resize(Math.max(1, length), 0);
  line.x = x;
  line.y = y;
  line.strokeWeight = strokeWeight;
  await applyColorTokenToStrokes(line, token);
  parent.appendChild(line);
  return line;
}

async function createLineVector(
  parent: BaseNode & ChildrenMixin,
  name: string,
  path: string,
  token: ColorToken,
): Promise<VectorNode> {
  const vector = figma.createVector();
  vector.name = name;
  vector.vectorPaths = [{ windingRule: "NONZERO", data: path }];
  vector.fills = [];
  vector.strokeWeight = 1.5;
  vector.strokeCap = "ROUND";
  vector.strokeJoin = "ROUND";
  await applyColorTokenToStrokes(vector, token);
  parent.appendChild(vector);
  return vector;
}

async function createText(
  characters: string | number,
  style: TypographyToken,
  token: ColorToken,
): Promise<TextNode> {
  const text = figma.createText();
  await applyTypographyTokenToText(text, style);
  text.characters = String(characters);
  text.textAutoResize = "WIDTH_AND_HEIGHT";
  await applyColorTokenToFills(text, token);
  return text;
}

function measureLabel(value: string): number {
  return String(value || "").length * 7;
}

function positionChart(chart: FrameNode) {
  const selected = figma.currentPage.selection[0];
  if (selected && "x" in selected && "y" in selected && "width" in selected) {
    chart.x = selected.x + selected.width + 40;
    chart.y = selected.y;
    return;
  }
  chart.x = figma.viewport.center.x - chart.width / 2;
  chart.y = figma.viewport.center.y - chart.height / 2;
}

function createPathFromValues(
  values: number[],
  minValue: number,
  maxValue: number,
  width: number,
  height: number,
): string {
  const range = Math.max(1, maxValue - minValue);
  return values
    .map((rawValue, index) => {
      const x = values.length <= 1 ? 0 : (index / (values.length - 1)) * width;
      const value = clamp(Number(rawValue) || 0, minValue, maxValue);
      const y = clamp(1 - (value - minValue) / range, 0, 1) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

async function drawSelectedLabel(
  parent: FrameNode,
  labelText: string,
  x: number,
  y: number,
  labelBg: ColorToken,
  labelTextStyle: TypographyToken,
) {
  const labelWidth = Math.max(28, measureLabel(labelText) + 16);
  const labelFrameHeight = Math.max(18, labelTextStyle.lineHeight);
  const labelFrame = await createFrameNode(
    parent,
    "Label selected",
    x - labelWidth / 2,
    y,
    labelWidth,
    labelFrameHeight,
    labelBg,
  );
  Object.assign(labelFrame, {
    layoutMode: "HORIZONTAL",
    primaryAxisSizingMode: "AUTO",
    counterAxisSizingMode: "AUTO",
    paddingLeft: 8,
    paddingRight: 8,
    counterAxisAlignItems: "CENTER",
  });
  const label = await createText(labelText, labelTextStyle, textColor.onDark);
  label.name = "Axis label";
  label.textAlignHorizontal = "CENTER";
  labelFrame.appendChild(label);
}

async function drawDashedIndicator(
  parent: FrameNode,
  x: number,
  y1: number,
  y2: number,
  segmentToken: ColorToken,
) {
  const top = Math.min(y1, y2);
  const bottom = Math.max(y1, y2);
  const indicator = await createFrameNode(
    parent,
    "Indicator line",
    x,
    top,
    1,
    bottom - top,
  );
  for (let y = top; y < bottom; y += 7) {
    await createRect(
      indicator,
      "Indicator segment",
      0,
      y - top,
      1,
      4,
      segmentToken,
    );
  }
}

async function applyMarkerStroke(
  node: MinimalStrokesMixin,
  strokeToken: ColorToken,
) {
  node.strokes = [];
  await applyColorTokenToStrokes(node as SceneNode & MinimalStrokesMixin, strokeToken);
  node.strokeWeight = 1.5;
  node.strokeAlign = "OUTSIDE";
}

async function drawMarker(
  parent: FrameNode,
  x: number,
  y: number,
  fillToken: ColorToken,
  seriesIndex: number,
) {
  const marker = await createFrameNode(parent, ".Marker", x - 7, y - 7, 14, 14);

  if (seriesIndex === 1) {
    const shape = await createRect(marker, "Shape", 2.25, 2.25, 9.5, 9.5, fillToken);
    await applyMarkerStroke(shape, chartBackground);
    shape.cornerRadius = 1;
    return;
  }

  if (seriesIndex === 2) {
    const shape = figma.createPolygon();
    shape.name = "Shape";
    shape.pointCount = 3;
    shape.resize(11.5, 10.5);
    shape.x = 1.25;
    shape.y = 1.75;
    await applyColorTokenToFills(shape, fillToken);
    await applyMarkerStroke(shape, chartBackground);
    marker.appendChild(shape);
    return;
  }

  const shape = figma.createEllipse();
  shape.name = "Shape";
  shape.resize(11, 11);
  shape.x = 1.5;
  shape.y = 1.5;
  await applyColorTokenToFills(shape, fillToken);
  await applyMarkerStroke(shape, chartBackground);
  marker.appendChild(shape);
}

async function drawLines(
  parent: FrameNode,
  config: NormalizedLineChartConfig,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const outerName = config.lineMode === "single" ? "Line" : "Frame 1";
  const outerHeight = config.lineMode === "single" ? height : height + 22;
  const outer = await createFrameNode(parent, outerName, x, y, width, outerHeight);
  const lineFrame =
    config.lineMode === "single"
      ? outer
      : await createFrameNode(outer, "Line", 0, 0, width, height);
  const visibleSeries =
    config.lineMode === "single"
      ? config.series.slice(0, 1)
      : config.series.slice(0, 3);

  for (let index = 0; index < visibleSeries.length; index++) {
    const series = visibleSeries[index];
    await createLineVector(
      lineFrame,
      `_Line-${index + 1}`,
      createPathFromValues(
        series.values,
        config.minValue,
        config.maxValue,
        width,
        height,
      ),
      dataVisAt(index),
    );
  }

  const hasSelection = config.selectedIndex >= 0;
  const markerIndex = hasSelection ? config.selectedIndex : config.pointCount - 1;
  const markerRatio =
    config.pointCount <= 1 ? 0 : markerIndex / (config.pointCount - 1);
  const markerX = markerRatio * width;

  if (hasSelection) {
    const labelText =
      config.pointLabels[markerIndex] || `P${markerIndex + 1}`;

    await drawDashedIndicator(
      lineFrame,
      markerX,
      -40,
      height,
      config.color.axisLine,
    );
    await drawSelectedLabel(
      lineFrame,
      labelText,
      markerX,
      height + 4,
      config.color.selected.labelBg,
      config.color.typography.xAxisLabel,
    );
  }

  for (let index = 0; index < visibleSeries.length; index++) {
    const series = visibleSeries[index];
    const value = clamp(
      Number(series.values[markerIndex]) || 0,
      config.minValue,
      config.maxValue,
    );
    const valueRange = Math.max(1, config.maxValue - config.minValue);
    const selectedY =
      clamp(1 - (value - config.minValue) / valueRange, 0, 1) * height;
    await drawMarker(lineFrame, markerX, selectedY, dataVisAt(index), index);
  }
}

async function drawChart(parent: FrameNode, config: NormalizedLineChartConfig) {
  const yTitleRowHeight = config.color.typography.yAxisTitle.lineHeight;
  const contentStackOffset = 24 + yTitleRowHeight;

  const chart = await createFrameNode(
    parent,
    "Chart",
    0,
    0,
    parent.width,
    config.height,
    chartBackground,
  );
  Object.assign(chart, {
    layoutMode: "VERTICAL",
    primaryAxisSizingMode: "FIXED",
    counterAxisSizingMode: "FIXED",
    itemSpacing: numberTokenValue(spacing.gap.s),
    paddingLeft: numberTokenValue(spacing.padding.normal),
    paddingRight: numberTokenValue(spacing.padding.normal),
    paddingTop: 0,
    paddingBottom: numberTokenValue(spacing.padding.normal),
    clipsContent: true,
  });
  await applyHorizontalPadding(chart, spacing.padding.normal);
  await applyPaddingBottom(chart, spacing.padding.normal);
  await applyItemSpacing(chart, spacing.gap.s);
  chart.layoutSizingHorizontal = "FILL";
  chart.layoutSizingVertical = "FILL";

  const titleFrame = await createFrameNode(
    chart,
    "Y-axis title",
    0,
    0,
    parent.width - 32,
    yTitleRowHeight,
    chartBackground,
  );
  Object.assign(titleFrame, {
    layoutMode: "HORIZONTAL",
    primaryAxisSizingMode: "FIXED",
    counterAxisSizingMode: "AUTO",
    itemSpacing: numberTokenValue(spacing.gap.s),
  });
  await applyItemSpacing(titleFrame, spacing.gap.s);
  titleFrame.layoutSizingHorizontal = "FILL";
  await drawCartesianYAxisTitle(titleFrame, {
    color: config.color,
    textColor: textColor.primary,
    yAxisPosition: config.yAxisPosition,
    yAxisTitle: config.yAxisTitle,
  });

  const contentFrame = await createFrameNode(
    chart,
    "Frame 2",
    0,
    0,
    parent.width - 32,
    config.height - contentStackOffset,
  );
  contentFrame.layoutSizingHorizontal = "FILL";
  contentFrame.layoutSizingVertical = "FILL";

  const yAxisPosition = config.yAxisPosition ?? "right";
  const labelGutter = 46;
  const plotX = yAxisPosition === "right" ? 0 : labelGutter;
  const plotY = 9;
  const yAxisWidth = contentFrame.width - labelGutter;
  const xAxisWidth = yAxisWidth - 1;
  const plotHeight = contentFrame.height - 30;
  const lineWidth =
    config.lineRange === "full" ? xAxisWidth : Math.round(yAxisWidth * 0.788);
  const selectedIndicatorX =
    config.selectedIndex >= 0
      ? 16 +
        plotX +
        (config.pointCount <= 1
          ? 0
          : (config.selectedIndex / (config.pointCount - 1)) * lineWidth)
      : null;

  if (yAxisWidth < 180 || plotHeight < 160) {
    throw new Error("Chart size is too small for the selected data.");
  }

  await drawCartesianYAxis(
    contentFrame,
    {
      axisLineVisibility: config.axisLineVisibility,
      color: config.color,
      textColor: textColor.primary,
      ticks: config.yTicks,
      yAxisPosition: config.yAxisPosition,
    },
    plotX,
    plotY,
    yAxisWidth,
    plotHeight,
  );
  await drawCartesianXAxis(
    contentFrame,
    {
      axisLineVisibility: config.axisLineVisibility,
      color: config.color,
      labelYOffset: 4,
      labels: config.xAxisLabels,
      rulerY: plotHeight - 1,
      textColor: textColor.primary,
    },
    plotX,
    plotY,
    xAxisWidth,
    plotHeight,
  );
  await drawLines(contentFrame, config, plotX, plotY, lineWidth, plotHeight);
  return { chart, indicatorX: selectedIndicatorX };
}

export async function drawLineChart(chartData: Partial<LineChartConfig>) {
  const config = normalizeLineChartConfig(
    chartData,
    lineChartConfig as unknown as LineChartConfig,
  );
  await figma.currentPage.loadAsync();
  await loadLineChartFonts(config);
  await loadChartTitleFont();
  await loadCartesianKeyInfoFonts();
  await loadCartesianTooltipFonts();

  const chart = figma.createFrame();
  chart.name = ROOT_NAME;
  chart.resize(config.width, 1);
  chart.clipsContent = false;
  Object.assign(chart, {
    layoutMode: "VERTICAL",
    primaryAxisSizingMode: "AUTO",
    counterAxisSizingMode: "FIXED",
  });
  await applyColorTokenToFills(chart, chartBackground);

  positionChart(chart);
  figma.currentPage.appendChild(chart);
  const title = await createChartTitle(config.chartTitle);
  if (title) {
    chart.appendChild(title);
  }
  const keyInfo = await createCartesianKeyInfo(buildLineKeyInfo(config));
  if (keyInfo) {
    chart.appendChild(keyInfo);
  }
  const drawnChart = await drawChart(chart, config);
  await createCartesianTooltip(
    chart,
    buildLineTooltip(config),
    drawnChart.indicatorX ?? 0,
    drawnChart.chart.y,
  );

  figma.currentPage.selection = [chart];
  figma.viewport.scrollAndZoomIntoView([chart]);
}
