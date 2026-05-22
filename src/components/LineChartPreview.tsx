import { h } from "preact";
import { chartBackground, dataVisColor, textColor } from "../config";
import {
  clamp,
  formatAxisNumber,
  isCartesianXAxisLineVisible,
  isCartesianYAxisLineVisible,
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
  const range = Math.max(1, maxValue - minValue);
  return values
    .map((rawValue, index) => {
      const x = values.length === 1 ? 0 : (index / (values.length - 1)) * width;
      const value = clamp(Number(rawValue) || 0, minValue, maxValue);
      const y = clamp(1 - (value - minValue) / range, 0, 1) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function markerStyle(
  seriesIndex: number,
  color: string,
  chartBgColor: string,
) {
  if (seriesIndex === 1) {
    return {
      background: color,
      outline: `1.5px solid ${chartBgColor}`,
      borderRadius: "1px",
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

  const visibleSeries =
    config.lineMode === "single"
      ? config.series.slice(0, 1)
      : config.series.slice(0, 3);
  const minValue = Number(config.minValue) || 0;
  const maxValue =
    Number(config.maxValue) > minValue ? Number(config.maxValue) : minValue + 1;
  const valueRange = Math.max(1, maxValue - minValue);
  const ticks =
    config.maxValue > config.minValue
      ? [
          Math.round(maxValue),
          Math.round(maxValue - valueRange / 3),
          Math.round(maxValue - (valueRange / 3) * 2),
          Math.round(minValue),
        ]
      : [maxValue, minValue];
  const { labelBg } = config.color.selected;
  const { typography: ty, yAxisLabel: yLab } = config.color;
  const yTitleRowHeight = typographyResolvedLineHeight(
    ty.yAxisTitle,
    resolvedTypography,
  );
  const contentWidth = Math.max(1, config.width - 32);
  const contentHeight = Math.max(1, config.height - 40 - yTitleRowHeight);
  const plotHeight = Math.max(1, contentHeight - 30);
  const labelGutter = 46;
  const plotWidth = Math.max(1, contentWidth - labelGutter);
  const xAxisWidth = Math.max(1, plotWidth - 1);
  const lineWidth =
    config.lineRange === "full" ? xAxisWidth : Math.round(plotWidth * 0.788);
  const yAxisPosition = config.yAxisPosition ?? "right";
  const plotX = yAxisPosition === "right" ? 0 : labelGutter;
  const yAxisLabelX = yAxisPosition === "right" ? plotWidth + 8 : -8;
  const xAxisLabels = config.xAxisLabels.length
    ? config.xAxisLabels
    : ["", "", "", "", "", "", ""];
  const xGroupWidth = xAxisWidth / xAxisLabels.length;
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
  const yAxisLabelCss = typographyTokenToPreviewCss(yLab, resolvedTypography);
  const xAxisLabelCss = typographyTokenToPreviewCss(
    ty.xAxisLabel,
    resolvedTypography,
  );
  const defaultFontFamily =
    typographyTokenToPreviewCss(ty.xAxisLabel, resolvedTypography).fontFamily;
  const selectedIndex = config.selectedIndex;
  const hasSelection = selectedIndex >= 0;
  const selectedRatio =
    hasSelection && config.pointCount > 1
      ? selectedIndex / (config.pointCount - 1)
      : 0;
  const selectedX = selectedRatio * lineWidth;
  const selectedLabel = hasSelection
    ? config.pointLabels[selectedIndex] || `P${selectedIndex + 1}`
    : "";

  return (
    <div
      style={{
        background: chartBgColor,
        boxSizing: "border-box",
        color: colorTokenPreviewBackground(textColor.primary, resolvedColors),
        fontFamily: defaultFontFamily,
        height: `${config.height}px`,
        overflow: "hidden",
        padding: "16px",
        transform: "scale(0.9)",
        transformOrigin: "top center",
        width: `${config.width}px`,
      }}
    >
      <div
        style={{
          display: "flex",
          height: `${yTitleRowHeight}px`,
          justifyContent: yAxisPosition === "right" ? "flex-end" : "flex-start",
          ...yAxisTitleCss,
        }}
      >
        {config.yAxisTitle}
      </div>
      <div
        style={{
          height: `${contentHeight}px`,
          marginTop: "8px",
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
                        ? `${yAxisLabelX}px`
                        : undefined,
                    position: "absolute",
                    right:
                      yAxisPosition === "left"
                        ? `${plotWidth - yAxisLabelX}px`
                        : undefined,
                    textAlign: yAxisPosition === "left" ? "right" : "left",
                    top: "-8px",
                    whiteSpace: "nowrap",
                    ...yAxisLabelCss,
                  }}
                >
                  {formatAxisNumber(tick)}
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
          {xAxisLabels.map((label, index) => (
            <div
              key={`${label}-${index}`}
              style={{
                height: `${plotHeight}px`,
                left: `${xGroupWidth * index}px`,
                position: "absolute",
                top: 0,
                width: `${xGroupWidth}px`,
              }}
            >
              <div
                style={{
                  background: showXAxisLine ? gridLineColor : "transparent",
                  height: `${plotHeight}px`,
                  left: `${xGroupWidth / 2}px`,
                  position: "absolute",
                  top: 0,
                  width: "1px",
                }}
              />
              {label ? (
                <div
                  style={{
                    bottom: "-22px",
                    left: "50%",
                    position: "absolute",
                    textAlign: "center",
                    transform: "translateX(-50%)",
                    whiteSpace: "nowrap",
                    ...xAxisLabelCss,
                  }}
                >
                  {label}
                </div>
              ) : null}
            </div>
          ))}
          <div
            style={{
              background: axisLineColor,
              height: "1px",
              left: 0,
              position: "absolute",
              top: `${plotHeight - 1}px`,
              width: `${xAxisWidth}px`,
            }}
          />
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
                left: `${selectedX}px`,
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
                background: colorTokenPreviewBackground(labelBg, resolvedColors),
                bottom: "-22px",
                color: colorTokenPreviewBackground(
                  textColor.onDark,
                  resolvedColors,
                ),
                display: "flex",
                height: "18px",
                justifyContent: "center",
                left: `${selectedX}px`,
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
          {hasSelection
            ? visibleSeries.map((series, seriesIndex) => {
                const value = clamp(
                  Number(series.values[selectedIndex]) || 0,
                  minValue,
                  maxValue,
                );
                const y =
                  clamp(1 - (value - minValue) / valueRange, 0, 1) *
                  plotHeight;
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
                      left: `${selectedX}px`,
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
              })
            : null}
        </div>
      </div>
    </div>
  );
}

export default LineChartPreview;
