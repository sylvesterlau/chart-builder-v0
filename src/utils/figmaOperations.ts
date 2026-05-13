// Figma operations
import { textColor, typography } from "../config";
import { applyFigmaTypographyToken } from "./applyFigmaTypography";
import { resolveFigmaFontStyle } from "./chartTypography";

const chartTextPrimaryHex = textColor.primary.value;
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

export async function loadChartTitleFont() {
  const token = typography.chartTitle;
  await figma.loadFontAsync({
    family: token.fontFamily,
    style: resolveFigmaFontStyle(token),
  });
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
  applyFigmaTypographyToken(titleNode, typography.chartTitle);
  titleNode.characters = trimmedTitle;
  titleNode.layoutGrow = 1;
  titleNode.fills = [
    {
      type: "SOLID",
      color: figma.util.rgb(chartTextPrimaryHex),
    },
  ];

  titleFrame.appendChild(titleNode);
  return titleFrame;
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
