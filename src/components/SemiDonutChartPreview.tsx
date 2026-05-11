import { h } from "preact";
import {
  dataVisAt,
  semiDonutChartConfig,
  textColor,
  typography,
} from "../config";
import { typographyTokenToCss } from "../utils/chartTypography";
import { LegendStyle } from "../types";
import { ChartItem } from "./ChartItemInput";
import ChartTitlePreview from "./ChartTitlePreview";
import LegendPreview from "./LegendPreview";

const chartTextPrimaryHex = textColor.primary.value;

interface SemiDonutChartPreviewProps {
  chartTitle: string;
  items: ChartItem[];
  legendStyle: LegendStyle;
  showPercentage: boolean;
  valuePrefix: string;
  valueSuffix: string;
  showTotalValue: boolean;
  totalValueTitle: string;
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(centerX, centerY, radius, startAngle);
  const end = polarToCartesian(centerX, centerY, radius, endAngle);
  const arcSweep = Math.abs(endAngle - startAngle) <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${arcSweep} 1 ${end.x} ${end.y}`;
}

function formatValueText(value: number, prefix: string, suffix: string) {
  const formattedValue = value.toFixed(2);
  const prefixText = prefix.trim();
  const suffixText = suffix.trim();
  return `${prefixText}${formattedValue}${suffixText ? ` ${suffixText}` : ""}`;
}

function SemiDonutChartPreview({
  chartTitle,
  items,
  legendStyle,
  showPercentage,
  valuePrefix,
  valueSuffix,
  showTotalValue,
  totalValueTitle,
}: SemiDonutChartPreviewProps) {
  const legendItems = items
    .map((item, index) => ({ ...item, index }))
    .filter((item) => item.label.trim() !== "" || item.value > 0);
  const chartItems = legendItems.filter((item) => item.value > 0);
  const total = chartItems.reduce((sum, item) => sum + item.value, 0);
  const totalOfLegends = legendItems.reduce((sum, item) => sum + item.value, 0);

  if (legendItems.length === 0 || total <= 0) {
    return null;
  }

  const outerRadius = semiDonutChartConfig.size / 2;
  const innerRadius = outerRadius * semiDonutChartConfig.ratio;
  const ringWidth = outerRadius - innerRadius;
  const strokeRadius = (outerRadius + innerRadius) / 2;
  let startPercent = 0;
  const totalValueText = formatValueText(
    totalOfLegends,
    valuePrefix,
    valueSuffix,
  );

  return (
    <div
      style={{
        alignItems: "center",
        backgroundColor: "#ffffff",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "16px 0",
        transform: "scale(0.9)",
        transformOrigin: "top center",
        width: "100%",
      }}
    >
      <ChartTitlePreview title={chartTitle} />
      <div style={{ maxWidth: "390px", position: "relative", width: "100%" }}>
        <svg
          viewBox="0 0 390 180"
          width="100%"
          style={{ display: "block", maxWidth: "390px" }}
        >
          {chartItems.map((item, arcIndex) => {
            const color = dataVisAt(item.index).value;
            const exactPercent = (item.value / total) * 100;
            const adjustedStartPercent =
              arcIndex === 0 ? startPercent : startPercent + 0.5;
            const endPercent = startPercent + exactPercent;
            startPercent = endPercent;
            if (endPercent - adjustedStartPercent <= 0) {
              return null;
            }

            const startAngle = 180 + adjustedStartPercent * 1.8;
            const endAngle = 180 + endPercent * 1.8;
            return (
              <path
                key={`${item.label}-${item.index}`}
                d={describeArc(195, 159, strokeRadius, startAngle, endAngle)}
                fill="none"
                stroke={color}
                strokeWidth={ringWidth}
                strokeLinecap="butt"
              />
            );
          })}
        </svg>
        {showTotalValue ? (
          <div
            style={{
              alignItems: "center",
              bottom: "30px",
              display: "flex",
              flexDirection: "column",
              left: 0,
              position: "absolute",
              right: 0,
            }}
          >
            <div
              style={{
                color: chartTextPrimaryHex,
                textAlign: "center",
                ...typographyTokenToCss(typography.totalValue.title),
              }}
            >
              {totalValueTitle}
            </div>
            <div
              style={{
                color: chartTextPrimaryHex,
                letterSpacing: "0px",
                marginTop: "2px",
                textAlign: "center",
                whiteSpace: "nowrap",
                ...typographyTokenToCss(typography.totalValue.value),
              }}
            >
              {totalValueText}
            </div>
          </div>
        ) : null}
      </div>
      <LegendPreview
        items={legendItems}
        legendStyle={legendStyle}
        total={total}
        showPercentage={showPercentage}
        valuePrefix={valuePrefix}
        valueSuffix={valueSuffix}
      />
    </div>
  );
}

export default SemiDonutChartPreview;
