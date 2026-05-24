import { cartesianTooltipConfig, dataVisAt, textColor } from "../config";
import type { ColorToken, TypographyToken } from "../types";
import { applyColorTokenToFills, applyColorTokenToStrokes } from "./applyColorToken";
import {
  applyTypographyTokenToText,
  loadTypographyTokenFontsBatch,
} from "./applyTypographyToken";
import type { CartesianTooltipData } from "./cartesianTooltip";

const tooltipTextColor = textColor.primary;

export async function loadCartesianTooltipFonts() {
  const ty = cartesianTooltipConfig.typography;
  await loadTypographyTokenFontsBatch([ty.title, ty.label, ty.value]);
}

async function createText(
  characters: string,
  style: TypographyToken,
  token: ColorToken,
): Promise<TextNode> {
  const text = figma.createText();
  await applyTypographyTokenToText(text, style);
  text.characters = characters;
  text.textAutoResize = "WIDTH_AND_HEIGHT";
  await applyColorTokenToFills(text, token);
  return text;
}

async function createFrame(name: string): Promise<FrameNode> {
  const frame = figma.createFrame();
  frame.name = name;
  frame.fills = [];
  frame.clipsContent = false;
  return frame;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

async function createSwatch(colorTokenIndex: number): Promise<FrameNode> {
  const visual = await createFrame("Visual");
  visual.resize(18, 20);
  Object.assign(visual, {
    layoutMode: "HORIZONTAL",
    primaryAxisAlignItems: "CENTER",
    counterAxisAlignItems: "CENTER",
  });

  const shape = figma.createRectangle();
  shape.name = "Shape";
  shape.resize(14, 14);
  await applyColorTokenToFills(shape, dataVisAt(colorTokenIndex));
  visual.appendChild(shape);
  return visual;
}

async function createTooltipRow(
  item: CartesianTooltipData["items"][number],
  width: number,
): Promise<FrameNode> {
  const row = await createFrame("Text line");
  row.resize(width, 20);
  Object.assign(row, {
    layoutMode: "HORIZONTAL",
    primaryAxisSizingMode: "FIXED",
    counterAxisSizingMode: "AUTO",
    itemSpacing: cartesianTooltipConfig.spacing.itemGap.value,
    layoutAlign: "STRETCH",
  });

  const main = await createFrame("Main");
  main.resize(180, 20);
  Object.assign(main, {
    layoutMode: "HORIZONTAL",
    primaryAxisSizingMode: "AUTO",
    counterAxisSizingMode: "AUTO",
    itemSpacing: cartesianTooltipConfig.spacing.itemGap.value,
    layoutGrow: 1,
  });
  main.appendChild(await createSwatch(item.colorTokenIndex));

  const label = await createText(
    item.label,
    cartesianTooltipConfig.typography.label,
    tooltipTextColor,
  );
  label.layoutGrow = 1;
  main.appendChild(label);
  row.appendChild(main);

  const value = await createText(
    item.value,
    cartesianTooltipConfig.typography.value,
    tooltipTextColor,
  );
  value.textAlignHorizontal = "RIGHT";
  row.appendChild(value);
  return row;
}

async function createPointerWithWidth(
  pointerLeft: number,
  width: number,
): Promise<FrameNode> {
  const pointerFrame = await createFrame("Pointer");
  pointerFrame.resize(
    width,
    cartesianTooltipConfig.pointerHeight +
      cartesianTooltipConfig.spacing.pointerBottomPadding.value,
  );
  pointerFrame.clipsContent = true;

  const pointer = figma.createVector();
  pointer.name = "Pointer";
  pointer.vectorPaths = [
    {
      windingRule: "NONE",
      data: `M ${cartesianTooltipConfig.pointerWidth / 2} ${cartesianTooltipConfig.pointerHeight} L 0 0 L ${cartesianTooltipConfig.pointerWidth} 0 L ${cartesianTooltipConfig.pointerWidth / 2} ${cartesianTooltipConfig.pointerHeight} Z`,
    },
  ];
  pointer.x = pointerLeft;
  pointer.y = 0;
  await applyColorTokenToFills(pointer, cartesianTooltipConfig.color.panel);
  await applyColorTokenToStrokes(pointer, cartesianTooltipConfig.color.border);
  pointer.strokeWeight = 1;
  pointer.strokeAlign = "OUTSIDE";
  pointerFrame.appendChild(pointer);
  return pointerFrame;
}

export async function createCartesianTooltip(
  parent: FrameNode,
  data: CartesianTooltipData | null,
  anchorX: number,
  chartTop: number,
): Promise<FrameNode | null> {
  if (!data || data.items.length === 0) {
    return null;
  }

  const outerPadding = cartesianTooltipConfig.spacing.outerPadding.value;
  const contentWidth = Math.max(1, parent.width - outerPadding * 2);
  const panelContentWidth = Math.max(
    1,
    contentWidth - cartesianTooltipConfig.spacing.panelPadding.value * 2,
  );
  const pointerLeft = clamp(
    anchorX - outerPadding - cartesianTooltipConfig.pointerWidth / 2,
    0,
    contentWidth -
      cartesianTooltipConfig.spacing.pointerInsetEnd.value -
      cartesianTooltipConfig.pointerWidth,
  );
  const tooltip = await createFrame("Tooltip");
  tooltip.resize(parent.width, 1);
  Object.assign(tooltip, {
    layoutMode: "VERTICAL",
    primaryAxisSizingMode: "AUTO",
    counterAxisSizingMode: "FIXED",
    paddingLeft: outerPadding,
    paddingRight: outerPadding,
    paddingTop: outerPadding,
  });

  const content = await createFrame("Data-vis tooltip");
  content.resize(contentWidth, 1);
  Object.assign(content, {
    layoutMode: "VERTICAL",
    primaryAxisSizingMode: "AUTO",
    counterAxisSizingMode: "FIXED",
  });
  content.effects = [
    {
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: 0.2 },
      offset: { x: 0, y: 2 },
      radius: 4,
      spread: 0,
      visible: true,
      blendMode: "NORMAL",
    },
  ];

  const panel = await createFrame("Panel");
  panel.resize(contentWidth, 1);
  Object.assign(panel, {
    layoutMode: "VERTICAL",
    primaryAxisSizingMode: "AUTO",
    counterAxisSizingMode: "FIXED",
    paddingLeft: cartesianTooltipConfig.spacing.panelPadding.value,
    paddingRight: cartesianTooltipConfig.spacing.panelPadding.value,
    paddingTop: cartesianTooltipConfig.spacing.panelPadding.value,
    paddingBottom: cartesianTooltipConfig.spacing.panelPadding.value,
    itemSpacing: cartesianTooltipConfig.spacing.itemGap.value,
    layoutAlign: "STRETCH",
  });
  await applyColorTokenToFills(panel, cartesianTooltipConfig.color.panel);
  await applyColorTokenToStrokes(panel, cartesianTooltipConfig.color.border);
  panel.strokeWeight = 1;
  panel.strokeAlign = "OUTSIDE";

  const title = await createText(
    data.title,
    cartesianTooltipConfig.typography.title,
    tooltipTextColor,
  );
  title.name = "Title";
  title.textAutoResize = "NONE";
  title.resize(panelContentWidth, cartesianTooltipConfig.typography.title.lineHeight);
  title.textAutoResize = "HEIGHT";
  panel.appendChild(title);

  for (const item of data.items) {
    const row = await createTooltipRow(item, panelContentWidth);
    panel.appendChild(row);
    row.layoutSizingHorizontal = "FILL";
  }

  content.appendChild(panel);
  panel.layoutSizingHorizontal = "FILL";
  const pointer = await createPointerWithWidth(pointerLeft, contentWidth);
  content.appendChild(pointer);
  pointer.layoutSizingHorizontal = "FILL";
  tooltip.appendChild(content);
  content.layoutSizingHorizontal = "FILL";
  parent.appendChild(tooltip);

  tooltip.layoutPositioning = "ABSOLUTE";
  tooltip.x = 0;
  tooltip.y = Math.max(0, chartTop - tooltip.height);
  return tooltip;
}
