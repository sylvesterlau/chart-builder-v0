import { h } from "preact";
import {
  chartBackground,
  pieChartConfig,
  textColor,
  typography,
} from "../config";
import {
  donutGapPxToPercent,
  donutRingWidthPxToRatio,
  getPieChartAreaHeight,
} from "../utils/chart/pieDonutCalculate";
import { dataVisAt } from "../utils/dataVisAt";
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
  sliceGap: number;
  donutRingWidth: number;
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
  sliceGap,
  donutRingWidth,
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
  const donutInnerRadiusRatio =
    chartKind === "donut"
      ? donutRingWidthPxToRatio(donutRingWidth, chartSize)
      : 0;
  const donutInnerRadius = pieRadius * donutInnerRadiusRatio;
  const donutStrokeRadius = (pieRadius + donutInnerRadius) / 2;
  const donutRingWidthPx = pieRadius - donutInnerRadius;
  const donutGapPercent =
    chartKind === "donut"
      ? donutGapPxToPercent(sliceGap, chartSize, donutInnerRadiusRatio)
      : 0;
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
  const pieSlices = chartItems.map((item) => {
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

  let donutStartPercent = 0;
  const donutSlices = chartItems.map((item, arcIndex) => {
    const exactPercent = (item.value / total) * 100;
    const adjustedStartPercent = donutStartPercent + donutGapPercent;
    const endPercent = donutStartPercent + exactPercent;
    donutStartPercent = endPercent;
    const startAngle = -90 + adjustedStartPercent * 3.6;
    const endAngle = -90 + endPercent * 3.6;
    return {
      item,
      startAngle,
      endAngle,
      midAngle: (startAngle + endAngle) / 2,
      percentage: exactPercent,
      visible: endPercent - adjustedStartPercent > 0,
    };
  });

  const slices = chartKind === "donut" ? donutSlices : pieSlices;

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
              {slices.map((slice) => {
                if ("visible" in slice && slice.visible === false) {
                  return null;
                }
                const { item, startAngle, endAngle, midAngle, percentage } =
                  slice;
                const color = colorTokenSwatchHex(
                  dataVisAt(item.index),
                  resolvedColors,
                );
                const sliceMarkup =
                  chartKind === "donut" ? (
                    <path
                      d={describeArc(
                        centerX,
                        centerY,
                        donutStrokeRadius,
                        startAngle,
                        endAngle,
                      )}
                      fill="none"
                      stroke={color}
                      strokeLinecap="butt"
                      strokeWidth={donutRingWidthPx}
                    />
                  ) : (
                    <path
                      d={describePieSlice(
                        centerX,
                        centerY,
                        pieRadius,
                        startAngle,
                        endAngle,
                      )}
                      fill={color}
                      stroke={chartBg}
                      strokeWidth={sliceGap}
                    />
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
                    {sliceMarkup}
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
              })}
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
