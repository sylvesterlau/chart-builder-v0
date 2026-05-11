import { h } from "preact";
import { textColor, typography } from "../config";
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
        padding: "8px 16px",
        width: "100%",
      }}
    >
      <div
        style={{
          color: textColor.primary.value,
          flex: 1,
          minWidth: 0,
          ...typographyTokenToCss(typography.chartTitle),
        }}
      >
        {title}
      </div>
    </div>
  );
}

export default ChartTitlePreview;
