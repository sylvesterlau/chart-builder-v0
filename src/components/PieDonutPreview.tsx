import { h } from "preact";
import { dataVisAt, pieChartConfig, textColor, typography } from "../config";
import { formatLegendPercentageDisplay } from "../helpers";
import { LegendStyle, PiePageChartKind } from "../types";
import { ChartItem } from "./ChartItemInput";
import ChartTitlePreview from "./ChartTitlePreview";
import LegendPreview from "./LegendPreview";

const chartTextPrimaryHex = textColor.primary.value;

const PIE_PREVIEW_WIDTH = pieChartConfig.frameWidth;
const PIE_PREVIEW_HEIGHT = pieChartConfig.frameHeight;
const PIE_CENTER_X = PIE_PREVIEW_WIDTH / 2;
const PIE_CENTER_Y = PIE_PREVIEW_HEIGHT / 2;
const INDICATOR_LINE_EXTEND = pieChartConfig.indicator.lineExtend;
const INDICATOR_LABEL_CENTER_OFFSET =
  pieChartConfig.indicator.labelCenterOffset;

interface PieDonutPreviewProps {
  chartKind: Exclude<PiePageChartKind, "semiDonut">;
  chartTitle: string;
  items: ChartItem[];
  legendStyle: LegendStyle;
  showIndicator: boolean;
  showIndicatorPercentage: boolean;
  showPercentage: boolean;
  valuePrefix: string;
  valueSuffix: string;
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

function describePieSlice(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(centerX, centerY, radius, startAngle);
  const end = polarToCartesian(centerX, centerY, radius, endAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${centerX} ${centerY}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

function describeDonutSlice(
  centerX: number,
  centerY: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number,
) {
  const startOuter = polarToCartesian(
    centerX,
    centerY,
    outerRadius,
    startAngle,
  );
  const endOuter = polarToCartesian(centerX, centerY, outerRadius, endAngle);
  const startInner = polarToCartesian(
    centerX,
    centerY,
    innerRadius,
    startAngle,
  );
  const endInner = polarToCartesian(centerX, centerY, innerRadius, endAngle);
  const sweep = endAngle - startAngle;
  const largeArcFlag = Math.abs(sweep) > 180 ? 1 : 0;
  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${endInner.x} ${endInner.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startInner.x} ${startInner.y}`,
    "Z",
  ].join(" ");
}

function PieDonutPreview({
  chartKind,
  chartTitle,
  items,
  legendStyle,
  showIndicator,
  showIndicatorPercentage,
  showPercentage,
  valuePrefix,
  valueSuffix,
}: PieDonutPreviewProps) {
  const pieRadius = showIndicator
    ? pieChartConfig.radius
    : pieChartConfig.radiusLarge;
  const donutInnerRadius = pieRadius * pieChartConfig.donutInnerRadiusRatio;
  const legendItems = items
    .map((item, index) => ({ ...item, index }))
    .filter((item) => item.label.trim() !== "" || item.value > 0);
  const chartItems = legendItems.filter((item) => item.value > 0);
  const total = chartItems.reduce((sum, item) => sum + item.value, 0);

  if (legendItems.length === 0 || total <= 0) {
    return null;
  }

  let currentStartAngle = -90;
  const slices = chartItems.map((item) => {
    const sweepAngle = (item.value / total) * 360;
    const startAngle = currentStartAngle;
    const endAngle = startAngle + sweepAngle;
    currentStartAngle = endAngle;
    return {
      item,
      startAngle,
      endAngle,
      midAngle: startAngle + sweepAngle / 2,
      percentage: (item.value / total) * 100,
    };
  });

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
      <div style={{ maxWidth: "390px", width: "100%" }}>
        <svg
          viewBox={`0 0 ${PIE_PREVIEW_WIDTH} ${PIE_PREVIEW_HEIGHT}`}
          width="100%"
          style={{ display: "block", maxWidth: "390px" }}
        >
          {slices.map(
            ({ item, startAngle, endAngle, midAngle, percentage }) => {
              const color = dataVisAt(item.index).value;
              const path =
                chartKind === "donut"
                  ? describeDonutSlice(
                      PIE_CENTER_X,
                      PIE_CENTER_Y,
                      pieRadius,
                      donutInnerRadius,
                      startAngle,
                      endAngle,
                    )
                  : describePieSlice(
                      PIE_CENTER_X,
                      PIE_CENTER_Y,
                      pieRadius,
                      startAngle,
                      endAngle,
                    );
              const lineEndPoint = polarToCartesian(
                PIE_CENTER_X,
                PIE_CENTER_Y,
                pieRadius + INDICATOR_LINE_EXTEND,
                midAngle,
              );
              const lineStartPoint =
                chartKind === "donut"
                  ? polarToCartesian(
                      PIE_CENTER_X,
                      PIE_CENTER_Y,
                      donutInnerRadius,
                      midAngle,
                    )
                  : { x: PIE_CENTER_X, y: PIE_CENTER_Y };
              const labelCenterPoint = polarToCartesian(
                PIE_CENTER_X,
                PIE_CENTER_Y,
                pieRadius +
                  INDICATOR_LINE_EXTEND +
                  INDICATOR_LABEL_CENTER_OFFSET,
                midAngle,
              );
              return (
                <g key={`${item.label}-${item.index}`}>
                  {showIndicator ? (
                    <line
                      x1={lineStartPoint.x}
                      y1={lineStartPoint.y}
                      x2={lineEndPoint.x}
                      y2={lineEndPoint.y}
                      stroke={color}
                      strokeWidth={
                        pieChartConfig.indicator.leaderLineStrokeWeight
                      }
                    />
                  ) : null}
                  <path
                    d={path}
                    fill={color}
                    stroke="#ffffff"
                    strokeWidth={pieChartConfig.indicator.sliceStrokeWeight}
                  />
                  {showIndicator ? (
                    <text
                      x={labelCenterPoint.x}
                      y={labelCenterPoint.y}
                      fill={chartTextPrimaryHex}
                      fontFamily={`${typography.indicator.label.fontFamily}, sans-serif`}
                      fontSize={typography.indicator.label.fontSize}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={labelCenterPoint.x}
                        dy={showIndicatorPercentage ? "-0.6em" : "0"}
                        fontWeight={typography.indicator.label.fontWeight}
                      >
                        {item.label || `Item ${item.index + 1}`}
                      </tspan>
                      {showIndicatorPercentage ? (
                        <tspan
                          x={labelCenterPoint.x}
                          dy="1.2em"
                          fontWeight={typography.indicator.percentage.fontWeight}
                        >
                          {formatLegendPercentageDisplay(percentage)}%
                        </tspan>
                      ) : null}
                    </text>
                  ) : null}
                </g>
              );
            },
          )}
        </svg>
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

export default PieDonutPreview;
