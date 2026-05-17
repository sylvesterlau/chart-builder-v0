import {
  formatAxisNumber,
  isCartesianXAxisLineVisible,
  isCartesianYAxisLineVisible,
} from "../helpers";
import {
  CartesianAxisLineVisibility,
  CartesianChartColorConfig,
  CartesianYAxisPosition,
  TypographyToken,
} from "../types";

export const CARTESIAN_FONT_REGULAR: FontName = {
  family: "Inter",
  style: "Regular",
};
export const CARTESIAN_FONT_BOLD: FontName = {
  family: "Inter",
  style: "Bold",
};

export function createCartesianFrameNode(
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

export function createCartesianRect(
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

export function createCartesianText(
  characters: string | number,
  style: TypographyToken,
  color: string,
): TextNode {
  const text = figma.createText();
  text.fontName =
    style.fontWeight >= 600 ? CARTESIAN_FONT_BOLD : CARTESIAN_FONT_REGULAR;
  text.fontSize = style.fontSize;
  text.lineHeight = { unit: "PIXELS", value: style.lineHeight };
  text.fills = [{ type: "SOLID", color: figma.util.rgb(color) }];
  text.characters = String(characters);
  text.textAutoResize = "WIDTH_AND_HEIGHT";
  return text;
}

export interface CartesianAxisTitleOptions {
  color: CartesianChartColorConfig;
  textColor: string;
  yAxisPosition?: CartesianYAxisPosition;
  yAxisTitle: string;
}

export function drawCartesianYAxisTitle(
  parent: FrameNode,
  options: CartesianAxisTitleOptions,
) {
  const yAxisPosition = options.yAxisPosition ?? "right";
  const yTitle = options.color.typography.yAxisTitle;
  const leftTitle = createCartesianText("", yTitle, options.textColor);
  leftTitle.name = "Left axis title";
  leftTitle.characters = yAxisPosition === "left" ? options.yAxisTitle : "";
  leftTitle.textAlignHorizontal = "LEFT";
  leftTitle.textAutoResize = "NONE";
  leftTitle.resize(parent.width / 2 - 4, yTitle.lineHeight);
  parent.appendChild(leftTitle);

  const title = createCartesianText(
    yAxisPosition === "right" ? options.yAxisTitle : "",
    yTitle,
    options.textColor,
  );
  title.name = "Right axis title";
  title.textAlignHorizontal = "RIGHT";
  title.textAutoResize = "NONE";
  title.resize(parent.width / 2 - 4, yTitle.lineHeight);
  parent.appendChild(title);
  title.layoutGrow = 1;
}

export interface CartesianYAxisOptions {
  axisLineVisibility?: CartesianAxisLineVisibility;
  color: CartesianChartColorConfig;
  textColor: string;
  ticks: number[];
  yAxisPosition?: CartesianYAxisPosition;
}

export function drawCartesianYAxis(
  parent: FrameNode,
  options: CartesianYAxisOptions,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const axis = createCartesianFrameNode(parent, "Y-axis", x, y, width, height);
  const yAxisPosition = options.yAxisPosition ?? "right";
  const yLabelStyle = options.color.yAxisLabel;
  Object.assign(axis, {
    layoutMode: "VERTICAL",
    primaryAxisSizingMode: "FIXED",
    counterAxisSizingMode: "FIXED",
    primaryAxisAlignItems: "SPACE_BETWEEN",
    counterAxisAlignItems: "MIN",
    itemSpacing: 0,
  });

  options.ticks.forEach((tick) => {
    const lineFrame = createCartesianFrameNode(
      axis,
      "Y-axis line",
      0,
      0,
      width,
      1,
    );
    Object.assign(lineFrame, {
      layoutMode: "HORIZONTAL",
      primaryAxisSizingMode: "FIXED",
      counterAxisSizingMode: "AUTO",
      primaryAxisAlignItems: "CENTER",
      counterAxisAlignItems: "CENTER",
      itemSpacing: 0,
    });

    const axisLine = createCartesianRect(
      lineFrame,
      "Axis line",
      0,
      0,
      width,
      1,
      options.color.gridLine.value,
      isCartesianYAxisLineVisible(options.axisLineVisibility) ? 1 : 0,
    );
    axisLine.layoutGrow = 1;

    const label = createCartesianText(
      formatAxisNumber(tick),
      yLabelStyle,
      options.textColor,
    );
    label.name = yAxisPosition === "right" ? "Right label" : "Left label";
    label.textAlignHorizontal = yAxisPosition === "right" ? "LEFT" : "RIGHT";
    lineFrame.appendChild(label);
    label.layoutPositioning = "ABSOLUTE";
    label.x = yAxisPosition === "right" ? width + 8 : -label.width - 8;
    label.y = -8;
  });

  const rulerX = yAxisPosition === "right" ? width - 1 : 0;
  const ruler = createCartesianRect(
    axis,
    "Ruler",
    rulerX,
    -1,
    1,
    height + 1,
    options.color.axisLine.value,
  );
  ruler.layoutPositioning = "ABSOLUTE";
  ruler.x = rulerX;
  ruler.y = -1;
}

export interface CartesianXAxisOptions {
  axisLineVisibility?: CartesianAxisLineVisibility;
  color: CartesianChartColorConfig;
  labels: string[];
  labelYOffset: number;
  rulerY: number;
  textColor: string;
  titleText?: string;
  titleYOffset?: number;
}

export function drawCartesianXAxis(
  parent: FrameNode,
  options: CartesianXAxisOptions,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const axis = createCartesianFrameNode(parent, "X-axis", x, y, width, height);
  Object.assign(axis, {
    layoutMode: "HORIZONTAL",
    primaryAxisSizingMode: "FIXED",
    counterAxisSizingMode: "FIXED",
    primaryAxisAlignItems: "MIN",
    counterAxisAlignItems: "MAX",
    itemSpacing: 0,
  });
  const xLabelStyle = options.color.typography.xAxisLabel;
  const xTitleStyle = options.color.typography.xAxisTitle;
  const groupWidth = width / options.labels.length;

  options.labels.forEach((labelText, index) => {
    const lineFrame = createCartesianFrameNode(
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

    createCartesianRect(
      lineFrame,
      "Axis line",
      groupWidth / 2,
      0,
      1,
      height,
      options.color.gridLine.value,
      isCartesianXAxisLineVisible(options.axisLineVisibility) ? 1 : 0,
    );
    const label = createCartesianText(labelText, xLabelStyle, options.textColor);
    label.name = "Axis label";
    label.textAlignHorizontal = "CENTER";
    label.textAutoResize = "WIDTH_AND_HEIGHT";
    lineFrame.appendChild(label);
    label.layoutPositioning = "ABSOLUTE";
    label.x = groupWidth / 2 - label.width / 2;
    label.y = height + options.labelYOffset;
  });

  const title = createCartesianText(
    options.titleText ?? "",
    xTitleStyle,
    options.textColor,
  );
  title.name = "Axis title";
  title.textAlignHorizontal = "CENTER";
  title.textAutoResize = "NONE";
  title.resize(width, xTitleStyle.lineHeight);
  title.visible = Boolean(options.titleText);
  axis.appendChild(title);
  title.layoutPositioning = "ABSOLUTE";
  title.x = 0;
  title.y = height + (options.titleYOffset ?? 28);

  const ruler = createCartesianRect(
    axis,
    "Ruler",
    0,
    options.rulerY,
    width,
    1,
    options.color.axisLine.value,
  );
  ruler.layoutPositioning = "ABSOLUTE";
  ruler.x = 0;
  ruler.y = options.rulerY;
}
