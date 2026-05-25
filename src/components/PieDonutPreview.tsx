import { h } from "preact";
import {
  chartBackground,
  dataVisAt,
  getPieChartAreaHeight,
  pieChartConfig,
  textColor,
  typography,
} from "../config";
import { formatLegendPercentageDisplay } from "../helpers";
import { LegendStyle, PiePageChartKind } from "../types";
import { ChartItem } from "./ChartItemInput";
import ChartTitlePreview from "./ChartTitlePreview";
import LegendPreview from "./LegendPreview";
import { useColorTokenResolved } from "./ColorChips/colorTokenSwatchContext";
import { useNumberTokenResolved } from "./NumChips/numberTokenValueContext";
import { useTypographyTokenResolved } from "./TypographyChips/typographyTokenValueContext";
import {
  colorTokenPreviewBackground,
  colorTokenSwatchHex,
} from "../utils/colorTokenDisplay";
import { numberTokenResolvedValue } from "../utils/numberTokenDisplay";
import { typographyTokenResolvedMetrics } from "../utils/typographyTokenDisplay";

const PREVIEW_SCALE = 0.85;

interface PieDonutPreviewProps {
  chartKind: Exclude<PiePageChartKind, "semiDonut">;
  frameWidth: number;
  chartSize: number;
  chartTitle: string;
  items: ChartItem[];
  legendStyle: LegendStyle;
  showIndicator: boolean;
  showIndicatorPercentage: boolean;
  indicatorLineExtend: number;
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
  frameWidth,
  chartSize,
  chartTitle,
  items,
  legendStyle,
  showIndicator,
  showIndicatorPercentage,
  indicatorLineExtend,
  showPercentage,
  valuePrefix,
  valueSuffix,
}: PieDonutPreviewProps) {
  const { values: resolvedNumbers } = useNumberTokenResolved();
  const { values: resolvedColors } = useColorTokenResolved();
  const { values: resolvedTypography } = useTypographyTokenResolved();
  const chartTextPrimary = colorTokenPreviewBackground(
    textColor.primary,
    resolvedColors,
  );
  const chartBg = colorTokenPreviewBackground(chartBackground, resolvedColors);
  const indicatorLabelMetrics = typographyTokenResolvedMetrics(
    typography.indicator.label,
    resolvedTypography,
  );
  const indicatorPercentMetrics = typographyTokenResolvedMetrics(
    typography.indicator.percentage,
    resolvedTypography,
  );
  const sliceStrokeWeight = numberTokenResolvedValue(
    pieChartConfig.indicator.sliceStrokeWeight,
    resolvedNumbers,
  );
  const leaderLineStrokeWeight = numberTokenResolvedValue(
    pieChartConfig.indicator.leaderLineStrokeWeight,
    resolvedNumbers,
  );
  const frameHeight = getPieChartAreaHeight(
    frameWidth,
    chartSize,
    showIndicator,
    showIndicatorPercentage,
    indicatorLineExtend,
  );
  const centerX = frameWidth / 2;
  const centerY = frameHeight / 2;
  const pieRadius = chartSize / 2;
  const indicatorScale = pieRadius / pieChartConfig.radius;
  const lineExtend = indicatorLineExtend * indicatorScale;
  const labelCenterOffset =
    pieChartConfig.indicator.labelCenterOffset * indicatorScale;
  const donutInnerRadius = pieRadius * pieChartConfig.donutInnerRadiusRatio;
  const previewLayoutWidth = Math.round(frameWidth * PREVIEW_SCALE);
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
        boxSizing: "border-box",
        display: "flex",
        flexShrink: 0,
        justifyContent: "center",
        width: `max(100%, ${previewLayoutWidth}px)`,
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: `${previewLayoutWidth}px`,
        }}
      >
        <div
          style={{
            alignItems: "center",
            backgroundColor: chartBg,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            maxWidth: `${frameWidth}px`,
            padding: "16px 0",
            transform: `scale(${PREVIEW_SCALE})`,
            transformOrigin: "top left",
            width: `${frameWidth}px`,
          }}
        >
          <ChartTitlePreview title={chartTitle} />
          <div
            style={{
              maxWidth: `${frameWidth}px`,
              position: "relative",
              width: "100%",
            }}
          >
            <svg
              viewBox={`0 0 ${frameWidth} ${frameHeight}`}
              width="100%"
              style={{ display: "block", maxWidth: `${frameWidth}px` }}
            >
              {slices.map(
                ({ item, startAngle, endAngle, midAngle, percentage }) => {
                  const color = colorTokenSwatchHex(
                    dataVisAt(item.index),
                    resolvedColors,
                  );
                  const path =
                    chartKind === "donut"
                      ? describeDonutSlice(
                          centerX,
                          centerY,
                          pieRadius,
                          donutInnerRadius,
                          startAngle,
                          endAngle,
                        )
                      : describePieSlice(
                          centerX,
                          centerY,
                          pieRadius,
                          startAngle,
                          endAngle,
                        );
                  const lineEndPoint = polarToCartesian(
                    centerX,
                    centerY,
                    pieRadius + lineExtend,
                    midAngle,
                  );
                  const lineStartPoint =
                    chartKind === "donut"
                      ? polarToCartesian(
                          centerX,
                          centerY,
                          donutInnerRadius,
                          midAngle,
                        )
                      : { x: centerX, y: centerY };
                  const labelCenterPoint = polarToCartesian(
                    centerX,
                    centerY,
                    pieRadius + lineExtend + labelCenterOffset,
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
                          strokeWidth={leaderLineStrokeWeight}
                        />
                      ) : null}
                      <path
                        d={path}
                        fill={color}
                        stroke={chartBg}
                        strokeWidth={sliceStrokeWeight}
                      />
                      {showIndicator ? (
                        <text
                          x={labelCenterPoint.x}
                          y={labelCenterPoint.y}
                          fill={chartTextPrimary}
                          fontFamily={`${indicatorLabelMetrics.fontFamily}, sans-serif`}
                          fontSize={indicatorLabelMetrics.fontSize}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={labelCenterPoint.x}
                            dy={showIndicatorPercentage ? "-0.6em" : "0"}
                            fontWeight={indicatorLabelMetrics.fontWeight}
                          >
                            {item.label || `Item ${item.index + 1}`}
                          </tspan>
                          {showIndicatorPercentage ? (
                            <tspan
                              x={labelCenterPoint.x}
                              dy="1.2em"
                              fontWeight={indicatorPercentMetrics.fontWeight}
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
      </div>
    </div>
  );
}

export default PieDonutPreview;
