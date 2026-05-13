import type { ChartTypographyToken } from "./chartTypography";
import { resolveFigmaFontStyle } from "./chartTypography";

export function applyFigmaTypographyToken(
  node: TextNode,
  token: ChartTypographyToken,
): void {
  node.fontName = {
    family: token.fontFamily,
    style: resolveFigmaFontStyle(token),
  };
  node.fontSize = token.fontSize;
  node.lineHeight = { unit: "PIXELS", value: token.lineHeight };
}
