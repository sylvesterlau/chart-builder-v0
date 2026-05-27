import { h } from "preact";
import { chartBackground, horizontalBarChartLayout } from "../config";
import { dataVisAt } from "../utils/dataVisAt";
import { LegendStyle } from "../types";
import { ChartItem } from "./ChartItemInput";
import ChartTitlePreview from "./ChartTitlePreview";
import LegendPreview from "./LegendPreview";
import { useColorTokenResolved } from "./ColorChips/colorTokenSwatchContext";
import { useNumberTokenResolved } from "./NumChips/numberTokenValueContext";
import { colorTokenPreviewBackground, colorTokenSwatchHex } from "../utils/colorTokenDisplay";
import { numberTokenResolvedValue } from "../utils/numberTokenDisplay";

interface HorizontalBarChartPreviewProps {
  chartTitle: string;
  frameWidth: number;
  items: ChartItem[];
  sliceGap: number;
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
  frameWidth,
  items,
  sliceGap,
  legendStyle,
  showPercentage,
  valuePrefix,
  valueSuffix,
}: HorizontalBarChartPreviewProps) {
  const { values: resolvedColors } = useColorTokenResolved();
  const { values: resolvedNumbers } = useNumberTokenResolved();
  const horizontalPadding = numberTokenResolvedValue(
    horizontalBarChartLayout.horizontalPadding,
    resolvedNumbers,
  );
  const verticalPadding = numberTokenResolvedValue(
    horizontalBarChartLayout.verticalPadding,
    resolvedNumbers,
  );

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
        backgroundColor: colorTokenPreviewBackground(
          chartBackground,
          resolvedColors,
        ),
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        maxWidth: `${frameWidth}px`,
        padding: 0,
        transform: "scale(0.9)",
        transformOrigin: "top center",
        width: `${frameWidth}px`,
      }}
    >
      <ChartTitlePreview title={chartTitle} />
      <div
        style={{
          boxSizing: "border-box",
          display: "flex",
          gap: `${sliceGap}px`,
          height: "12px",
          padding: `${verticalPadding}px ${horizontalPadding}px`,
          overflow: "hidden",
          width: "100%",
        }}
      >
        {chartItems.map((item, index) => {
          const color = colorTokenSwatchHex(dataVisAt(item.index), resolvedColors);
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
