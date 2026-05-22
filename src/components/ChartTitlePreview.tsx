import { h } from "preact";
import { chartTitleConfig, textColor } from "../config";
import { useColorTokenResolved } from "./ColorChips/colorTokenSwatchContext";
import { useNumberTokenResolved } from "./NumChips/numberTokenValueContext";
import { useTypographyTokenResolved } from "./TypographyChips/typographyTokenValueContext";
import { colorTokenPreviewBackground } from "../utils/colorTokenDisplay";
import { numberTokenResolvedValue } from "../utils/numberTokenDisplay";
import { typographyTokenToPreviewCss } from "../utils/typographyTokenDisplay";

interface ChartTitlePreviewProps {
  title: string;
}

function ChartTitlePreview({ title }: ChartTitlePreviewProps) {
  const { values: resolvedNumbers } = useNumberTokenResolved();
  const { values: resolvedColors } = useColorTokenResolved();
  const { values: resolvedTypography } = useTypographyTokenResolved();

  if (!title.trim()) {
    return null;
  }

  const paddingVertical = numberTokenResolvedValue(
    chartTitleConfig.padding.vertical,
    resolvedNumbers,
  );
  const paddingHorizontal = numberTokenResolvedValue(
    chartTitleConfig.padding.horizontal,
    resolvedNumbers,
  );

  return (
    <div
      style={{
        boxSizing: "border-box",
        display: "flex",
        padding: `${paddingVertical}px ${paddingHorizontal}px`,
        width: "100%",
      }}
    >
      <div
        style={{
          color: colorTokenPreviewBackground(textColor.primary, resolvedColors),
          flex: 1,
          minWidth: 0,
          ...typographyTokenToPreviewCss(
            chartTitleConfig.typography,
            resolvedTypography,
          ),
        }}
      >
        {title}
      </div>
    </div>
  );
}

export default ChartTitlePreview;
