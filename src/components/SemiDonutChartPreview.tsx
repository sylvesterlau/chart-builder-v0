import { h } from "preact";
import { chartBackground, textColor, typography } from "../config";
import {
  semiDonutGapPxToPercent,
  semiDonutRingWidthPxToRatio,
} from "../utils/chart/semiDonutCalculate";
import { dataVisAt } from "../utils/dataVisAt";
import { LegendStyle } from "../types";
import { ChartItem } from "./ChartItemInput";
import ChartTitlePreview from "./ChartTitlePreview";
import LegendPreview from "./LegendPreview";
import { useColorTokenResolved } from "./ColorChips/colorTokenSwatchContext";
import { useTypographyTokenResolved } from "./TypographyChips/typographyTokenValueContext";
import {
  colorTokenPreviewBackground,
  colorTokenSwatchHex,
} from "../utils/colorTokenDisplay";
import { typographyTokenToPreviewCss } from "../utils/typographyTokenDisplay";

const PREVIEW_SCALE = 0.85;

interface SemiDonutChartPreviewProps {
  frameWidth: number;
  chartSize: number;
  chartTitle: string;
  items: ChartItem[];
  legendStyle: LegendStyle;
  ringWidth: number;
  sliceGap: number;
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
  frameWidth,
  chartSize,
  chartTitle,
  items,
  legendStyle,
  ringWidth,
  sliceGap,
  showPercentage,
  valuePrefix,
  valueSuffix,
  showTotalValue,
  totalValueTitle,
}: SemiDonutChartPreviewProps) {
  const { values: resolvedColors } = useColorTokenResolved();
  const { values: resolvedTypography } = useTypographyTokenResolved();
  const chartTextPrimary = colorTokenPreviewBackground(
    textColor.primary,
    resolvedColors,
  );

  const legendItems = items
    .map((item, index) => ({ ...item, index }))
    .filter((item) => item.label.trim() !== "" || item.value > 0);
  const chartItems = legendItems.filter((item) => item.value > 0);
  const total = chartItems.reduce((sum, item) => sum + item.value, 0);
  const totalOfLegends = legendItems.reduce((sum, item) => sum + item.value, 0);

  if (legendItems.length === 0 || total <= 0) {
    return null;
  }

  const outerRadius = chartSize / 2;
  const innerRadiusRatio = semiDonutRingWidthPxToRatio(ringWidth, chartSize);
  const innerRadius = outerRadius * innerRadiusRatio;
  const ringWidthPx = outerRadius - innerRadius;
  const strokeRadius = (outerRadius + innerRadius) / 2;
  const gapPercent = semiDonutGapPxToPercent(
    sliceGap,
    chartSize,
    innerRadiusRatio,
  );
  let startPercent = 0;
  const totalValueText = formatValueText(
    totalOfLegends,
    valuePrefix,
    valueSuffix,
  );
  const chartAreaHeight = chartSize / 2;
  const chartCenterX = frameWidth / 2;
  const chartCenterY = chartSize / 2;
  const totalValueBottom = Math.round(chartSize * (30 / 318));
  const previewLayoutWidth = Math.round(frameWidth * PREVIEW_SCALE);

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
            backgroundColor: colorTokenPreviewBackground(
              chartBackground,
              resolvedColors,
            ),
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
              viewBox={`0 0 ${frameWidth} ${chartAreaHeight}`}
              width="100%"
              style={{ display: "block", maxWidth: `${frameWidth}px` }}
            >
              {chartItems.map((item, arcIndex) => {
                const color = colorTokenSwatchHex(
                  dataVisAt(item.index),
                  resolvedColors,
                );
                const exactPercent = (item.value / total) * 100;
                const adjustedStartPercent =
                  arcIndex === 0 ? startPercent : startPercent + gapPercent;
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
                    d={describeArc(
                      chartCenterX,
                      chartCenterY,
                      strokeRadius,
                      startAngle,
                      endAngle,
                    )}
                    fill="none"
                    stroke={color}
                    strokeWidth={ringWidthPx}
                    strokeLinecap="butt"
                  />
                );
              })}
            </svg>
            {showTotalValue ? (
              <div
                style={{
                  alignItems: "center",
                  bottom: `${totalValueBottom}px`,
                  display: "flex",
                  flexDirection: "column",
                  left: 0,
                  position: "absolute",
                  right: 0,
                }}
              >
                <div
                  style={{
                    color: chartTextPrimary,
                    textAlign: "center",
                    ...typographyTokenToPreviewCss(
                      typography.totalValue.title,
                      resolvedTypography,
                    ),
                  }}
                >
                  {totalValueTitle}
                </div>
                <div
                  style={{
                    color: chartTextPrimary,
                    letterSpacing: "0px",
                    marginTop: "2px",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    ...typographyTokenToPreviewCss(
                      typography.totalValue.value,
                      resolvedTypography,
                    ),
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
      </div>
    </div>
  );
}

export default SemiDonutChartPreview;
