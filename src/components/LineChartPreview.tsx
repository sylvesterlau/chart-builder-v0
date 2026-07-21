import { h } from "preact";
import { chartBackground, dataVisColor, textColor } from "../config";
import {
  cartesianRulerY,
  clamp,
  formatAxisTickLabel,
  isCartesianXAxisLineVisible,
  isCartesianYAxisLineVisible,
  measurePreviewTextWidth,
  measureYAxisLabelGutter,
  measureYAxisTickLabelWidth,
  normalizeYAxisDivisions,
  resolveLineScale,
  valueToY,
  Y_AXIS_LABEL_AXIS_GAP,
} from "../helpers";
import { LineChartConfig } from "../types";
import { useColorTokenResolved } from "./ColorChips/colorTokenSwatchContext";
import { useTypographyTokenResolved } from "./TypographyChips/typographyTokenValueContext";
import {
  colorTokenPreviewBackground,
  colorTokenSwatchHex,
} from "../utils/colorTokenDisplay";
import {
  typographyResolvedLineHeight,
  typographyTokenToPreviewCss,
} from "../utils/typographyTokenDisplay";
import { buildLineKeyInfo } from "../utils/cartesianKeyInfo";
import { buildLineTooltip } from "../utils/cartesianTooltip";
import CartesianKeyInfoPreview from "./CartesianKeyInfoPreview";
import CartesianTooltipPreview from "./CartesianTooltipPreview";
import ChartTitlePreview from "./ChartTitlePreview";

interface LineChartPreviewProps {
  config: LineChartConfig;
}

function createLinePath(
  values: number[],
  minValue: number,
  maxValue: number,
  width: number,
  height: number,
): string {
  if (values.length === 0) return "";
  return values
    .map((rawValue, index) => {
      const x = values.length === 1 ? 0 : (index / (values.length - 1)) * width;
      const y = valueToY(rawValue, minValue, maxValue, height);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function markerStyle(seriesIndex: number, color: string, chartBgColor: string) {
  if (seriesIndex === 1) {
    return {
      background: color,
      outline: `1.5px solid ${chartBgColor}`,
      height: "9.5px",
      width: "9.5px",
    };
  }
  if (seriesIndex === 2) {
    return {
      background: color,
      filter: `drop-shadow(0 0 0 ${chartBgColor}) drop-shadow(0 0 1.5px ${chartBgColor})`,
      clipPath: "polygon(50% 0, 100% 100%, 0 100%)",
      height: "11px",
      width: "12px",
    };
  }
  return {
    background: color,
    outline: `1.5px solid ${chartBgColor}`,
    borderRadius: "50%",
    height: "11px",
    width: "11px",
  };
}

function LineChartPreview({ config }: LineChartPreviewProps) {
  const { values: resolvedColors } = useColorTokenResolved();
  const { values: resolvedTypography } = useTypographyTokenResolved();

  const visibleSeries = config.series;
  const yAxisDivisions = normalizeYAxisDivisions(config.yAxisDivisions);
  const {
    minValue,
    maxValue,
    ticks,
  } = resolveLineScale(
    visibleSeries.reduce<number[]>(
      (values, series) => values.concat(series.values),
      [],
    ),
    Number(config.minValue),
    Number(config.maxValue),
    yAxisDivisions,
  );
  const valueRange = Math.max(1, maxValue - minValue);
  const { labelBg } = config.color.selected;
  const { typography: ty, yAxisLabel: yLab } = config.color;
  const yAxisDataType = config.yAxisDataType ?? "number";
  const showYAxisTitle =
    yAxisDataType !== "percentage" && config.yAxisTitle.trim().length > 0;
  const xAxisTitle = String(config.xAxisTitle ?? "").trim();
  const yTitleRowHeight = showYAxisTitle
    ? typographyResolvedLineHeight(ty.yAxisTitle, resolvedTypography)
    : 0;
  const contentWidth = Math.max(1, config.width - 32);
  const contentHeight = Math.max(1, config.height - 24 - yTitleRowHeight);
  const plotHeight = Math.max(
    1,
    contentHeight - (xAxisTitle ? 54 : 30),
  );
  const rulerY = cartesianRulerY(minValue, maxValue, plotHeight);
  const yAxisLabelCss = typographyTokenToPreviewCss(yLab, resolvedTypography);
  const measureYAxisLabelWidth = (text: string) =>
    measurePreviewTextWidth(text, yAxisLabelCss);
  const labelGutter = measureYAxisLabelGutter(
    ticks,
    yAxisDataType,
    measureYAxisLabelWidth,
  );
  const plotWidth = Math.max(1, contentWidth - labelGutter);
  const xAxisWidth = Math.max(1, plotWidth - 1);
  const lineWidth =
    config.lineRange === "full" ? xAxisWidth : Math.round(plotWidth * 0.788);
  const yAxisPosition = config.yAxisPosition ?? "right";
  const plotX = yAxisPosition === "right" ? 0 : labelGutter;
  const xAxisLabels = config.xAxisLabels.length
    ? config.xAxisLabels
    : ["", "", "", "", "", "", ""];
  const showXAxisLine = isCartesianXAxisLineVisible(config.axisLineVisibility);
  const showYAxisLine = isCartesianYAxisLineVisible(config.axisLineVisibility);
  const axisLineColor = colorTokenPreviewBackground(
    config.color.axisLine,
    resolvedColors,
  );
  const gridLineColor = colorTokenPreviewBackground(
    config.color.gridLine,
    resolvedColors,
  );
  const chartBgColor = colorTokenPreviewBackground(
    chartBackground,
    resolvedColors,
  );
  const yAxisTitleCss = typographyTokenToPreviewCss(
    ty.yAxisTitle,
    resolvedTypography,
  );
  const xAxisLabelCss = typographyTokenToPreviewCss(
    ty.xAxisLabel,
    resolvedTypography,
  );
  const xAxisTitleCss = typographyTokenToPreviewCss(
    ty.xAxisTitle,
    resolvedTypography,
  );
  const defaultFontFamily = typographyTokenToPreviewCss(
    ty.xAxisLabel,
    resolvedTypography,
  ).fontFamily;
  const selectedIndex = config.selectedIndex;
  const hasSelection = selectedIndex >= 0;
  const markerIndex = hasSelection ? selectedIndex : config.pointCount - 1;
  const markerRatio =
    config.pointCount > 1 ? markerIndex / (config.pointCount - 1) : 0;
  const markerX = markerRatio * lineWidth;
  const selectedLabel = hasSelection
    ? config.pointLabels[selectedIndex] || `P${selectedIndex + 1}`
    : "";
  const selectedAnchorX = 16 + plotX + markerX;
  const chartTop = (config.chartTitle.trim() ? 46 : 0) + 100;

  return (
    <div
      style={{
        background: chartBgColor,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        width: `${config.width}px`,
      }}
    >
      <CartesianTooltipPreview
        anchorX={selectedAnchorX}
        chartTop={chartTop}
        chartWidth={config.width}
        data={buildLineTooltip(config)}
      />
      <ChartTitlePreview title={config.chartTitle} />
      <CartesianKeyInfoPreview data={buildLineKeyInfo(config)} />
      <div
        style={{
          background: chartBgColor,
          boxSizing: "border-box",
          color: colorTokenPreviewBackground(textColor.primary, resolvedColors),
          fontFamily: defaultFontFamily,
          height: `${config.height}px`,
          overflow: "hidden",
          padding: "0 16px 16px",
          transformOrigin: "top center",
          width: `${config.width}px`,
        }}
      >
        {showYAxisTitle ? (
          <div
            style={{
              display: "flex",
              height: `${yTitleRowHeight}px`,
              justifyContent:
                yAxisPosition === "right" ? "flex-end" : "flex-start",
              ...yAxisTitleCss,
            }}
          >
            {config.yAxisTitle}
          </div>
        ) : null}
        <div
          style={{
            height: `${contentHeight}px`,
            marginTop: showYAxisTitle ? "8px" : "0",
            position: "relative",
            width: `${contentWidth}px`,
          }}
        >
          <div
            style={{
              height: `${plotHeight}px`,
              left: `${plotX}px`,
              position: "absolute",
              top: "9px",
              width: `${plotWidth}px`,
              zIndex: 0,
            }}
          >
            {ticks.map((tick, index) => {
              const y =
                clamp(1 - (tick - minValue) / valueRange, 0, 1) * plotHeight;
              const labelText = formatAxisTickLabel(tick, yAxisDataType);
              const labelWidth = measureYAxisTickLabelWidth(
                tick,
                yAxisDataType,
                measureYAxisLabelWidth,
              );
              return (
                <div
                  key={`${tick}-${index}`}
                  style={{
                    height: "1px",
                    left: 0,
                    position: "absolute",
                    top: `${y}px`,
                    width: `${plotWidth}px`,
                  }}
                >
                  <div
                    style={{
                      background: showYAxisLine ? gridLineColor : "transparent",
                      height: "1px",
                      width: `${plotWidth}px`,
                    }}
                  />
                  <div
                    style={{
                      left:
                        yAxisPosition === "right"
                          ? `${plotWidth + Y_AXIS_LABEL_AXIS_GAP}px`
                          : `${-labelWidth - Y_AXIS_LABEL_AXIS_GAP}px`,
                      position: "absolute",
                      textAlign: yAxisPosition === "left" ? "right" : "left",
                      top: "-8px",
                      whiteSpace: "nowrap",
                      width:
                        yAxisPosition === "left"
                          ? `${labelWidth}px`
                          : undefined,
                      ...yAxisLabelCss,
                    }}
                  >
                    {labelText}
                  </div>
                </div>
              );
            })}
            <div
              style={{
                background: axisLineColor,
                height: `${plotHeight + 1}px`,
                left: yAxisPosition === "left" ? 0 : `${plotWidth - 1}px`,
                position: "absolute",
                top: "-1px",
                width: "1px",
              }}
            />
          </div>
          <div
            style={{
              height: `${plotHeight}px`,
              left: `${plotX}px`,
              position: "absolute",
              top: "9px",
              width: `${xAxisWidth}px`,
              zIndex: 1,
            }}
          >
            {xAxisLabels.map((label, index) => {
              const labelPosition =
                xAxisLabels.length <= 1
                  ? 0
                  : (index / (xAxisLabels.length - 1)) *
                    Math.max(0, xAxisWidth - 1);
              const isFirstLabel = index === 0;
              const isLastLabel = index === xAxisLabels.length - 1;
              return (
                <div
                  key={`${label}-${index}`}
                  style={{
                    height: `${plotHeight}px`,
                    left: `${labelPosition}px`,
                    position: "absolute",
                    top: 0,
                    width: "1px",
                  }}
                >
                  <div
                  style={{
                    background:
                      showXAxisLine && !isFirstLabel && !isLastLabel
                        ? gridLineColor
                        : "transparent",
                    height: `${plotHeight}px`,
                    left: 0,
                    position: "absolute",
                    top: 0,
                    width: "1px",
                  }}
                />
                {label ? (
                  <div
                    style={{
                      bottom: "-22px",
                      left: isLastLabel ? undefined : 0,
                      position: "absolute",
                      right: isLastLabel ? 0 : undefined,
                      textAlign: isFirstLabel
                        ? "left"
                        : isLastLabel
                          ? "right"
                          : "center",
                      transform:
                        isFirstLabel || isLastLabel
                          ? undefined
                          : "translateX(-50%)",
                      whiteSpace: "nowrap",
                      ...xAxisLabelCss,
                    }}
                  >
                    {label}
                  </div>
                ) : null}
                </div>
              );
            })}
            <div
              style={{
                background: axisLineColor,
                height: "1px",
                left: 0,
                position: "absolute",
                top: `${rulerY}px`,
                width: `${xAxisWidth}px`,
              }}
            />
            {xAxisTitle ? (
              <div
                style={{
                  bottom: "-44px",
                  left: 0,
                  position: "absolute",
                  textAlign: "center",
                  width: `${xAxisWidth}px`,
                  ...xAxisTitleCss,
                }}
              >
                {xAxisTitle}
              </div>
            ) : null}
          </div>
          <div
            style={{
              height: `${plotHeight}px`,
              left: `${plotX}px`,
              position: "absolute",
              top: "9px",
              width: `${lineWidth}px`,
              zIndex: 2,
            }}
          >
            <svg
              height={plotHeight}
              style={{ display: "block", overflow: "visible" }}
              viewBox={`0 0 ${lineWidth} ${plotHeight}`}
              width={lineWidth}
            >
              {visibleSeries.map((series, seriesIndex) => (
                <path
                  d={createLinePath(
                    series.values,
                    minValue,
                    maxValue,
                    lineWidth,
                    plotHeight,
                  )}
                  fill="none"
                  key={series.name}
                  stroke={colorTokenSwatchHex(
                    dataVisColor.general[seriesIndex],
                    resolvedColors,
                  )}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              ))}
            </svg>
            {hasSelection ? (
              <div
                style={{
                  borderLeft: `1px dashed ${axisLineColor}`,
                  bottom: 0,
                  left: `${markerX}px`,
                  position: "absolute",
                  top: "-40px",
                  transform: "translateX(-0.5px)",
                  width: 0,
                }}
              />
            ) : null}
            {hasSelection ? (
              <div
                style={{
                  alignItems: "center",
                  background: colorTokenPreviewBackground(
                    labelBg,
                    resolvedColors,
                  ),
                  bottom: "-22px",
                  color: colorTokenPreviewBackground(
                    textColor.onDark,
                    resolvedColors,
                  ),
                  display: "flex",
                  height: "18px",
                  justifyContent: "center",
                  left: `${markerX}px`,
                  padding: "0 8px 2px",
                  position: "absolute",
                  transform: "translateX(-50%)",
                  whiteSpace: "nowrap",
                  ...xAxisLabelCss,
                }}
              >
                {selectedLabel}
              </div>
            ) : null}
            {visibleSeries.map((series, seriesIndex) => {
              const value = clamp(
                Number(series.values[markerIndex]) || 0,
                minValue,
                maxValue,
              );
              const y = valueToY(value, minValue, maxValue, plotHeight);
              const seriesColor = colorTokenSwatchHex(
                dataVisColor.general[seriesIndex],
                resolvedColors,
              );
              return (
                <div
                  key={`${series.name}-marker`}
                  style={{
                    alignItems: "center",
                    display: "flex",
                    height: "12px",
                    justifyContent: "center",
                    left: `${markerX}px`,
                    position: "absolute",
                    top: `${y}px`,
                    transform: "translate(-50%, -50%)",
                    width: "12px",
                  }}
                >
                  <div
                    style={markerStyle(seriesIndex, seriesColor, chartBgColor)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LineChartPreview;
