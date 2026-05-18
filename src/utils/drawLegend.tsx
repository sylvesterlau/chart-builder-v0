import {
  dividerColor,
  legendSpacingConfig,
  textColor,
  typography,
} from "../config";
import { formatLegendPercentageDisplay } from "../helpers";
import type { ColorToken } from "../types";
import { applyLegendSpacing } from "./applyNumberToken";
import {
  applyColorTokenToFills,
  applyColorTokenToStrokes,
} from "./applyColorToken";
import { applyFigmaTypographyToken } from "./applyFigmaTypography";
import { resolveFigmaFontStyle } from "./chartTypography";

const legendTextColor = textColor.primary;
const legendDividerColor = dividerColor;

function formatLegendValue(value: number, prefix: string, suffix: string) {
  const formattedValue = value.toFixed(2);
  const prefixText = prefix.trim();
  const suffixText = suffix.trim();
  return `${prefixText}${formattedValue}${suffixText ? ` ${suffixText}` : ""}`;
}

export async function loadLegendFonts() {
  const { label, value, percentage } = typography.legend;
  await figma.loadFontAsync({
    family: label.fontFamily,
    style: resolveFigmaFontStyle(label),
  });
  await figma.loadFontAsync({
    family: value.fontFamily,
    style: resolveFigmaFontStyle(value),
  });
  await figma.loadFontAsync({
    family: percentage.fontFamily,
    style: resolveFigmaFontStyle(percentage),
  });
}

export async function createLegend(
  label: string,
  value: number,
  percentage: number | null | undefined,
  shapeColor: ColorToken,
  showPercentage: boolean = true,
  valuePrefix: string = "",
  valueSuffix: string = "HKD",
  tileLayout: "leftAndRight" | "topAndBottom" = "leftAndRight",
): Promise<FrameNode | null> {
  const legend = figma.createFrame();
  const shapeNode = figma.createRectangle();
  shapeNode.name = "Shape";
  shapeNode.resize(14, 14);

  let inlineLabelText = label;
  if (
    tileLayout === "leftAndRight" &&
    showPercentage &&
    percentage !== null &&
    percentage !== undefined
  ) {
    inlineLabelText = `${label} (${formatLegendPercentageDisplay(percentage)}%)`;
  }

  const valueTextInline = formatLegendValue(value, valuePrefix, valueSuffix);
  const percentText =
    showPercentage && percentage !== null && percentage !== undefined
      ? `(${formatLegendPercentageDisplay(percentage)}%)`
      : null;

  const isStacked = tileLayout === "topAndBottom";

  legend.fills = [];
  legend.resize(390, isStacked ? 56 : 44);
  Object.assign(legend, {
    name: "legend 1",
    layoutMode: "HORIZONTAL",
    primaryAxisSizingMode: "FIXED",
    counterAxisSizingMode: "AUTO",
    counterAxisAlignItems: isStacked ? "MIN" : "CENTER",
    layoutAlign: "STRETCH",
  });

  await applyLegendSpacing(legend, legendSpacingConfig);

  legend.strokeAlign = "INSIDE";
  legend.strokeWeight = 1;
  legend.strokeTopWeight = 0;
  legend.strokeRightWeight = 0;
  legend.strokeBottomWeight = 1;
  legend.strokeLeftWeight = 0;

  const textNodes: TextNode[] = [];

  if (isStacked) {
    Object.assign(shapeNode, { layoutAlign: "MIN" });

    const labelNode = figma.createText();
    labelNode.name = label;
    applyFigmaTypographyToken(labelNode, typography.legend.label);
    labelNode.characters = label;
    Object.assign(labelNode, { layoutAlign: "STRETCH" });
    textNodes.push(labelNode);

    const valueNode = figma.createText();
    valueNode.name = "Legend value";
    applyFigmaTypographyToken(valueNode, typography.legend.value);
    valueNode.characters = valueTextInline;
    Object.assign(valueNode, { layoutAlign: "MIN" });
    textNodes.push(valueNode);

    const valueRow = figma.createFrame();
    valueRow.fills = [];
    Object.assign(valueRow, {
      name: "Value",
      layoutMode: "HORIZONTAL",
      primaryAxisSizingMode: "AUTO",
      counterAxisSizingMode: "AUTO",
      itemSpacing: 4,
      counterAxisAlignItems: "CENTER",
      layoutAlign: "STRETCH",
    });
    valueRow.appendChild(valueNode);
    if (percentText !== null) {
      const percentNode = figma.createText();
      percentNode.name = "Legend percent";
      applyFigmaTypographyToken(percentNode, typography.legend.percentage);
      percentNode.characters = percentText;
      Object.assign(percentNode, { layoutAlign: "MIN" });
      textNodes.push(percentNode);
      valueRow.appendChild(percentNode);
    }

    const textStack = figma.createFrame();
    textStack.fills = [];
    Object.assign(textStack, {
      name: "Text Content",
      layoutMode: "VERTICAL",
      primaryAxisSizingMode: "AUTO",
      counterAxisSizingMode: "AUTO",
      itemSpacing: 0,
      layoutGrow: 1,
      layoutAlign: "STRETCH",
    });

    textStack.appendChild(labelNode);
    textStack.appendChild(valueRow);

    legend.appendChild(shapeNode);
    legend.appendChild(textStack);
  } else {
    const labelNode = figma.createText();
    labelNode.name = inlineLabelText;
    applyFigmaTypographyToken(labelNode, typography.legend.label);
    labelNode.characters = inlineLabelText;
    labelNode.layoutGrow = 1;
    textNodes.push(labelNode);

    const valueNode = figma.createText();
    valueNode.name = "Legend value";
    applyFigmaTypographyToken(valueNode, typography.legend.value);
    valueNode.characters = valueTextInline;
    textNodes.push(valueNode);

    legend.appendChild(shapeNode);
    legend.appendChild(labelNode);
    legend.appendChild(valueNode);
  }

  await applyColorTokenToFills(shapeNode, shapeColor);
  await applyColorTokenToStrokes(legend, legendDividerColor);
  for (const textNode of textNodes) {
    await applyColorTokenToFills(textNode, legendTextColor);
  }

  return legend;
}

export function createLegendList() {
  const legendList = figma.createFrame();
  legendList.fills = [];
  Object.assign(legendList, {
    name: "Legends",
    layoutMode: "VERTICAL",
    primaryAxisSizingMode: "AUTO",
    layoutAlign: "STRETCH",
  });
  return legendList;
}
