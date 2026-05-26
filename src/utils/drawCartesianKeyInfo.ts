import { cartesianKeyInfoConfig, chartBackground, textColor } from "../config";
import { dataVisAt } from "./dataVisAt";
import {
  CartesianKeyInfoData,
  formatPercentageChange,
} from "./cartesianKeyInfo";
import type { ColorToken, TypographyToken } from "../types";
import { applyColorTokenToFills, applyColorTokenToStrokes } from "./applyColorToken";
import {
  applyTypographyTokenToText,
  loadTypographyTokenFontsBatch,
} from "./applyTypographyToken";

const keyInfoTextColor = textColor.primary;

export async function loadCartesianKeyInfoFonts() {
  const ty = cartesianKeyInfoConfig.typography;
  await loadTypographyTokenFontsBatch([
    ty.range,
    ty.label,
    ty.valueLarge,
    ty.value,
    ty.rowValue,
    ty.unit,
    ty.change,
  ]);
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

async function createBarSwatch(colorToken: ColorToken): Promise<RectangleNode> {
  const shape = figma.createRectangle();
  shape.name = "Shape";
  shape.resize(14, 14);
  await applyColorTokenToFills(shape, colorToken);
  return shape;
}

async function createLineSwatch(
  colorToken: ColorToken,
  seriesIndex: number,
): Promise<FrameNode> {
  const visual = await createFrame("Series indicator");
  visual.resize(18, 18);

  const line = figma.createRectangle();
  line.name = "Line";
  line.resize(18, 2);
  line.x = 0;
  line.y = 8;
  await applyColorTokenToFills(line, colorToken);
  visual.appendChild(line);

  const shape =
    seriesIndex === 2
      ? figma.createPolygon()
      : seriesIndex === 1
        ? figma.createRectangle()
        : figma.createEllipse();
  shape.name = "Shape";
  if (shape.type === "POLYGON") {
    shape.pointCount = 3;
    shape.resize(11.5, 10.5);
  } else {
    shape.resize(seriesIndex === 1 ? 9.5 : 11, seriesIndex === 1 ? 9.5 : 11);
  }
  shape.x = (18 - shape.width) / 2;
  shape.y = (18 - shape.height) / 2;
  await applyColorTokenToFills(shape, colorToken);
  await applyColorTokenToStrokes(shape, chartBackground);
  shape.strokeWeight = 1.5;
  shape.strokeAlign = "OUTSIDE";
  visual.appendChild(shape);

  return visual;
}

async function createVisual(
  kind: CartesianKeyInfoData["kind"],
  colorTokenIndex: number,
): Promise<FrameNode> {
  const visual = await createFrame("Visual");
  visual.resize(18, 20);
  Object.assign(visual, {
    layoutMode: "HORIZONTAL",
    primaryAxisAlignItems: "CENTER",
    counterAxisAlignItems: "CENTER",
  });
  const token = dataVisAt(colorTokenIndex);
  visual.appendChild(
    kind === "line"
      ? await createLineSwatch(token, colorTokenIndex)
      : await createBarSwatch(token),
  );
  return visual;
}

async function createLabelRow(
  data: CartesianKeyInfoData,
  itemIndex: number,
): Promise<FrameNode> {
  const item = data.items[itemIndex];
  const row = await createFrame("Main");
  row.resize(160, 20);
  Object.assign(row, {
    layoutMode: "HORIZONTAL",
    primaryAxisSizingMode: "AUTO",
    counterAxisSizingMode: "AUTO",
    counterAxisAlignItems: "MIN",
    itemSpacing: cartesianKeyInfoConfig.spacing.itemGap.value,
  });

  row.appendChild(await createVisual(data.kind, item.colorTokenIndex));
  const label = await createText(
    item.label,
    cartesianKeyInfoConfig.typography.label,
    keyInfoTextColor,
  );
  label.layoutGrow = 1;
  row.appendChild(label);
  return row;
}

async function createValueRow(
  data: CartesianKeyInfoData,
  itemIndex: number,
): Promise<FrameNode> {
  const item = data.items[itemIndex];
  const isRows = data.layout === "rows";
  const row = await createFrame("Data");
  row.resize(160, isRows ? 20 : 36);
  Object.assign(row, {
    layoutMode: "HORIZONTAL",
    primaryAxisSizingMode: "AUTO",
    counterAxisSizingMode: "AUTO",
    counterAxisAlignItems: "BASELINE",
    itemSpacing: cartesianKeyInfoConfig.spacing.rowGap.value,
  });

  row.appendChild(
    await createText(
      item.value,
      data.kind === "line" && !isRows
        ? cartesianKeyInfoConfig.typography.valueLarge
        : isRows
          ? cartesianKeyInfoConfig.typography.rowValue
          : cartesianKeyInfoConfig.typography.value,
      keyInfoTextColor,
    ),
  );
  row.appendChild(
    await createText(
      item.unit,
      cartesianKeyInfoConfig.typography.unit,
      keyInfoTextColor,
    ),
  );

  if (item.percentageChange !== undefined) {
    const changeToken =
      item.percentageChange < 0
        ? cartesianKeyInfoConfig.color.loss
        : cartesianKeyInfoConfig.color.gain;
    row.appendChild(
      await createText(
        `${item.percentageChange < 0 ? "-" : "+"}${formatPercentageChange(item.percentageChange)}`,
        cartesianKeyInfoConfig.typography.change,
        changeToken,
      ),
    );
  }

  return row;
}

async function createInlineItem(
  data: CartesianKeyInfoData,
  itemIndex: number,
): Promise<FrameNode> {
  const item = await createFrame("Key info item");
  item.resize(160, data.kind === "line" ? 56 : 47);
  Object.assign(item, {
    layoutMode: "VERTICAL",
    primaryAxisSizingMode: "AUTO",
    counterAxisSizingMode: "FIXED",
    itemSpacing: 0,
    layoutGrow: 1,
  });
  item.appendChild(await createLabelRow(data, itemIndex));
  item.appendChild(await createValueRow(data, itemIndex));
  return item;
}

async function createRows(data: CartesianKeyInfoData): Promise<FrameNode> {
  const rows = await createFrame("Data");
  rows.resize(358, data.items.length * 24);
  Object.assign(rows, {
    layoutMode: "VERTICAL",
    primaryAxisSizingMode: "AUTO",
    counterAxisSizingMode: "FIXED",
    itemSpacing: cartesianKeyInfoConfig.spacing.rowGap.value,
    layoutAlign: "STRETCH",
  });

  for (let index = 0; index < data.items.length; index++) {
    const row = await createFrame("Content");
    row.resize(358, 20);
    Object.assign(row, {
      layoutMode: "HORIZONTAL",
      primaryAxisSizingMode: "AUTO",
      counterAxisSizingMode: "AUTO",
      counterAxisAlignItems: "CENTER",
      itemSpacing: cartesianKeyInfoConfig.spacing.itemGap.value,
      layoutAlign: "STRETCH",
    });
    const label = await createLabelRow(data, index);
    label.layoutGrow = 1;
    row.appendChild(label);
    row.appendChild(await createValueRow(data, index));
    rows.appendChild(row);
    row.layoutSizingHorizontal = "FILL";
  }

  return rows;
}

export async function createCartesianKeyInfo(
  data: CartesianKeyInfoData,
): Promise<FrameNode | null> {
  if (data.items.length === 0) {
    return null;
  }

  const keyInfo = await createFrame("Key info");
  keyInfo.resize(390, 1);
  Object.assign(keyInfo, {
    layoutMode: "VERTICAL",
    primaryAxisSizingMode: "AUTO",
    counterAxisSizingMode: "FIXED",
    layoutAlign: "STRETCH",
    paddingLeft: cartesianKeyInfoConfig.spacing.horizontalPadding.value,
    paddingRight: cartesianKeyInfoConfig.spacing.horizontalPadding.value,
    paddingTop: cartesianKeyInfoConfig.spacing.topPadding.value,
    paddingBottom: cartesianKeyInfoConfig.spacing.bottomPadding.value,
    itemSpacing: 0,
  });

  if (data.rangeLabel) {
    keyInfo.appendChild(
      await createText(
        data.rangeLabel,
        cartesianKeyInfoConfig.typography.range,
        keyInfoTextColor,
      ),
    );
  }

  if (data.layout === "rows") {
    const rows = await createRows(data);
    keyInfo.appendChild(rows);
    rows.layoutSizingHorizontal = "FILL";
  } else {
    const items = await createFrame("Key info items");
    items.resize(358, 56);
    Object.assign(items, {
      layoutMode: "HORIZONTAL",
      primaryAxisSizingMode: "AUTO",
      counterAxisSizingMode: "AUTO",
      itemSpacing: 0,
      layoutAlign: "STRETCH",
    });
    for (let index = 0; index < data.items.length; index++) {
      const item = await createInlineItem(data, index);
      items.appendChild(item);
      item.layoutSizingHorizontal = "FILL";
    }
    keyInfo.appendChild(items);
    items.layoutSizingHorizontal = "FILL";
  }

  return keyInfo;
}
