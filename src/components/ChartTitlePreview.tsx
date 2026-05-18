import { h } from "preact";
import { chartTitleConfig, textColor } from "../config";
import { useNumberTokenResolved } from "./NumChips/numberTokenValueContext";
import { numberTokenResolvedValue } from "../utils/numberTokenDisplay";
import { typographyTokenToCss } from "../utils/chartTypography";

interface ChartTitlePreviewProps {
  title: string;
}

function ChartTitlePreview({ title }: ChartTitlePreviewProps) {
  const { values: resolvedNumbers } = useNumberTokenResolved();
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
          color: textColor.primary.value,
          flex: 1,
          minWidth: 0,
          ...typographyTokenToCss(chartTitleConfig.typography),
        }}
      >
        {title}
      </div>
    </div>
  );
}

export default ChartTitlePreview;
