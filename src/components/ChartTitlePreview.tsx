import { h } from "preact";

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
          color: "#333333",
          flex: 1,
          fontFamily: "Inter, sans-serif",
          fontSize: "23px",
          fontWeight: 500,
          lineHeight: "30px",
          minWidth: 0,
        }}
      >
        {title}
      </div>
    </div>
  );
}

export default ChartTitlePreview;
