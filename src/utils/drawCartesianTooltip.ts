import {
  cartesianTooltipConfig,
  legendIndicatorConfig,
  textColor,
} from "../config";
import { dataVisAt } from "./dataVisAt";
import type { ColorToken, TypographyToken } from "../types";
import {
  applyHeight,
  applyHorizontalPadding,
  applyItemSpacing,
  applyPaddingTop,
  applyVerticalPadding,
  applyWidth,
  numberTokenValue,
} from "./applyNumberToken";
import {
  applyColorTokenToFills,
  applyColorTokenToStrokes,
} from "./applyColorToken";
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

async function createLineSwatch(colorTokenIndex: number): Promise<FrameNode> {
  const visual = await createFrame(".Legend indicator");
  await applyWidth(visual, legendIndicatorConfig.size);
  await applyHeight(visual, legendIndicatorConfig.size);
  const indicatorSize = numberTokenValue(legendIndicatorConfig.size);

  const line = figma.createRectangle();
  line.name = "Line";
  line.resize(indicatorSize, 2);
  line.x = 0;
  line.y = (indicatorSize - line.height) / 2;
  await applyColorTokenToFills(line, dataVisAt(colorTokenIndex));
  visual.appendChild(line);

  const shape =
    colorTokenIndex === 2
      ? figma.createPolygon()
      : colorTokenIndex === 1
        ? figma.createRectangle()
        : figma.createEllipse();
  shape.name = "Shape";
  if (shape.type === "POLYGON") {
    shape.pointCount = 3;
    shape.resize(11.5, 10.5);
  } else {
    shape.resize(
      colorTokenIndex === 1 ? 9.5 : 11,
      colorTokenIndex === 1 ? 9.5 : 11,
    );
  }
  shape.x = (indicatorSize - shape.width) / 2;
  shape.y = (indicatorSize - shape.height) / 2;
  await applyColorTokenToFills(shape, dataVisAt(colorTokenIndex));
  await applyColorTokenToStrokes(shape, cartesianTooltipConfig.color.panel);
  shape.strokeWeight = 1.5;
  shape.strokeAlign = "OUTSIDE";
  visual.appendChild(shape);

  return visual;
}

async function createSwatch(
  kind: CartesianTooltipData["kind"],
  colorTokenIndex: number,
): Promise<FrameNode> {
  const visual = await createFrame("Visual");
  visual.resize(18, 20);
  Object.assign(visual, {
    layoutMode: "HORIZONTAL",
    primaryAxisAlignItems: "CENTER",
    counterAxisAlignItems: "CENTER",
  });

  if (kind === "line") {
    visual.appendChild(await createLineSwatch(colorTokenIndex));
  } else {
    const shape = figma.createRectangle();
    shape.name = "Shape";
    shape.resize(14, 14);
    await applyColorTokenToFills(shape, dataVisAt(colorTokenIndex));
    visual.appendChild(shape);
  }
  return visual;
}

async function createTooltipRow(
  item: CartesianTooltipData["items"][number],
  width: number,
  kind: CartesianTooltipData["kind"],
  horizontal = false,
): Promise<FrameNode> {
  const row = await createFrame("Text line");
  row.resize(width, 20);
  Object.assign(row, {
    layoutMode: "HORIZONTAL",
    primaryAxisSizingMode: "FIXED",
    counterAxisSizingMode: "AUTO",
    itemSpacing: numberTokenValue(cartesianTooltipConfig.spacing.itemGap),
    layoutAlign: "STRETCH",
  });

  const main = await createFrame("Main");
  main.resize(180, 20);
  Object.assign(main, {
    layoutMode: "HORIZONTAL",
    primaryAxisSizingMode: "AUTO",
    counterAxisSizingMode: "AUTO",
    itemSpacing: numberTokenValue(cartesianTooltipConfig.spacing.itemGap),
    layoutGrow: 1,
  });
  main.appendChild(await createSwatch(kind, item.colorTokenIndex));

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
  if (horizontal) {
    // Switching axes also changes what the sizing modes control. Hug the
    // vertical stack instead of retaining the old fixed 20px primary axis.
    row.layoutMode = "VERTICAL";
    row.primaryAxisSizingMode = "AUTO";
    row.counterAxisSizingMode = "FIXED";
    main.layoutGrow = 0;
    main.layoutSizingHorizontal = "FILL";
    main.layoutSizingVertical = "HUG";
    value.textAlignHorizontal = "LEFT";
  }
  await applyItemSpacing(row, cartesianTooltipConfig.spacing.itemGap);
  await applyItemSpacing(main, cartesianTooltipConfig.spacing.itemGap);
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

  const { outerPadding, panelPadding, itemGap, pointerInsetEnd } =
    cartesianTooltipConfig.spacing;
  const outerPaddingPx = numberTokenValue(outerPadding);
  const panelPaddingPx = numberTokenValue(panelPadding);
  const pointerInsetEndPx = numberTokenValue(pointerInsetEnd);
  const contentWidth = Math.max(1, parent.width - outerPaddingPx * 2);
  const panelContentWidth = Math.max(1, contentWidth - panelPaddingPx * 2);
  const pointerLeft = clamp(
    anchorX - outerPaddingPx - cartesianTooltipConfig.pointerWidth / 2,
    0,
    contentWidth - pointerInsetEndPx - cartesianTooltipConfig.pointerWidth,
  );
  const tooltip = await createFrame("Tooltip");
  tooltip.resize(parent.width, 1);
  Object.assign(tooltip, {
    layoutMode: "VERTICAL",
    primaryAxisSizingMode: "AUTO",
    counterAxisSizingMode: "FIXED",
    paddingLeft: outerPaddingPx,
    paddingRight: outerPaddingPx,
    paddingTop: outerPaddingPx,
  });
  await applyHorizontalPadding(tooltip, outerPadding);
  await applyPaddingTop(tooltip, outerPadding);

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
    paddingLeft: panelPaddingPx,
    paddingRight: panelPaddingPx,
    paddingTop: panelPaddingPx,
    paddingBottom: panelPaddingPx,
    itemSpacing: numberTokenValue(itemGap),
    layoutAlign: "STRETCH",
  });
  await applyHorizontalPadding(panel, panelPadding);
  await applyVerticalPadding(panel, panelPadding);
  await applyItemSpacing(panel, itemGap);
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
  title.resize(
    panelContentWidth,
    cartesianTooltipConfig.typography.title.lineHeight,
  );
  title.textAutoResize = "HEIGHT";
  panel.appendChild(title);

  const horizontal=data.layout==='inline';
  let rowsParent=panel;
  if(horizontal){
    rowsParent=await createFrame('Tooltip items');rowsParent.resize(panelContentWidth,20);
    Object.assign(rowsParent,{layoutMode:'HORIZONTAL',primaryAxisSizingMode:'FIXED',counterAxisSizingMode:'AUTO',itemSpacing:numberTokenValue(itemGap)});
    panel.appendChild(rowsParent);rowsParent.layoutSizingHorizontal='FILL';
  }
  for (const item of data.items) {
    const width=horizontal?(panelContentWidth-numberTokenValue(itemGap)*(data.items.length-1))/data.items.length:panelContentWidth;
    const row = await createTooltipRow(item,width,data.kind,horizontal);
    rowsParent.appendChild(row);
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
