import {
  formatAxisNumber,
  formatAxisTickLabel,
  isCartesianXAxisLineVisible,
  isCartesianYAxisLineVisible,
  Y_AXIS_LABEL_AXIS_GAP,
} from "../helpers";
import type {
  CartesianAxisLineVisibility,
  CartesianChartColorConfig,
  CartesianYAxisPosition,
  ColorToken,
  TypographyToken,
  YAxisDataType,
} from "../types";
import { applyColorTokenToFills, applyColorTokenToStrokes } from "./applyColorToken";
import { applyTypographyTokenToText } from "./applyTypographyToken";

type ParentNode = BaseNode & ChildrenMixin;

async function createCartesianFrameNode(
  parent: ParentNode,
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

async function createCartesianRect(
  parent: ParentNode,
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

async function createCartesianLine(
  parent: ParentNode,
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

async function createCartesianText(
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

function setFixedWidthAutoHeight(
  node: TextNode,
  width: number,
  minHeight: number,
) {
  node.textAutoResize = "NONE";
  node.resize(Math.max(1, width), Math.max(1, minHeight));
  node.textAutoResize = "HEIGHT";
}

function measureAxisLabelWidth(value: string): number {
  return Math.max(1, String(value || "").length * 7);
}

export interface CartesianAxisTitleOptions {
  color: CartesianChartColorConfig;
  textColor: ColorToken;
  yAxisPosition?: CartesianYAxisPosition;
  yAxisTitle: string;
}

export async function drawCartesianYAxisTitle(
  parent: FrameNode,
  options: CartesianAxisTitleOptions,
) {
  const yAxisPosition = options.yAxisPosition ?? "right";
  const yTitle = options.color.typography.yAxisTitle;
  const leftTitle = await createCartesianText("", yTitle, options.textColor);
  leftTitle.name = "Left axis title";
  leftTitle.characters = yAxisPosition === "left" ? options.yAxisTitle : "";
  leftTitle.textAlignHorizontal = "LEFT";
  setFixedWidthAutoHeight(leftTitle, parent.width / 2 - 4, yTitle.lineHeight);
  parent.appendChild(leftTitle);

  const title = await createCartesianText(
    yAxisPosition === "right" ? options.yAxisTitle : "",
    yTitle,
    options.textColor,
  );
  title.name = "Right axis title";
  title.textAlignHorizontal = "RIGHT";
  setFixedWidthAutoHeight(title, parent.width / 2 - 4, yTitle.lineHeight);
  parent.appendChild(title);
  title.layoutGrow = 1;
}

export interface CartesianYAxisOptions {
  axisLineVisibility?: CartesianAxisLineVisibility;
  color: CartesianChartColorConfig;
  textColor: ColorToken;
  ticks: number[];
  yAxisDataType?: YAxisDataType;
  yAxisPosition?: CartesianYAxisPosition;
}

export async function drawCartesianYAxis(
  parent: FrameNode,
  options: CartesianYAxisOptions,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const axis = await createCartesianFrameNode(parent, "Y-axis", x, y, width, height);
  const yAxisPosition = options.yAxisPosition ?? "right";
  const yLabelStyle = options.color.yAxisLabel;
  const yAxisDataType = options.yAxisDataType ?? "number";
  Object.assign(axis, {
    layoutMode: "VERTICAL",
    primaryAxisSizingMode: "FIXED",
    counterAxisSizingMode: "FIXED",
    primaryAxisAlignItems: "SPACE_BETWEEN",
    counterAxisAlignItems: "MIN",
    itemSpacing: 0,
  });

  for (const tick of options.ticks) {
    const lineFrame = await createCartesianFrameNode(axis, "Y-axis line", 0, 0, width, 1);
    Object.assign(lineFrame, {
      layoutMode: "HORIZONTAL",
      primaryAxisSizingMode: "FIXED",
      counterAxisSizingMode: "AUTO",
      primaryAxisAlignItems: "CENTER",
      counterAxisAlignItems: "CENTER",
      itemSpacing: 0,
    });

    const axisLine = await createCartesianLine(
      lineFrame,
      "Axis line",
      0,
      0,
      width,
      options.color.gridLine,
      1,
    );
    axisLine.opacity = isCartesianYAxisLineVisible(options.axisLineVisibility)
      ? 1
      : 0;

    const label = await createCartesianText(
      formatAxisTickLabel(tick, yAxisDataType),
      yLabelStyle,
      options.textColor,
    );
    label.name = yAxisPosition === "right" ? "Right label" : "Left label";
    label.textAlignHorizontal = yAxisPosition === "right" ? "LEFT" : "RIGHT";
    lineFrame.appendChild(label);
    label.layoutPositioning = "ABSOLUTE";
    label.x = yAxisPosition === "right" ? width + Y_AXIS_LABEL_AXIS_GAP : -label.width - Y_AXIS_LABEL_AXIS_GAP;
    label.y = -8;
  }

  const rulerX = yAxisPosition === "right" ? width - 1 : 0;
  const ruler = await createCartesianRect(
    axis,
    "Ruler",
    rulerX,
    -1,
    1,
    height + 1,
    options.color.axisLine,
  );
  ruler.layoutPositioning = "ABSOLUTE";
  ruler.x = rulerX;
  ruler.y = -1;
}

export async function measureYAxisLabelGutterFigma(
  ticks: number[],
  yAxisDataType: YAxisDataType,
  yLabelStyle: TypographyToken,
  textColor: ColorToken,
): Promise<number> {
  if (ticks.length === 0) {
    return Y_AXIS_LABEL_AXIS_GAP;
  }
  let maxWidth = 0;
  for (const tick of ticks) {
    const text = await createCartesianText(
      formatAxisTickLabel(tick, yAxisDataType),
      yLabelStyle,
      textColor,
    );
    maxWidth = Math.max(maxWidth, text.width);
    text.remove();
  }
  return maxWidth + Y_AXIS_LABEL_AXIS_GAP;
}

export interface CartesianXAxisOptions {
  axisLineVisibility?: CartesianAxisLineVisibility;
  color: CartesianChartColorConfig;
  labels: string[];
  labelYOffset: number;
  rulerY: number;
  textColor: ColorToken;
  titleText?: string;
  titleYOffset?: number;
}

export async function drawCartesianXAxis(
  parent: FrameNode,
  options: CartesianXAxisOptions,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const axis = await createCartesianFrameNode(parent, "X-axis", x, y, width, height);
  Object.assign(axis, {
    layoutMode: "HORIZONTAL",
    primaryAxisSizingMode: "FIXED",
    counterAxisSizingMode: "FIXED",
    primaryAxisAlignItems: "MIN",
    counterAxisAlignItems: "MAX",
    itemSpacing: 0,
  });
  const groupWidth = width / options.labels.length;
  const xLabelStyle = options.color.typography.xAxisLabel;
  const xTitleStyle = options.color.typography.xAxisTitle;

  for (let index = 0; index < options.labels.length; index++) {
    const labelText = options.labels[index];
    const lineFrame = await createCartesianFrameNode(
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

    await createCartesianRect(
      lineFrame,
      "Axis line",
      groupWidth / 2,
      0,
      1,
      height,
      options.color.gridLine,
      isCartesianXAxisLineVisible(options.axisLineVisibility) ? 1 : 0,
    );

    if (labelText) {
      const label = await createCartesianText(labelText, xLabelStyle, options.textColor);
      const labelWidth = Math.max(groupWidth, measureAxisLabelWidth(labelText));
      label.name = "Axis label";
      label.textAlignHorizontal = "CENTER";
      setFixedWidthAutoHeight(label, labelWidth, xLabelStyle.lineHeight);
      lineFrame.appendChild(label);
      label.layoutPositioning = "ABSOLUTE";
      label.x = groupWidth / 2 - labelWidth / 2;
      label.y = height + options.labelYOffset;
    }
  }

  if (options.titleText !== undefined) {
    const title = await createCartesianText(
      options.titleText,
      xTitleStyle,
      options.textColor,
    );
    title.name = "Axis title";
    title.textAlignHorizontal = "CENTER";
    setFixedWidthAutoHeight(title, width, xTitleStyle.lineHeight);
    title.visible = Boolean(options.titleText);
    axis.appendChild(title);
    title.layoutPositioning = "ABSOLUTE";
    title.x = 0;
    title.y = height + (options.titleYOffset ?? 28);
  }

  const ruler = await createCartesianRect(
    axis,
    "Ruler",
    0,
    options.rulerY,
    width,
    1,
    options.color.axisLine,
  );
  ruler.layoutPositioning = "ABSOLUTE";
  ruler.x = 0;
  ruler.y = options.rulerY;
}
