import { h } from "preact";
import { chartBackground, dataVisAt } from "../config";
import { LegendStyle } from "../types";
import { ChartItem } from "./ChartItemInput";
import ChartTitlePreview from "./ChartTitlePreview";
import LegendPreview from "./LegendPreview";

interface HorizontalBarChartPreviewProps {
  chartTitle: string;
  items: ChartItem[];
  legendStyle: LegendStyle;
  showPercentage: boolean;
  valuePrefix: string;
  valueSuffix: string;
}

function formatPercent(value: number) {
  return value.toFixed(1);
}

function HorizontalBarChartPreview({
  chartTitle,
  items,
  legendStyle,
  showPercentage,
  valuePrefix,
  valueSuffix,
}: HorizontalBarChartPreviewProps) {
  const legendItems = items
    .map((item, index) => ({ ...item, index }))
    .filter((item) => item.label.trim() !== "" || item.value > 0);
  const chartItems = legendItems.filter((item) => item.value > 0);
  const total = chartItems.reduce((sum, item) => sum + item.value, 0);

  if (legendItems.length === 0 || total <= 0) {
    return null;
  }

  return (
    <div
      style={{
        alignItems: "center",
        backgroundColor: chartBackground.value,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "16px 0",
        width: "100%",
        // css transform to 80% size of the parent
        transform: "scale(0.9)",
        transformOrigin: "top center",
      }}
    >
      <ChartTitlePreview title={chartTitle} />
      <div
        style={{
          boxSizing: "border-box",
          display: "flex",
          gap: "2px",
          height: "12px",
          padding: "0 16px",
          overflow: "hidden",
          width: "100%",
        }}
      >
        {chartItems.map((item, index) => {
          const color = dataVisAt(item.index).value;
          return (
            <div
              key={`${item.label}-${index}`}
              style={{
                backgroundColor: color,
                flex: `${item.value} 1 0`,
                height: "12px",
              }}
            />
          );
        })}
      </div>
      <LegendPreview
        items={legendItems}
        legendStyle={legendStyle}
        total={total}
        showPercentage={showPercentage}
        valuePrefix={valuePrefix}
        valueSuffix={valueSuffix}
        inlinePercentageFormatter={formatPercent}
      />
    </div>
  );
}

export default HorizontalBarChartPreview;
