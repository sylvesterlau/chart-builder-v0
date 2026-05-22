import {
  chartBackground,
  dataVisAt,
  lineChartConfig,
  textColor,
} from "../config";
import {
  clamp,
  formatAxisNumber,
  isCartesianXAxisLineVisible,
  isCartesianYAxisLineVisible,
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
  applyTypographyTokenToText,
  loadTypographyTokenFontsBatch,
} from "./applyTypographyToken";

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

async function drawYAxisTitle(
  parent: FrameNode,
  config: NormalizedLineChartConfig,
) {
  const yAxisPosition = config.yAxisPosition ?? "right";
  const yTitle = config.color.typography.yAxisTitle;
  const leftTitle = await createText("", yTitle, textColor.primary);
  leftTitle.name = "Left axis title";
  leftTitle.characters = yAxisPosition === "left" ? config.yAxisTitle : "";
  leftTitle.textAlignHorizontal = "LEFT";
  leftTitle.textAutoResize = "NONE";
  leftTitle.resize(parent.width / 2 - 4, yTitle.lineHeight);
  parent.appendChild(leftTitle);

  const title = await createText(
    yAxisPosition === "right" ? config.yAxisTitle : "",
    yTitle,
    textColor.primary,
  );
  title.name = "Right axis title";
  title.textAlignHorizontal = "RIGHT";
  title.textAutoResize = "NONE";
  title.resize(parent.width / 2 - 4, yTitle.lineHeight);
  parent.appendChild(title);
  title.layoutGrow = 1;
}

async function drawYAxis(
  parent: FrameNode,
  config: NormalizedLineChartConfig,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const axis = await createFrameNode(parent, "Y-axis", x, y, width, height);
  const yAxisPosition = config.yAxisPosition ?? "right";
  const yLabelStyle = config.color.yAxisLabel;
  Object.assign(axis, {
    layoutMode: "VERTICAL",
    primaryAxisSizingMode: "FIXED",
    counterAxisSizingMode: "FIXED",
    primaryAxisAlignItems: "SPACE_BETWEEN",
    counterAxisAlignItems: "MIN",
    itemSpacing: 0,
  });

  for (const tick of config.yTicks) {
    const lineFrame = await createFrameNode(axis, "Y-axis line", 0, 0, width, 1);
    Object.assign(lineFrame, {
      layoutMode: "HORIZONTAL",
      primaryAxisSizingMode: "FIXED",
      counterAxisSizingMode: "AUTO",
      primaryAxisAlignItems: "CENTER",
      counterAxisAlignItems: "CENTER",
      itemSpacing: 0,
    });

    const axisLine = await createLine(
      lineFrame,
      "Axis line",
      0,
      0,
      width,
      config.color.gridLine,
      1,
    );
    axisLine.opacity = isCartesianYAxisLineVisible(config.axisLineVisibility)
      ? 1
      : 0;

    const label = await createText(
      formatAxisNumber(tick),
      yLabelStyle,
      textColor.primary,
    );
    label.name = yAxisPosition === "right" ? "Right label" : "Left label";
    label.textAlignHorizontal = yAxisPosition === "right" ? "LEFT" : "RIGHT";
    lineFrame.appendChild(label);
    label.layoutPositioning = "ABSOLUTE";
    label.x = yAxisPosition === "right" ? width + 8 : -label.width - 8;
    label.y = -8;
  }

  const rulerX = yAxisPosition === "right" ? width - 1 : 0;
  const ruler = await createRect(
    axis,
    "Ruler",
    rulerX,
    -1,
    1,
    height + 1,
    config.color.axisLine,
  );
  ruler.layoutPositioning = "ABSOLUTE";
  ruler.x = rulerX;
  ruler.y = -1;
}

async function drawLineXAxis(
  parent: FrameNode,
  config: NormalizedLineChartConfig,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const axis = await createFrameNode(parent, "X-axis", x, y, width, height);
  Object.assign(axis, {
    layoutMode: "HORIZONTAL",
    primaryAxisSizingMode: "FIXED",
    counterAxisSizingMode: "FIXED",
    primaryAxisAlignItems: "MIN",
    counterAxisAlignItems: "MAX",
    itemSpacing: 0,
  });
  const xLabelStyle = config.color.typography.xAxisLabel;
  const groupWidth = width / config.xAxisLabels.length;

  for (let index = 0; index < config.xAxisLabels.length; index++) {
    const labelText = config.xAxisLabels[index];
    const lineFrame = await createFrameNode(
      axis,
      "X-axis line",
      groupWidth * index,
      0,
      groupWidth,
      height,
    );
    Object.assign(lineFrame, {
      layoutMode: "VERTICAL",
      primaryAxisSizingMode: "FIXED",
      counterAxisSizingMode: "FIXED",
      primaryAxisAlignItems: "MIN",
      counterAxisAlignItems: "CENTER",
      itemSpacing: 0,
    });

    await createRect(
      lineFrame,
      "Axis line",
      groupWidth / 2,
      0,
      1,
      height,
      config.color.gridLine,
      isCartesianXAxisLineVisible(config.axisLineVisibility) ? 1 : 0,
    );

    if (labelText) {
      const label = await createText(labelText, xLabelStyle, textColor.primary);
      label.name = "Axis label";
      label.textAlignHorizontal = "CENTER";
      label.textAutoResize = "WIDTH_AND_HEIGHT";
      lineFrame.appendChild(label);
      label.layoutPositioning = "ABSOLUTE";
      label.x = groupWidth / 2 - label.width / 2;
      label.y = height + 6;
    }
  }

  const ruler = await createRect(
    axis,
    "Ruler",
    0,
    height - 1,
    width,
    1,
    config.color.axisLine,
  );
  ruler.layoutPositioning = "ABSOLUTE";
  ruler.x = 0;
  ruler.y = height - 1;
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
    paddingBottom: 2,
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
  Object.assign(marker, {
    layoutMode: "HORIZONTAL",
    primaryAxisAlignItems: "CENTER",
    counterAxisAlignItems: "CENTER",
  });

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

  if (config.selectedIndex < 0) return;

  const selectedRatio =
    config.pointCount <= 1 ? 0 : config.selectedIndex / (config.pointCount - 1);
  const selectedX = selectedRatio * width;
  const labelText =
    config.pointLabels[config.selectedIndex] || `P${config.selectedIndex + 1}`;

  await drawDashedIndicator(
    lineFrame,
    selectedX,
    -40,
    height,
    config.color.axisLine,
  );
  await drawSelectedLabel(
    lineFrame,
    labelText,
    selectedX,
    height + 4,
    config.color.selected.labelBg,
    config.color.typography.xAxisLabel,
  );

  for (let index = 0; index < visibleSeries.length; index++) {
    const series = visibleSeries[index];
    const value = clamp(
      Number(series.values[config.selectedIndex]) || 0,
      config.minValue,
      config.maxValue,
    );
    const valueRange = Math.max(1, config.maxValue - config.minValue);
    const selectedY =
      clamp(1 - (value - config.minValue) / valueRange, 0, 1) * height;
    await drawMarker(lineFrame, selectedX, selectedY, dataVisAt(index), index);
  }
}

async function drawChart(parent: FrameNode, config: NormalizedLineChartConfig) {
  const yTitleRowHeight = config.color.typography.yAxisTitle.lineHeight;
  const contentStackOffset = 40 + yTitleRowHeight;

  const chart = await createFrameNode(
    parent,
    "Chart",
    0,
    0,
    parent.width,
    parent.height,
    chartBackground,
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
    counterAxisSizingMode: "FIXED",
    itemSpacing: 8,
  });
  titleFrame.layoutSizingHorizontal = "FILL";
  await drawYAxisTitle(titleFrame, config);

  const contentFrame = await createFrameNode(
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

  await drawYAxis(contentFrame, config, plotX, plotY, yAxisWidth, plotHeight);
  await drawLineXAxis(
    contentFrame,
    config,
    plotX,
    plotY,
    xAxisWidth,
    plotHeight,
  );
  await drawLines(contentFrame, config, plotX, plotY, lineWidth, plotHeight);
}

export async function drawLineChart(chartData: Partial<LineChartConfig>) {
  const config = normalizeLineChartConfig(
    chartData,
    lineChartConfig as unknown as LineChartConfig,
  );
  await figma.currentPage.loadAsync();
  await loadLineChartFonts(config);

  const chart = figma.createFrame();
  chart.name = ROOT_NAME;
  chart.resize(config.width, config.height);
  chart.clipsContent = true;
  Object.assign(chart, {
    layoutMode: "VERTICAL",
    primaryAxisSizingMode: "FIXED",
    counterAxisSizingMode: "FIXED",
  });
  await applyColorTokenToFills(chart, chartBackground);

  positionChart(chart);
  figma.currentPage.appendChild(chart);
  await drawChart(chart, config);

  figma.currentPage.selection = [chart];
  figma.viewport.scrollAndZoomIntoView([chart]);
}
