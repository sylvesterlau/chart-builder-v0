import { chartTitleConfig, textColor } from "../config";
import { applyChartTitlePadding } from "./applyNumberToken";
import { applyColorTokenToFills } from "./applyColorToken";
import { applyFigmaTypographyToken } from "./applyFigmaTypography";
import { resolveFigmaFontStyle } from "./chartTypography";

export async function loadChartTitleFont() {
  const token = chartTitleConfig.typography;
  await figma.loadFontAsync({
    family: token.fontFamily,
    style: resolveFigmaFontStyle(token),
  });
}

export async function createChartTitle(title: string): Promise<FrameNode | null> {
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
    layoutAlign: "STRETCH",
  });

  await applyChartTitlePadding(titleFrame, chartTitleConfig.padding);

  titleNode.name = trimmedTitle;
  applyFigmaTypographyToken(titleNode, chartTitleConfig.typography);
  titleNode.characters = trimmedTitle;
  titleNode.layoutGrow = 1;

  await applyColorTokenToFills(titleNode, textColor.primary);

  titleFrame.appendChild(titleNode);
  return titleFrame;
}
