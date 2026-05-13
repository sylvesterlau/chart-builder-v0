import { h } from "preact";
import { textColor } from "../config";
import {
  buildTicks,
  clamp,
  formatAxisNumber,
  isVerticalBarXAxisLineVisible,
  isVerticalBarYAxisLineVisible,
  niceMax,
  rgbaFromHex,
  verticalBarTextStyleToCss,
} from "../helpers";
import { VerticalBarChartConfig } from "../types";

interface VerticalBarChartPreviewProps {
  config: VerticalBarChartConfig;
}

function VerticalBarChartPreview({ config }: VerticalBarChartPreviewProps) {
  const visibleSeries =
    config.barMode === "single"
      ? config.series.slice(0, 1)
      : config.series.slice(0, 2);
  const maxValue = niceMax(
    Math.max(
      1,
      ...visibleSeries.reduce<number[]>(
        (values, series) => values.concat(series.values),
        [],
      ),
    ),
  );
  const ticks = buildTicks(maxValue, 3);
  const labels = config.labels.slice(0, config.periodCount);
  const plotHeight = 170;
  const labelGutter = 46;
  const plotWidth = 312;
  const yAxisPosition = config.yAxisPosition ?? "right";
  const plotX = yAxisPosition === "right" ? 0 : labelGutter;
  const yAxisLabelX = yAxisPosition === "right" ? plotWidth + 8 : -8;
  const groupWidth = labels.length > 0 ? plotWidth / labels.length : plotWidth;
  const showXAxisLine = isVerticalBarXAxisLineVisible(
    config.axisLineVisibility,
  );
  const showYAxisLine = isVerticalBarYAxisLineVisible(
    config.axisLineVisibility,
  );
  const axisLineColor = config.color.axisLine.value;
  const gridLineColor = config.color.gridLine.value;
  const { labelBg, highlightBg } = config.color.selected;
  const { typography: ty, yAxisLabel: yLab } = config.color;
  const highlightBgCss = rgbaFromHex(
    highlightBg.value,
    highlightBg.opacity ?? 0.08,
  );
  const xAxisLabelGap = 4;
  const xAxisLabelRowHeight = ty.xAxisLabel.lineHeight;
  const xAxisSelectedPillHeight = Math.max(18, xAxisLabelRowHeight);
  const xAxisLabelBottomOffset = xAxisLabelGap + xAxisLabelRowHeight;
  const xAxisSelectedBottomOffset = xAxisLabelGap + xAxisSelectedPillHeight;

  return (
    <div
      style={{
        background: "#ffffff",
        boxSizing: "border-box",
        color: textColor.primary.value,
        fontFamily: "Inter, sans-serif",
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
          height: `${ty.yAxisTitle.lineHeight}px`,
          justifyContent: yAxisPosition === "right" ? "flex-end" : "flex-start",
          ...verticalBarTextStyleToCss(ty.yAxisTitle),
        }}
      >
        {config.yAxisTitle}
      </div>
      <div
        style={{
          height: "224px",
          marginTop: "8px",
          position: "relative",
          width: "358px",
        }}
      >
        <div
          style={{
            height: `${plotHeight}px`,
            left: `${plotX}px`,
            position: "absolute",
            top: "9px",
            width: `${plotWidth}px`,
          }}
        >
          <div
            style={{
              height: `${plotHeight}px`,
              inset: 0,
              position: "absolute",
              width: `${plotWidth}px`,
              zIndex: 0,
            }}
          >
            {ticks.map((tick) => {
              const y = clamp(1 - tick / maxValue, 0, 1) * plotHeight;
              return (
                <div
                  key={tick}
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
                      ...verticalBarTextStyleToCss(yLab),
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
              inset: 0,
              position: "absolute",
              width: `${plotWidth}px`,
              zIndex: 1,
            }}
          >
            {labels.map((label, labelIndex) => {
              const isSelected = labelIndex === config.selectedIndex;
              return (
                <div
                  key={`${label}-${labelIndex}-x-axis`}
                  style={{
                    height: `${plotHeight}px`,
                    left: `${groupWidth * labelIndex}px`,
                    position: "absolute",
                    top: 0,
                    width: `${groupWidth}px`,
                  }}
                >
                  <div
                    style={{
                      background: showXAxisLine ? gridLineColor : "transparent",
                      height: `${plotHeight}px`,
                      left: `${groupWidth / 2}px`,
                      position: "absolute",
                      top: 0,
                      width: "1px",
                    }}
                  />
                  {isSelected ? null : (
                    <div
                      style={{
                        bottom: `-${xAxisLabelBottomOffset}px`,
                        left: 0,
                        position: "absolute",
                        textAlign: "center",
                        width: "100%",
                        ...verticalBarTextStyleToCss(ty.xAxisLabel),
                      }}
                    >
                      {label}
                    </div>
                  )}
                </div>
              );
            })}
            <div
              style={{
                background: axisLineColor,
                height: "1px",
                left: 0,
                position: "absolute",
                top: `${plotHeight - 1}px`,
                width: `${plotWidth}px`,
              }}
            />
            <div
              style={{
                bottom: "-44px",
                left: 0,
                position: "absolute",
                textAlign: "center",
                width: `${plotWidth}px`,
                ...verticalBarTextStyleToCss(ty.xAxisTitle),
              }}
            >
              {config.xAxisTitle}
            </div>
          </div>
          <div
            style={{
              alignItems: "stretch",
              display: "flex",
              height: `${plotHeight}px`,
              inset: 0,
              position: "absolute",
              width: `${plotWidth}px`,
              zIndex: 2,
            }}
          >
            {labels.map((label, labelIndex) => {
              const isSelected = labelIndex === config.selectedIndex;
              const barWidth =
                visibleSeries.length === 1
                  ? clamp(groupWidth * 0.16, 5, 12)
                  : clamp(groupWidth * 0.14, 5, 9);
              const gap =
                visibleSeries.length === 1 ? 0 : Math.max(3, barWidth * 0.75);
              const totalWidth =
                visibleSeries.length * barWidth +
                (visibleSeries.length - 1) * gap;
              return (
                <div
                  key={`${label}-${labelIndex}-bars`}
                  style={{
                    flex: "1 1 0",
                    height: "100%",
                    position: "relative",
                  }}
                >
                  {labelIndex === config.selectedIndex ? (
                    <div
                      style={{
                        background: highlightBgCss,
                        height: "100%",
                        inset: 0,
                        position: "absolute",
                      }}
                    />
                  ) : null}
                  {isSelected ? (
                    <div
                      style={{
                        borderLeft: `1px dashed ${axisLineColor}`,
                        height: "40px",
                        left: "50%",
                        position: "absolute",
                        top: "-40px",
                        transform: "translateX(-0.5px)",
                        width: 0,
                      }}
                    />
                  ) : null}
                  {visibleSeries.map((series, seriesIndex) => {
                    const value = clamp(
                      Number(series.values[labelIndex]) || 0,
                      0,
                      maxValue,
                    );
                    const barHeight = Math.max(
                      1,
                      (value / maxValue) * plotHeight,
                    );
                    return (
                      <div
                        key={series.name}
                        style={{
                          background: series.color,
                          bottom: "1px",
                          height: `${barHeight}px`,
                          left: `calc(50% - ${totalWidth / 2}px + ${
                            seriesIndex * (barWidth + gap)
                          }px)`,
                          position: "absolute",
                          width: `${barWidth}px`,
                        }}
                      />
                    );
                  })}
                  {isSelected ? (
                    <div
                      style={{
                        alignItems: "center",
                        background: labelBg.value,
                        bottom: `-${xAxisSelectedBottomOffset}px`,
                        color: textColor.onDark.value,
                        display: "flex",
                        height: `${xAxisSelectedPillHeight}px`,
                        justifyContent: "center",
                        left: "50%",
                        minWidth: "28px",
                        padding: "0 8px",
                        position: "absolute",
                        transform: "translateX(-50%)",
                        whiteSpace: "nowrap",
                        ...verticalBarTextStyleToCss(ty.xAxisLabel),
                      }}
                    >
                      {label}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerticalBarChartPreview;
