import { chartTitleConfig, textColor } from "../config";
import { applyFigmaTypographyToken } from "./applyFigmaTypography";
import { resolveFigmaFontStyle } from "./chartTypography";

const chartTextPrimaryHex = textColor.primary.value;

export async function loadChartTitleFont() {
  const token = chartTitleConfig.typography;
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
    paddingLeft: chartTitleConfig.padding.horizontal,
    paddingRight: chartTitleConfig.padding.horizontal,
    paddingTop: chartTitleConfig.padding.vertical,
    paddingBottom: chartTitleConfig.padding.vertical,
    layoutAlign: "STRETCH",
  });

  titleNode.name = trimmedTitle;
  applyFigmaTypographyToken(titleNode, chartTitleConfig.typography);
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
