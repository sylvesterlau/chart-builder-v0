import { chartGeneralConfig, chartTitleConfig, textColor } from "../config";
import { applyChartTitlePadding } from "./applyNumberToken";
import { applyColorTokenToFills } from "./applyColorToken";
import {
  applyTypographyTokenToText,
  loadTypographyTokenFonts,
} from "./applyTypographyToken";

export async function loadChartTitleFont() {
  await loadTypographyTokenFonts(chartTitleConfig.typography);
}

export async function createChartTitle(
  title: string,
  frameWidth: number = chartGeneralConfig.frameWidth,
): Promise<FrameNode | null> {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    return null;
  }

  const titleFrame = figma.createFrame();
  const titleNode = figma.createText();

  titleFrame.fills = [];
  titleFrame.resize(frameWidth, 46);
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
  await applyTypographyTokenToText(titleNode, chartTitleConfig.typography);
  titleNode.characters = trimmedTitle;
  titleNode.layoutGrow = 1;

  await applyColorTokenToFills(titleNode, textColor.primary);

  titleFrame.appendChild(titleNode);
  return titleFrame;
}
