import { chartBackground, lineChartConfig, textColor } from "../config";
import { clamp, normalizeLineChartConfig } from "../helpers";
import {
  LineChartConfig,
  NormalizedLineChartConfig,
  TypographyToken,
} from "../types";
import {
  drawCartesianXAxis,
  drawCartesianYAxis,
  drawCartesianYAxisTitle,
} from "./drawCartesianAxis";

const TEXT_PRIMARY_COLOR = textColor.primary.value;
const TEXT_ON_DARK_COLOR = textColor.onDark.value;
const ROOT_NAME = "_demo/line chart/1";
const FONT_REGULAR: FontName = { family: "Inter", style: "Regular" };
const FONT_BOLD: FontName = { family: "Inter", style: "Bold" };

async function loadLineChartFonts() {
  try {
    await figma.loadFontAsync(FONT_REGULAR);
    await figma.loadFontAsync(FONT_BOLD);
  } catch (err) {
    await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  }
}

function createFrameNode(
  parent: BaseNode & ChildrenMixin,
  name: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fillColor?: string,
): FrameNode {
  const frame = figma.createFrame();
  frame.name = name;
  frame.resize(Math.max(1, width), Math.max(1, height));
  frame.x = x;
  frame.y = y;
  frame.fills = fillColor
    ? [{ type: "SOLID", color: figma.util.rgb(fillColor) }]
    : [];
  frame.clipsContent = false;
  parent.appendChild(frame);
  return frame;
}

function createRect(
  parent: BaseNode & ChildrenMixin,
  name: string,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  opacity?: number,
): RectangleNode {
  const rect = figma.createRectangle();
  rect.name = name;
  rect.resize(Math.max(1, width), Math.max(1, height));
  rect.x = x;
  rect.y = y;
  rect.fills = [{ type: "SOLID", color: figma.util.rgb(color) }];
  if (opacity !== undefined) rect.opacity = opacity;
  parent.appendChild(rect);
  return rect;
}

function createLineVector(
  parent: BaseNode & ChildrenMixin,
  name: string,
  path: string,
  color: string,
): VectorNode {
  const vector = figma.createVector();
  vector.name = name;
  vector.vectorPaths = [{ windingRule: "NONZERO", data: path }];
  vector.fills = [];
  vector.strokes = [{ type: "SOLID", color: figma.util.rgb(color) }];
  vector.strokeWeight = 1.5;
  vector.strokeCap = "ROUND";
  vector.strokeJoin = "ROUND";
  parent.appendChild(vector);
  return vector;
}

function createText(
  characters: string | number,
  style: TypographyToken,
  color: string,
): TextNode {
  const text = figma.createText();
  text.fontName = style.fontWeight >= 600 ? FONT_BOLD : FONT_REGULAR;
  text.fontSize = style.fontSize;
  text.lineHeight = { unit: "PIXELS", value: style.lineHeight };
  text.fills = [{ type: "SOLID", color: figma.util.rgb(color) }];
  text.characters = String(characters);
  text.textAutoResize = "WIDTH_AND_HEIGHT";
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

function drawSelectedLabel(
  parent: FrameNode,
  labelText: string,
  x: number,
  y: number,
  labelBgColor: string,
  labelTextStyle: TypographyToken,
) {
  const labelWidth = Math.max(28, measureLabel(labelText) + 16);
  const labelFrameHeight = Math.max(18, labelTextStyle.lineHeight);
  const labelFrame = createFrameNode(
    parent,
    "Label selected",
    x - labelWidth / 2,
    y,
    labelWidth,
    labelFrameHeight,
    labelBgColor,
  );
  Object.assign(labelFrame, {
    layoutMode: "HORIZONTAL",
    primaryAxisSizingMode: "AUTO",
    counterAxisSizingMode: "AUTO",
    paddingLeft: 8,
    paddingRight: 8,
    paddingBottom: 2,
    counterAxisAlignItems: "CENTER",
  });
  const label = createText(labelText, labelTextStyle, TEXT_ON_DARK_COLOR);
  label.name = "Axis label";
  label.textAlignHorizontal = "CENTER";
  labelFrame.appendChild(label);
}

function drawDashedIndicator(
  parent: FrameNode,
  x: number,
  y1: number,
  y2: number,
  segmentColor: string,
) {
  const top = Math.min(y1, y2);
  const bottom = Math.max(y1, y2);
  const indicator = createFrameNode(
    parent,
    "Indicator line",
    x,
    top,
    1,
    bottom - top,
  );
  for (let y = top; y < bottom; y += 7) {
    createRect(indicator, "Indicator segment", 0, y - top, 1, 4, segmentColor);
  }
}

function drawMarker(
  parent: FrameNode,
  x: number,
  y: number,
  color: string,
  seriesIndex: number,
) {
  const marker = createFrameNode(parent, ".Marker", x - 7, y - 7, 14, 14);
  Object.assign(marker, {
    layoutMode: "HORIZONTAL",
    primaryAxisAlignItems: "CENTER",
    counterAxisAlignItems: "CENTER",
  });
  if (seriesIndex === 1) {
    const shape = createRect(marker, "Shape", 2.25, 2.25, 9.5, 9.5, color);
    shape.strokes = [{ type: "SOLID", color: figma.util.rgb(chartBackground.value) }];
    shape.strokeWeight = 1.5;
    shape.strokeAlign = "OUTSIDE";
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
    shape.fills = [{ type: "SOLID", color: figma.util.rgb(color) }];
    shape.strokes = [{ type: "SOLID", color: figma.util.rgb(chartBackground.value) }];
    shape.strokeWeight = 1.5;
    shape.strokeAlign = "OUTSIDE";
    marker.appendChild(shape);
    return;
  }
  const shape = figma.createEllipse();
  shape.name = "Shape";
  shape.resize(11, 11);
  shape.x = 1.5;
  shape.y = 1.5;
  shape.fills = [{ type: "SOLID", color: figma.util.rgb(color) }];
  shape.strokes = [{ type: "SOLID", color: figma.util.rgb(chartBackground.value) }];
  shape.strokeWeight = 1.5;
  shape.strokeAlign = "OUTSIDE";
  marker.appendChild(shape);
}

function drawLines(
  parent: FrameNode,
  config: NormalizedLineChartConfig,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const outerName = config.lineMode === "single" ? "Line" : "Frame 1";
  const outerHeight = config.lineMode === "single" ? height : height + 22;
  const outer = createFrameNode(parent, outerName, x, y, width, outerHeight);
  const lineFrame =
    config.lineMode === "single"
      ? outer
      : createFrameNode(outer, "Line", 0, 0, width, height);
  const visibleSeries =
    config.lineMode === "single"
      ? config.series.slice(0, 1)
      : config.series.slice(0, 3);

  visibleSeries.forEach((series, index) => {
    createLineVector(
      lineFrame,
      `_Line-${index + 1}`,
      createPathFromValues(
        series.values,
        config.minValue,
        config.maxValue,
        width,
        height,
      ),
      series.color,
    );
  });

  if (config.selectedIndex < 0) return;

  const selectedRatio =
    config.pointCount <= 1 ? 0 : config.selectedIndex / (config.pointCount - 1);
  const selectedX = selectedRatio * width;
  const labelText =
    config.pointLabels[config.selectedIndex] || `P${config.selectedIndex + 1}`;
  drawDashedIndicator(
    lineFrame,
    selectedX,
    -40,
    height,
    config.color.axisLine.value,
  );
  drawSelectedLabel(
    lineFrame,
    labelText,
    selectedX,
    height + 4,
    config.color.selected.labelBg.value,
    config.color.typography.xAxisLabel,
  );

  visibleSeries.forEach((series, index) => {
    const value = clamp(
      Number(series.values[config.selectedIndex]) || 0,
      config.minValue,
      config.maxValue,
    );
    const valueRange = Math.max(1, config.maxValue - config.minValue);
    const selectedY =
      clamp(1 - (value - config.minValue) / valueRange, 0, 1) * height;
    drawMarker(lineFrame, selectedX, selectedY, series.color, index);
  });
}

function drawChart(parent: FrameNode, config: NormalizedLineChartConfig) {
  const yTitleRowHeight = config.color.typography.yAxisTitle.lineHeight;
  const contentStackOffset = 40 + yTitleRowHeight;
  const chart = createFrameNode(
    parent,
    "Chart",
    0,
    0,
    parent.width,
    parent.height,
    chartBackground.value,
  );
  Object.assign(chart, {
    layoutMode: "VERTICAL",
    primaryAxisSizingMode: "FIXED",
    counterAxisSizingMode: "FIXED",
    itemSpacing: 8,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 16,
    paddingBottom: 16,
    clipsContent: true,
  });
  chart.layoutSizingHorizontal = "FILL";
  chart.layoutSizingVertical = "FILL";

  const titleFrame = createFrameNode(
    chart,
    "Y-axis title",
    0,
    0,
    parent.width - 32,
    yTitleRowHeight,
    chartBackground.value,
  );
  Object.assign(titleFrame, {
    layoutMode: "HORIZONTAL",
    primaryAxisSizingMode: "FIXED",
    counterAxisSizingMode: "FIXED",
    itemSpacing: 8,
  });
  titleFrame.layoutSizingHorizontal = "FILL";
  drawCartesianYAxisTitle(titleFrame, {
    color: config.color,
    textColor: TEXT_PRIMARY_COLOR,
    yAxisPosition: config.yAxisPosition,
    yAxisTitle: config.yAxisTitle,
  });

  const contentFrame = createFrameNode(
    chart,
    "Frame 2",
    0,
    0,
    parent.width - 32,
    parent.height - contentStackOffset,
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

  if (yAxisWidth < 180 || plotHeight < 160) {
    throw new Error("Chart size is too small for the selected data.");
  }

  drawCartesianYAxis(
    contentFrame,
    {
      axisLineVisibility: config.axisLineVisibility,
      color: config.color,
      textColor: TEXT_PRIMARY_COLOR,
      ticks: config.yTicks,
      yAxisPosition: config.yAxisPosition,
    },
    plotX,
    plotY,
    yAxisWidth,
    plotHeight,
  );
  drawCartesianXAxis(
    contentFrame,
    {
      axisLineVisibility: config.axisLineVisibility,
      color: config.color,
      labels: config.xAxisLabels,
      labelYOffset: 6,
      rulerY: plotHeight - 1,
      textColor: TEXT_PRIMARY_COLOR,
      titleYOffset: 28,
    },
    plotX,
    plotY,
    xAxisWidth,
    plotHeight,
  );
  drawLines(contentFrame, config, plotX, plotY, lineWidth, plotHeight);
}

export async function drawLineChart(
  chartData: Partial<LineChartConfig>,
) {
  const config = normalizeLineChartConfig(
    chartData,
    lineChartConfig as unknown as LineChartConfig,
  );
  await figma.currentPage.loadAsync();
  await loadLineChartFonts();

  const chart = figma.createFrame();
  chart.name = ROOT_NAME;
  chart.resize(config.width, config.height);
  chart.fills = [{ type: "SOLID", color: figma.util.rgb(chartBackground.value) }];
  chart.clipsContent = true;
  Object.assign(chart, {
    layoutMode: "VERTICAL",
    primaryAxisSizingMode: "FIXED",
    counterAxisSizingMode: "FIXED",
  });

  positionChart(chart);
  figma.currentPage.appendChild(chart);
  drawChart(chart, config);

  figma.currentPage.selection = [chart];
  figma.viewport.scrollAndZoomIntoView([chart]);
}
