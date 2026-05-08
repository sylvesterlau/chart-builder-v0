// Figma operations
import { formatLegendPercentageDisplay } from "../helpers";
// check Theme collection by ID
export async function checkThemeCol(colID: string) {
  const libraryCollections =
    await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
  const themeColExists =
    Array.isArray(libraryCollections) &&
    !!libraryCollections.find((col: any) => col.key === colID);
  if (!themeColExists) {
    figma.notify(
      "📚Hive Design Toolkit is missing. Please check Team Library.",
    );
    return;
  }
}
function formatLegendValue(value: number, prefix: string, suffix: string) {
  const formattedValue = value.toFixed(2);
  const prefixText = prefix.trim();
  const suffixText = suffix.trim();
  return `${prefixText}${formattedValue}${suffixText ? ` ${suffixText}` : ""}`;
}

export async function loadLegendFonts() {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
}

export async function loadChartTitleFont() {
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
}

export function createChartTitle(title: string): FrameNode | null {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    return null;
  }

  const titleFrame = figma.createFrame();
  const titleNode = figma.createText();

  titleFrame.fills = [];
  titleFrame.resize(390, 46);
  Object.assign(titleFrame, {
    name: "chart title",
    layoutMode: "HORIZONTAL",
    primaryAxisSizingMode: "FIXED",
    counterAxisSizingMode: "AUTO",
    counterAxisAlignItems: "CENTER",
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 8,
    paddingBottom: 8,
    layoutAlign: "STRETCH",
  });

  titleNode.name = trimmedTitle;
  titleNode.fontName = { family: "Inter", style: "Medium" };
  titleNode.fontSize = 23;
  titleNode.lineHeight = { unit: "PIXELS", value: 30 };
  titleNode.characters = trimmedTitle;
  titleNode.layoutGrow = 1;
  titleNode.fills = [
    {
      type: "SOLID",
      color: figma.util.rgb("#333333"),
    },
  ];

  titleFrame.appendChild(titleNode);
  return titleFrame;
}

//Create legend item
export function createLegend(
  label: string,
  value: number,
  percentage?: number | null,
  _variableKey?: string | null,
  hexColor: string = "#347893",
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
    showPercentage &&
    percentage !== null &&
    percentage !== undefined
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
    itemSpacing: 8,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 12,
    paddingBottom: 12,
    layoutAlign: "STRETCH",
  });

  legend.strokes = [
    {
      type: "SOLID",
      color: figma.util.rgb("#EDEDED"),
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
    labelNode.fontName = { family: "Inter", style: "Regular" };
    labelNode.fontSize = 14;
    labelNode.lineHeight = { unit: "PIXELS", value: 20 };
    labelNode.characters = label;
    labelNode.fills = [
      {
        type: "SOLID",
        color: figma.util.rgb("#333333"),
      },
    ];
    Object.assign(labelNode, { layoutAlign: "STRETCH" });

    const valueNode = figma.createText();
    valueNode.name = "Legend value";
    valueNode.fontName = { family: "Inter", style: "Semi Bold" };
    valueNode.fontSize = 14;
    valueNode.lineHeight = { unit: "PIXELS", value: 20 };
    valueNode.characters = valueTextInline;
    valueNode.fills = [
      {
        type: "SOLID",
        color: figma.util.rgb("#333333"),
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
      percentNode.fontName = { family: "Inter", style: "Regular" };
      percentNode.fontSize = 14;
      percentNode.lineHeight = { unit: "PIXELS", value: 20 };
      percentNode.characters = percentText;
      percentNode.fills = [
        {
          type: "SOLID",
          color: figma.util.rgb("#333333"),
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
    labelNode.fontName = { family: "Inter", style: "Regular" };
    labelNode.fontSize = 14;
    labelNode.lineHeight = { unit: "PIXELS", value: 20 };
    labelNode.characters = inlineLabelText;
    labelNode.layoutGrow = 1;
    labelNode.fills = [
      {
        type: "SOLID",
        color: figma.util.rgb("#333333"),
      },
    ];

    const valueNode = figma.createText();
    valueNode.name = "Legend value";
    valueNode.fontName = { family: "Inter", style: "Semi Bold" };
    valueNode.fontSize = 14;
    valueNode.lineHeight = { unit: "PIXELS", value: 20 };
    valueNode.characters = valueTextInline;
    valueNode.fills = [
      {
        type: "SOLID",
        color: figma.util.rgb("#333333"),
      },
    ];

    legend.appendChild(shapeNode);
    legend.appendChild(labelNode);
    legend.appendChild(valueNode);
  }

  return legend;
}
// Create legend list
export function createLegendList() {
  const legendList = figma.createFrame();
  legendList.fills = [];
  Object.assign(legendList, {
    name: "Legends",
    layoutMode: "VERTICAL",
    primaryAxisSizingMode: "AUTO", // height = hug
    layoutAlign: "STRETCH", // width fill container
  });
  return legendList;
}
// Draw final frame
export function createFinalFrame() {
  const finalFrame = figma.createFrame();
  finalFrame.resize(390, 0);
  Object.assign(finalFrame, {
    name: "Chart + legend",
    x: figma.viewport.center.x,
    y: figma.viewport.center.y,
    layoutMode: "VERTICAL",
    primaryAxisSizingMode: "AUTO", //height : hug
    counterAxisSizingMode: "FIXED", // width : hug
    counterAxisAlignItems: "CENTER",
    itemSpacing: 0,
    paddingTop: 16,
    paddingBottom: 16,
  });
  finalFrame.fills = [
    {
      type: "SOLID",
      color: figma.util.rgb("#ffffff"),
    },
  ];
  return finalFrame;
}
