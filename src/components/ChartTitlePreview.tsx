import { h } from "preact";
import { chartTitleConfig, textColor } from "../config";
import { typographyTokenToCss } from "../utils/chartTypography";

interface ChartTitlePreviewProps {
  title: string;
}

function ChartTitlePreview({ title }: ChartTitlePreviewProps) {
  if (!title.trim()) {
    return null;
  }

  return (
    <div
      style={{
        boxSizing: "border-box",
        display: "flex",
        padding: `${chartTitleConfig.padding.vertical}px ${chartTitleConfig.padding.horizontal}px`,
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
