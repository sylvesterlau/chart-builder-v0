import { h } from "preact";
import { dataVisColor } from "../config";
import { formatLegendPercentageDisplay } from "../helpers";
import { LegendStyle } from "../types";
import { ChartItem } from "./ChartItemInput";

interface HorizontalBarChartPreviewProps {
  chartTitle: string;
  items: ChartItem[];
  legendStyle: LegendStyle;
  showPercentage: boolean;
  valuePrefix: string;
  valueSuffix: string;
}

function formatPercent(value: number) {
  return value.toFixed(1);
}

function formatLegendValue(value: number, prefix: string, suffix: string) {
  const formattedValue = value.toFixed(2);
  const prefixText = prefix.trim();
  const suffixText = suffix.trim();
  return `${prefixText}${formattedValue}${suffixText ? ` ${suffixText}` : ""}`;
}

function HorizontalBarChartPreview({
  chartTitle,
  items,
  legendStyle,
  showPercentage,
  valuePrefix,
  valueSuffix,
}: HorizontalBarChartPreviewProps) {
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
        backgroundColor: "#ffffff",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "16px 0",
        width: "100%",
        // css transform to 80% size of the parent
        transform: "scale(0.9)",
        transformOrigin: "top center",
      }}
    >
      {chartTitle.trim() ? (
        <div
          style={{
            boxSizing: "border-box",
            display: "flex",
            padding: "8px 16px",
            width: "100%",
          }}
        >
          <div
            style={{
              color: "#333333",
              flex: 1,
              fontFamily: "Inter, sans-serif",
              fontSize: "23px",
              fontWeight: 500,
              letterSpacing: "0px",
              lineHeight: "30px",
              minWidth: 0,
            }}
          >
            {chartTitle}
          </div>
        </div>
      ) : null}
      <div
        style={{
          boxSizing: "border-box",
          display: "flex",
          gap: "2px",
          height: "12px",
          padding: "0 16px",
          overflow: "hidden",
          width: "100%",
        }}
      >
        {chartItems.map((item, index) => {
          const color = dataVisColor[item.index % dataVisColor.length].value;
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
      {legendStyle === "leftAndRight" || legendStyle === "topAndBottom" ? (
        <div
          style={{ display: "flex", flexDirection: "column", width: "100%" }}
        >
          {legendItems.map((item, index) => {
            const color = dataVisColor[item.index % dataVisColor.length].value;
            const percent = total > 0 ? (item.value / total) * 100 : 0;
            const label = item.label || `Item ${item.index + 1}`;
            const rowBase = {
              borderBottom: "1px solid #EDEDED",
              boxSizing: "border-box" as const,
              padding: "12px 16px",
              width: "100%",
            };
            if (legendStyle === "topAndBottom") {
              return (
                <div
                  key={`${label}-${index}`}
                  style={{
                    alignItems: "flex-start",
                    display: "flex",
                    gap: "8px",
                    ...rowBase,
                  }}
                >
                  <div
                    style={{
                      backgroundColor: color,
                      flexShrink: 0,
                      height: "14px",
                      width: "14px",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      flex: 1,
                      flexDirection: "column",
                      gap: "0px",
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        color: "#333333",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        fontWeight: 400,
                        lineHeight: "20px",
                        width: "100%",
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        alignItems: "center",
                        color: "#333333",
                        display: "flex",
                        flexWrap: "wrap",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        gap: "4px",
                        lineHeight: "20px",
                        width: "100%",
                      }}
                    >
                      <span
                        style={{
                          flexShrink: 0,
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatLegendValue(
                          item.value,
                          valuePrefix,
                          valueSuffix,
                        )}
                      </span>
                      {showPercentage ? (
                        <span
                          style={{
                            flexShrink: 0,
                            fontWeight: 400,
                            whiteSpace: "nowrap",
                          }}
                        >
                          ({formatLegendPercentageDisplay(percent)}%)
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <div
                key={`${label}-${index}`}
                style={{
                  alignItems: "center",
                  display: "flex",
                  gap: "8px",
                  ...rowBase,
                }}
              >
                <div
                  style={{
                    backgroundColor: color,
                    flexShrink: 0,
                    height: "14px",
                    width: "14px",
                  }}
                />
                <div
                  style={{
                    color: "#333333",
                    flex: 1,
                    fontFamily: "Inter, sans-serif",
                    fontSize: "14px",
                    fontWeight: 400,
                    lineHeight: "20px",
                    minWidth: 0,
                  }}
                >
                  {showPercentage
                    ? `${label} (${formatPercent(percent)}%)`
                    : label}
                </div>
                <div
                  style={{
                    color: "#333333",
                    flexShrink: 0,
                    fontFamily: "Inter, sans-serif",
                    fontSize: "14px",
                    fontWeight: 600,
                    lineHeight: "20px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatLegendValue(item.value, valuePrefix, valueSuffix)}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default HorizontalBarChartPreview;
