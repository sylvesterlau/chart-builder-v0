// Figma operations
import { chartConfig, semanticToken, teamLibrary } from "../config";
import { bindVariableKeyToPaint, dotToSlash, splitNumber } from "../helpers";
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
// Draw semi donut slice
export async function createSemiDonutSlice(
  startPercent: number,
  endPercent: number,
  layerName: string = "slice",
  hexColor: string = chartConfig.defaultColor,
  isFirst: Boolean = false,
  variableKey?: string | null,
): Promise<EllipseNode | null> {
  if (endPercent - startPercent <= 0) {
    return null;
  }
  const slice = figma.createEllipse();
  // if it's not the first slice, add 2px gap between slices
  let gap = isFirst ? 0 : 0.5;
  slice.name = layerName;
  slice.resize(chartConfig.size, chartConfig.size);
  slice.arcData = {
    startingAngle: -Math.PI * (1 - (startPercent + gap) / 100),
    endingAngle: -Math.PI * (1 - endPercent / 100),
    innerRadius: chartConfig.ratio,
  };
  const convertedColor = figma.util.rgb(hexColor);
  const fillColor = convertedColor;
  slice.fills = [{ type: "SOLID", color: fillColor }];
  // if variableKey（string), use bindVariableKeyToPaint
  if (variableKey && typeof variableKey === "string") {
    try {
      const boundPaint = await bindVariableKeyToPaint(
        variableKey,
        slice.fills[0] as SolidPaint,
      );
      slice.fills = [boundPaint];
    } catch (err) {
      console.error("createDonutSlice: bindVariableKeyToPaint failed", err);
    }
  }
  return slice;
}

function formatLegendPercentage(percentage: number) {
  const fixedPercentage = percentage.toFixed(1);
  return fixedPercentage.endsWith(".0")
    ? fixedPercentage.slice(0, -2)
    : fixedPercentage;
}

function formatLegendValue(value: number, prefix: string, suffix: string) {
  const formattedValue = value.toFixed(2);
  const prefixText = prefix.trim();
  const suffixText = suffix.trim();
  return `${prefixText}${formattedValue}${suffixText ? ` ${suffixText}` : ""}`;
}

export async function loadLegendFonts() {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
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
): FrameNode | null {
  const legend = figma.createFrame();
  const shapeNode = figma.createRectangle();
  const labelNode = figma.createText();
  const valueNode = figma.createText();

  if (showPercentage && percentage !== null && percentage !== undefined) {
    label = `${label} (${formatLegendPercentage(percentage)}%)`;
  }

  legend.fills = [];
  legend.resize(390, 44);
  Object.assign(legend, {
    name: "legend 1",
    layoutMode: "HORIZONTAL",
    primaryAxisSizingMode: "FIXED",
    counterAxisSizingMode: "AUTO",
    counterAxisAlignItems: "CENTER",
    itemSpacing: 8,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 12,
    paddingBottom: 12,
    layoutAlign: "STRETCH", // width fill container
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

  shapeNode.name = "Shape";
  shapeNode.resize(14, 14);
  shapeNode.fills = [
    {
      type: "SOLID",
      color: figma.util.rgb(hexColor),
    },
  ];

  labelNode.name = label;
  labelNode.fontName = { family: "Inter", style: "Regular" };
  labelNode.fontSize = 14;
  labelNode.lineHeight = { unit: "PIXELS", value: 20 };
  labelNode.characters = label;
  labelNode.layoutGrow = 1;
  labelNode.fills = [
    {
      type: "SOLID",
      color: figma.util.rgb("#333333"),
    },
  ];

  valueNode.name = "Legend value";
  valueNode.fontName = { family: "Inter", style: "Semi Bold" };
  valueNode.fontSize = 14;
  valueNode.lineHeight = { unit: "PIXELS", value: 20 };
  valueNode.characters = formatLegendValue(value, valuePrefix, valueSuffix);
  valueNode.fills = [
    {
      type: "SOLID",
      color: figma.util.rgb("#333333"),
    },
  ];

  legend.appendChild(shapeNode);
  legend.appendChild(labelNode);
  legend.appendChild(valueNode);
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
//Create total value frame
export async function createTotalValueFrame(
  sumValue: number,
  title: string,
): Promise<FrameNode | null> {
  // Create total value frame
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  const titleNode = figma.createText();
  titleNode.characters = title;
  titleNode.fills = [
    {
      type: "SOLID",
      color: figma.util.rgb(dotToSlash(chartConfig.defaultColor)),
    },
  ];
  //bind text color token
  try {
    const boundPaint = await bindVariableKeyToPaint(
      semanticToken.textPrimayColor.key,
      titleNode.fills[0] as SolidPaint,
    );
    titleNode.fills = [boundPaint];
  } catch (err) {
    console.error("balance display: bindVariableKeyToPaint failed", err);
  }
  //test text style
  try {
    titleNode.setTextStyleIdAsync(semanticToken.textQuoteStyle.key);
  } catch (err) {
    console.log("Err:", err);
  }
  //Create Balance display
  const compKey = teamLibrary.dataVis.balanceDisplay.compKey;
  const importedComponent = await figma.importComponentByKeyAsync(compKey);
  const balanceDisplay = importedComponent.createInstance();
  const { integer, decimal } = splitNumber(sumValue);
  balanceDisplay.setProperties({
    "Balance integer#1942:28": integer,
    "Balance decimal#1942:40": `.${decimal}`,
    "Code text#1942:32": "HKD",
  });
  const totalValFrame = figma.createFrame();
  totalValFrame.fills = [];
  totalValFrame.appendChild(titleNode);
  totalValFrame.appendChild(balanceDisplay);
  Object.assign(totalValFrame, {
    name: "Total value frame",
    layoutMode: "VERTICAL",
    primaryAxisSizingMode: "AUTO",
    counterAxisSizingMode: "AUTO",
    counterAxisAlignItems: "CENTER",
  });
  return totalValFrame;
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
