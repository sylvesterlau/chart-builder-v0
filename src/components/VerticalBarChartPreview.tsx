import { h } from "preact";
import { buildTicks, clamp, formatAxisNumber, niceMax } from "../helpers";
import { VerticalBarChartConfig } from "../types";

interface VerticalBarChartPreviewProps {
  config: VerticalBarChartConfig;
}

function VerticalBarChartPreview({ config }: VerticalBarChartPreviewProps) {
  const visibleSeries =
    config.barMode === "single" ? config.series.slice(0, 1) : config.series.slice(0, 2);
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
  const plotWidth = 304;
  const yAxisLabelX = 312;

  return (
    <div
      style={{
        background: "#ffffff",
        boxSizing: "border-box",
        color: "#333333",
        fontFamily: "Inter, sans-serif",
        height: "280px",
        overflow: "hidden",
        padding: "16px",
        transform: "scale(0.9)",
        transformOrigin: "top center",
        width: "390px",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: "12px",
          fontWeight: 700,
          height: "16px",
          justifyContent: "flex-end",
          lineHeight: "16px",
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
            left: 0,
            position: "absolute",
            top: "9px",
            width: `${plotWidth}px`,
          }}
        >
          {ticks.map((tick) => {
            const y = clamp(1 - tick / maxValue, 0, 1) * plotHeight;
            return (
              <div
                key={tick}
                style={{
                  alignItems: "center",
                  display: "flex",
                  height: "1px",
                  left: 0,
                  position: "absolute",
                  top: `${y}px`,
                  width: `${plotWidth}px`,
                }}
              >
                <div
                  style={{
                    background: tick === 0 ? "#333333" : "#F1F1F1",
                    height: tick === 0 ? "2px" : "1px",
                    width: `${plotWidth}px`,
                  }}
                />
                <div
                  style={{
                    fontSize: "12px",
                    left: `${yAxisLabelX}px`,
                    lineHeight: "16px",
                    position: "absolute",
                    top: "-8px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatAxisNumber(tick)}
                </div>
              </div>
            );
          })}
          <div
            style={{
              background: "#333333",
              height: `${plotHeight}px`,
              position: "absolute",
              left: `${plotWidth - 1}px`,
              top: 0,
              width: "1px",
            }}
          />
          <div
            style={{
              alignItems: "stretch",
              display: "flex",
              height: `${plotHeight}px`,
              position: "absolute",
              top: 0,
              width: `${plotWidth}px`,
            }}
          >
            {labels.map((label, labelIndex) => {
              const groupWidth = plotWidth / labels.length;
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
                  key={`${label}-${labelIndex}`}
                  style={{
                    flex: "1 1 0",
                    height: "100%",
                    position: "relative",
                  }}
                >
                  {labelIndex === config.selectedIndex ? (
                    <div
                      style={{
                        background: "rgba(0,0,0,0.08)",
                        height: "100%",
                        inset: 0,
                        position: "absolute",
                      }}
                    />
                  ) : null}
                  {visibleSeries.map((series, seriesIndex) => {
                    const value = clamp(
                      Number(series.values[labelIndex]) || 0,
                      0,
                      maxValue,
                    );
                    const barHeight = Math.max(1, (value / maxValue) * plotHeight);
                    return (
                      <div
                        key={series.name}
                        style={{
                          background: series.color,
                          bottom: 0,
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
                  <div
                    style={{
                      bottom: "-20px",
                      fontSize: "12px",
                      left: 0,
                      lineHeight: "16px",
                      position: "absolute",
                      textAlign: "center",
                      width: "100%",
                    }}
                  >
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
          <div
            style={{
              bottom: "-44px",
              fontSize: "12px",
              fontWeight: 700,
              left: 0,
              lineHeight: "16px",
              position: "absolute",
              textAlign: "center",
              width: `${plotWidth}px`,
            }}
          >
            {config.xAxisTitle}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerticalBarChartPreview;
