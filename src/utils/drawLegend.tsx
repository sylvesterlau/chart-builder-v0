import {
  dataVisColor,
  dividerColor,
  legendSpacingConfig,
  textColor,
  typography,
} from "../config";
import { formatLegendPercentageDisplay } from "../helpers";
import { applyFigmaTypographyToken } from "./applyFigmaTypography";
import { resolveFigmaFontStyle } from "./chartTypography";

const chartTextPrimaryHex = textColor.primary.value;
const legendDividerHex = dividerColor.value;

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

export function createLegend(
  label: string,
  value: number,
  percentage?: number | null,
  _variableKey?: string | null,
  hexColor: string = dataVisColor.general[0].value,
  showPercentage: boolean = true,
  valuePrefix: string = "",
  valueSuffix: string = "HKD",
  tileLayout: "leftAndRight" | "topAndBottom" = "leftAndRight",
): FrameNode | null {
  const legend = figma.createFrame();
  const shapeNode = figma.createRectangle();
  shapeNode.name = "Shape";
  shapeNode.resize(14, 14);
  shapeNode.fills = [
    {
      type: "SOLID",
      color: figma.util.rgb(hexColor),
    },
  ];

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
    itemSpacing: legendSpacingConfig.gap,
    paddingLeft: legendSpacingConfig.horizontalPadding,
    paddingRight: legendSpacingConfig.horizontalPadding,
    paddingTop: legendSpacingConfig.verticalPadding,
    paddingBottom: legendSpacingConfig.verticalPadding,
    layoutAlign: "STRETCH",
  });

  legend.strokes = [
    {
      type: "SOLID",
      color: figma.util.rgb(legendDividerHex),
    },
  ];
  legend.strokeAlign = "INSIDE";
  legend.strokeWeight = 1;
  legend.strokeTopWeight = 0;
  legend.strokeRightWeight = 0;
  legend.strokeBottomWeight = 1;
  legend.strokeLeftWeight = 0;

  if (isStacked) {
    Object.assign(shapeNode, { layoutAlign: "MIN" });

    const labelNode = figma.createText();
    labelNode.name = label;
    applyFigmaTypographyToken(labelNode, typography.legend.label);
    labelNode.characters = label;
    labelNode.fills = [
      {
        type: "SOLID",
        color: figma.util.rgb(chartTextPrimaryHex),
      },
    ];
    Object.assign(labelNode, { layoutAlign: "STRETCH" });

    const valueNode = figma.createText();
    valueNode.name = "Legend value";
    applyFigmaTypographyToken(valueNode, typography.legend.value);
    valueNode.characters = valueTextInline;
    valueNode.fills = [
      {
        type: "SOLID",
        color: figma.util.rgb(chartTextPrimaryHex),
      },
    ];
    Object.assign(valueNode, { layoutAlign: "MIN" });

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
      percentNode.fills = [
        {
          type: "SOLID",
          color: figma.util.rgb(chartTextPrimaryHex),
        },
      ];
      Object.assign(percentNode, { layoutAlign: "MIN" });
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
    labelNode.fills = [
      {
        type: "SOLID",
        color: figma.util.rgb(chartTextPrimaryHex),
      },
    ];

    const valueNode = figma.createText();
    valueNode.name = "Legend value";
    applyFigmaTypographyToken(valueNode, typography.legend.value);
    valueNode.characters = valueTextInline;
    valueNode.fills = [
      {
        type: "SOLID",
        color: figma.util.rgb(chartTextPrimaryHex),
      },
    ];

    legend.appendChild(shapeNode);
    legend.appendChild(labelNode);
    legend.appendChild(valueNode);
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
