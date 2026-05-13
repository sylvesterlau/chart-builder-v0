import { textColor, verticalBarChartConfig } from "../config";
import {
  clamp,
  formatAxisNumber,
  isVerticalBarXAxisLineVisible,
  isVerticalBarYAxisLineVisible,
  normalizeVerticalBarChartConfig,
} from "../helpers";
import {
  NormalizedVerticalBarChartConfig,
  TypographyToken,
  VerticalBarChartConfig,
} from "../types";

const TEXT_PRIMARY_COLOR = textColor.primary.value;
const TEXT_ON_DARK_COLOR = textColor.onDark.value;
const ROOT_NAME = "_demo/bar chart/1";
const FONT_REGULAR: FontName = { family: "Inter", style: "Regular" };
const FONT_BOLD: FontName = { family: "Inter", style: "Bold" };

async function loadVerticalBarFonts() {
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

function createLine(
  parent: BaseNode & ChildrenMixin,
  name: string,
  x: number,
  y: number,
  length: number,
  color: string,
  strokeWeight = 1,
): LineNode {
  const line = figma.createLine();
  line.name = name;
  line.resize(Math.max(1, length), 0);
  line.x = x;
  line.y = y;
  line.strokes = [{ type: "SOLID", color: figma.util.rgb(color) }];
  line.strokeWeight = strokeWeight;
  parent.appendChild(line);
  return line;
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

function drawYAxisTitle(
  parent: FrameNode,
  config: NormalizedVerticalBarChartConfig,
) {
  const yAxisPosition = config.yAxisPosition ?? "right";
  const yTitle = config.color.typography.yAxisTitle;
  const leftTitle = createText("", yTitle, TEXT_PRIMARY_COLOR);
  leftTitle.name = "Left axis title";
  leftTitle.characters = yAxisPosition === "left" ? config.yAxisTitle : "";
  leftTitle.textAlignHorizontal = "LEFT";
  leftTitle.textAutoResize = "NONE";
  leftTitle.resize(parent.width / 2 - 4, yTitle.lineHeight);
  parent.appendChild(leftTitle);

  const title = createText(
    yAxisPosition === "right" ? config.yAxisTitle : "",
    yTitle,
    TEXT_PRIMARY_COLOR,
  );
  title.name = "Right axis title";
  title.textAlignHorizontal = "RIGHT";
  title.textAutoResize = "NONE";
  title.resize(parent.width / 2 - 4, yTitle.lineHeight);
  parent.appendChild(title);
  title.layoutGrow = 1;
}

function drawYAxis(
  parent: FrameNode,
  config: NormalizedVerticalBarChartConfig,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const axis = createFrameNode(parent, "Y-axis", x, y, width, height);
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

  config.yTicks.forEach((tick) => {
    const lineFrame = createFrameNode(axis, "Y-axis line", 0, 0, width, 1);
    Object.assign(lineFrame, {
      layoutMode: "HORIZONTAL",
      primaryAxisSizingMode: "FIXED",
      counterAxisSizingMode: "AUTO",
      primaryAxisAlignItems: "CENTER",
      counterAxisAlignItems: "CENTER",
      itemSpacing: 0,
    });

    const axisLine = createLine(
      lineFrame,
      "Axis line",
      0,
      0,
      width,
      config.color.gridLine.value,
      1,
    );
    axisLine.opacity = isVerticalBarYAxisLineVisible(config.axisLineVisibility)
      ? 1
      : 0;

    const labelText = formatAxisNumber(tick);
    const label = createText(labelText, yLabelStyle, TEXT_PRIMARY_COLOR);
    label.name = yAxisPosition === "right" ? "Right label" : "Left label";
    label.textAlignHorizontal = yAxisPosition === "right" ? "LEFT" : "RIGHT";
    lineFrame.appendChild(label);
    label.layoutPositioning = "ABSOLUTE";
    label.x = yAxisPosition === "right" ? width + 8 : -label.width - 8;
    label.y = -8;
  });

  const rulerX = yAxisPosition === "right" ? width - 1 : 0;
  const ruler = createRect(
    axis,
    "Ruler",
    rulerX,
    -1,
    1,
    height + 1,
    config.color.axisLine.value,
  );
  ruler.layoutPositioning = "ABSOLUTE";
  ruler.x = rulerX;
  ruler.y = -1;
}

function drawXAxis(
  parent: FrameNode,
  config: NormalizedVerticalBarChartConfig,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const axis = createFrameNode(parent, "X-axis", x, y, width, height);
  Object.assign(axis, {
    layoutMode: "HORIZONTAL",
    primaryAxisSizingMode: "FIXED",
    counterAxisSizingMode: "FIXED",
    primaryAxisAlignItems: "MIN",
    counterAxisAlignItems: "MAX",
    itemSpacing: 0,
  });
  const groupWidth = width / config.labels.length;
  const xLabelStyle = config.color.typography.xAxisLabel;
  const xTitleStyle = config.color.typography.xAxisTitle;

  config.labels.forEach((labelText, index) => {
    const lineFrame = createFrameNode(
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

    createRect(
      lineFrame,
      "Axis line",
      groupWidth / 2,
      0,
      1,
      height,
      config.color.gridLine.value,
      isVerticalBarXAxisLineVisible(config.axisLineVisibility) ? 1 : 0,
    );
    const label = createText(labelText, xLabelStyle, TEXT_PRIMARY_COLOR);
    label.name = "Axis label";
    label.textAlignHorizontal = "CENTER";
    label.textAutoResize = "NONE";
    label.resize(groupWidth, xLabelStyle.lineHeight);
    lineFrame.appendChild(label);
    label.layoutPositioning = "ABSOLUTE";
    label.x = 0;
    label.y = height + 4;
  });

  const title = createText(config.xAxisTitle, xTitleStyle, TEXT_PRIMARY_COLOR);
  title.name = "Axis title";
  title.textAlignHorizontal = "CENTER";
  title.textAutoResize = "NONE";
  title.resize(width, xTitleStyle.lineHeight);
  axis.appendChild(title);
  title.layoutPositioning = "ABSOLUTE";
  title.x = 0;
  title.y = height + 28;

  const ruler = createRect(
    axis,
    "Ruler",
    0,
    height - 1,
    width,
    1,
    config.color.axisLine.value,
  );
  ruler.layoutPositioning = "ABSOLUTE";
  ruler.x = 0;
  ruler.y = height - 1;
}

function drawSelectedLabel(
  parent: FrameNode,
  labelText: string,
  groupWidth: number,
  height: number,
  labelBgColor: string,
  labelTextStyle: TypographyToken,
) {
  const labelWidth = Math.max(28, measureLabel(labelText) + 16);
  const labelFrameHeight = Math.max(18, labelTextStyle.lineHeight);
  const labelFrame = createFrameNode(
    parent,
    "Label selected",
    groupWidth / 2 - labelWidth / 2,
    height + 4,
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

function drawBarMark(
  parent: FrameNode,
  name: string,
  color: string,
  x: number,
  width: number,
  height: number,
  barHeight: number,
) {
  const markFrame = createFrameNode(parent, name, x, 0, width, height);
  createRect(
    markFrame,
    "bar-mark",
    0,
    height - barHeight - 1,
    width,
    barHeight,
    color,
  );
}

function drawBars(
  parent: FrameNode,
  config: NormalizedVerticalBarChartConfig,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const barsFrame = createFrameNode(parent, "Frame 1", x, y, width, height);
  Object.assign(barsFrame, {
    layoutMode: "HORIZONTAL",
    primaryAxisSizingMode: "FIXED",
    counterAxisSizingMode: "FIXED",
  });
  const groupWidth = width / config.labels.length;
  const visibleSeries =
    config.barMode === "single"
      ? config.series.slice(0, 1)
      : config.series.slice(0, 2);
  const barWidth =
    visibleSeries.length === 1
      ? clamp(groupWidth * 0.16, 5, 12)
      : clamp(groupWidth * 0.14, 5, 9);
  const gap = visibleSeries.length === 1 ? 0 : Math.max(3, barWidth * 0.75);
  const totalBarWidth =
    visibleSeries.length * barWidth + (visibleSeries.length - 1) * gap;

  config.labels.forEach((label, labelIndex) => {
    const barGroup = createFrameNode(
      barsFrame,
      "Bar",
      groupWidth * labelIndex,
      0,
      groupWidth,
      height,
    );

    const centerX = groupWidth / 2;
    if (labelIndex === config.selectedIndex) {
      const { labelBg, highlightBg } = config.color.selected;
      drawSelectedLabel(
        barGroup,
        label,
        groupWidth,
        height,
        labelBg.value,
        config.color.typography.xAxisLabel,
      );
      drawDashedIndicator(
        barGroup,
        centerX,
        0,
        -40,
        config.color.axisLine.value,
      );
      createRect(
        barGroup,
        "Highlighted BG",
        0,
        0,
        groupWidth,
        height,
        highlightBg.value,
        highlightBg.opacity ?? 0.08,
      );
    }

    visibleSeries.forEach((series, seriesIndex) => {
      const rawValue = Number(series.values[labelIndex]) || 0;
      const value = clamp(rawValue, 0, config.maxValue);
      const barHeight = Math.max(1, (value / config.maxValue) * height);
      const barX = centerX - totalBarWidth / 2 + seriesIndex * (barWidth + gap);
      drawBarMark(
        barGroup,
        seriesIndex === 0 ? "Bar-mark-1" : "Bar-mark-2",
        series.color,
        barX,
        barWidth,
        height,
        barHeight,
      );
    });
  });
}

function drawBarChart(
  parent: FrameNode,
  config: NormalizedVerticalBarChartConfig,
) {
  const yTitleRowHeight = config.color.typography.yAxisTitle.lineHeight;
  const contentStackOffset = 40 + yTitleRowHeight;

  const chart = createFrameNode(
    parent,
    "Chart",
    0,
    0,
    parent.width,
    parent.height,
    "#FFFFFF",
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
    "#FFFFFF",
  );
  Object.assign(titleFrame, {
    layoutMode: "HORIZONTAL",
    primaryAxisSizingMode: "FIXED",
    counterAxisSizingMode: "FIXED",
    itemSpacing: 8,
  });
  titleFrame.layoutSizingHorizontal = "FILL";
  drawYAxisTitle(titleFrame, config);

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
  const plotWidth = contentFrame.width - labelGutter;
  const plotHeight = contentFrame.height - 54;

  if (plotWidth < 180 || plotHeight < 120) {
    throw new Error("Chart size is too small for the selected data.");
  }

  drawYAxis(contentFrame, config, plotX, plotY, plotWidth, plotHeight);
  drawXAxis(contentFrame, config, plotX, plotY, plotWidth, plotHeight);
  drawBars(contentFrame, config, plotX, plotY, plotWidth, plotHeight);
}

export async function drawVerticalBarChart(
  chartData: Partial<VerticalBarChartConfig>,
) {
  const config = normalizeVerticalBarChartConfig(
    chartData,
    verticalBarChartConfig as unknown as VerticalBarChartConfig,
  );
  await figma.currentPage.loadAsync();
  await loadVerticalBarFonts();

  const chart = figma.createFrame();
  chart.name = ROOT_NAME;
  chart.resize(config.width, config.height);
  chart.fills = [{ type: "SOLID", color: figma.util.rgb("#FFFFFF") }];
  chart.clipsContent = true;
  Object.assign(chart, {
    layoutMode: "VERTICAL",
    primaryAxisSizingMode: "FIXED",
    counterAxisSizingMode: "FIXED",
  });

  positionChart(chart);
  figma.currentPage.appendChild(chart);
  drawBarChart(chart, config);

  figma.currentPage.selection = [chart];
  figma.viewport.scrollAndZoomIntoView([chart]);
}
