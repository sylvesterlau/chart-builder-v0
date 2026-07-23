import {
  dividerColor,
  legendIndicatorConfig,
  legendShapeConfig,
  legendSpacingConfig,
  textColor,
  typography,
} from "../config";
import { formatLegendPercentageDisplay } from "../helpers";
import type { ColorToken } from "../types";
import {
  applyHeight,
  applyItemSpacing,
  applyLegendSpacing,
  applyWidth,
} from "./applyNumberToken";
import {
  applyColorTokenToFills,
  applyColorTokenToStrokes,
} from "./applyColorToken";
import {
  applyTypographyTokenToText,
  loadTypographyTokenFontsBatch,
} from "./applyTypographyToken";
import { dataVisAt } from "./dataVisAt";
import {
  buildLegendEntries,
  type LegendSourceItem,
} from "./legendAggregate";

const legendTextColor = textColor.primary;
const legendDividerColor = dividerColor;

export interface CreateLegendOptions {
  showValue?: boolean;
  transparentSwatch?: boolean;
}

function formatLegendValue(value: number, prefix: string, suffix: string) {
  const formattedValue = value.toFixed(2);
  const prefixText = prefix.trim();
  const suffixText = suffix.trim();
  return `${prefixText}${formattedValue}${suffixText ? ` ${suffixText}` : ""}`;
}

export async function loadLegendFonts() {
  const { label, value, percentage } = typography.legend;
  await loadTypographyTokenFontsBatch([label, value, percentage]);
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
  frameWidth: number = 390,
  options: CreateLegendOptions = {},
): Promise<FrameNode | null> {
  const showValue = options.showValue !== false;
  const transparentSwatch = options.transparentSwatch === true;

  const legend = figma.createFrame();
  const legendLabel = label.trim() || "Item";
  const shapeNode = figma.createRectangle();
  shapeNode.name = "Color";
  const shapeSize = legendShapeConfig.size.value;
  shapeNode.resize(shapeSize, shapeSize);
  shapeNode.fills = [];

  const indicatorFrame = figma.createFrame();
  indicatorFrame.fills = [];
  await applyWidth(indicatorFrame, legendIndicatorConfig.size);
  await applyHeight(indicatorFrame, legendIndicatorConfig.size);
  Object.assign(indicatorFrame, {
    name: ".Legend indicator",
    layoutMode: "VERTICAL",
    primaryAxisSizingMode: "FIXED",
    counterAxisSizingMode: "FIXED",
    primaryAxisAlignItems: "CENTER",
    counterAxisAlignItems: "CENTER",
  });
  indicatorFrame.appendChild(shapeNode);

  const valueTextInline = formatLegendValue(value, valuePrefix, valueSuffix);
  const percentText =
    showPercentage && percentage !== null && percentage !== undefined
      ? `(${formatLegendPercentageDisplay(percentage)}%)`
      : null;

  const isStacked = tileLayout === "topAndBottom";

  legend.fills = [];
  legend.resize(frameWidth, isStacked ? 56 : 44);
  Object.assign(legend, {
    name: legendLabel,
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
    Object.assign(indicatorFrame, { layoutAlign: "MIN" });

    const labelNode = figma.createText();
    labelNode.name = legendLabel;
    await applyTypographyTokenToText(labelNode, typography.legend.label);
    labelNode.characters = legendLabel;
    Object.assign(labelNode, { layoutAlign: "STRETCH" });
    textNodes.push(labelNode);

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

    if (showValue) {
      const valueNode = figma.createText();
      valueNode.name = "Value";
      await applyTypographyTokenToText(valueNode, typography.legend.value);
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
        itemSpacing: 0,
        counterAxisAlignItems: "CENTER",
        layoutAlign: "STRETCH",
      });
      valueRow.appendChild(valueNode);
      if (percentText !== null) {
        const percentNode = figma.createText();
        percentNode.name = percentText;
        await applyTypographyTokenToText(
          percentNode,
          typography.legend.percentage,
        );
        percentNode.characters = percentText;
        Object.assign(percentNode, { layoutAlign: "MIN" });
        textNodes.push(percentNode);
        valueRow.appendChild(percentNode);
      }
      textStack.appendChild(valueRow);
    }

    legend.appendChild(indicatorFrame);
    legend.appendChild(textStack);
  } else {
    const labelNode = figma.createText();
    labelNode.name = legendLabel;
    await applyTypographyTokenToText(labelNode, typography.legend.label);
    labelNode.characters = legendLabel;
    textNodes.push(labelNode);

    const labelRow = figma.createFrame();
    labelRow.fills = [];
    Object.assign(labelRow, {
      name: "Label",
      layoutMode: "HORIZONTAL",
      primaryAxisSizingMode: "AUTO",
      counterAxisSizingMode: "AUTO",
      itemSpacing: legendSpacingConfig.leftRightItemSpacing.value,
      counterAxisAlignItems: "CENTER",
      layoutGrow: 1,
      layoutAlign: "STRETCH",
    });
    labelRow.appendChild(labelNode);

    if (percentText !== null) {
      const percentNode = figma.createText();
      percentNode.name = percentText;
      await applyTypographyTokenToText(
        percentNode,
        typography.legend.percentage,
      );
      percentNode.characters = percentText;
      textNodes.push(percentNode);
      labelRow.appendChild(percentNode);
    }
    await applyItemSpacing(labelRow, legendSpacingConfig.leftRightItemSpacing);

    legend.appendChild(indicatorFrame);
    legend.appendChild(labelRow);

    if (showValue) {
      const valueNode = figma.createText();
      valueNode.name = "Value";
      await applyTypographyTokenToText(valueNode, typography.legend.value);
      valueNode.characters = valueTextInline;
      textNodes.push(valueNode);
      legend.appendChild(valueNode);
    }
  }

  if (!transparentSwatch) {
    await applyColorTokenToFills(shapeNode, shapeColor);
  }
  await applyColorTokenToStrokes(legend, legendDividerColor);
  for (const textNode of textNodes) {
    await applyColorTokenToFills(textNode, legendTextColor);
  }

  return legend;
}

export function createLegendList(name: string = "Legends") {
  const legendList = figma.createFrame();
  legendList.fills = [];
  Object.assign(legendList, {
    name,
    layoutMode: "VERTICAL",
    primaryAxisSizingMode: "AUTO",
    layoutAlign: "STRETCH",
  });
  return legendList;
}

export async function appendAggregatedLegends(
  legendList: FrameNode,
  items: LegendSourceItem[],
  showPercentage: boolean,
  valuePrefix: string,
  valueSuffix: string,
  tileLayout: "leftAndRight" | "topAndBottom",
  frameWidth: number,
  othersLabel?: string,
): Promise<void> {
  const entries = buildLegendEntries(items, othersLabel);
  for (const entry of entries) {
    const rowShowPercentage = showPercentage && entry.showPercentage;
    const legend = await createLegend(
      entry.label,
      entry.value,
      entry.percentage,
      dataVisAt(entry.colorIndex),
      rowShowPercentage,
      valuePrefix,
      valueSuffix,
      tileLayout,
      frameWidth,
      {
        showValue: entry.showValue,
        transparentSwatch: entry.transparentSwatch,
      },
    );
    if (legend) {
      legendList.appendChild(legend);
    }
  }
}
