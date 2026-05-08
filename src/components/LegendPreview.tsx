import { h } from "preact";
import { dataVisColor } from "../config";
import { formatLegendPercentageDisplay } from "../helpers";
import { LegendStyle } from "../types";

export interface PreviewLegendItem {
  index: number;
  label: string;
  value: number;
}

interface LegendPreviewProps {
  items: PreviewLegendItem[];
  legendStyle: LegendStyle;
  total: number;
  showPercentage: boolean;
  valuePrefix: string;
  valueSuffix: string;
  inlinePercentageFormatter?: (value: number) => string;
}

function formatLegendValue(value: number, prefix: string, suffix: string) {
  const formattedValue = value.toFixed(2);
  const prefixText = prefix.trim();
  const suffixText = suffix.trim();
  return `${prefixText}${formattedValue}${suffixText ? ` ${suffixText}` : ""}`;
}

function LegendPreview({
  items,
  legendStyle,
  total,
  showPercentage,
  valuePrefix,
  valueSuffix,
  inlinePercentageFormatter = formatLegendPercentageDisplay,
}: LegendPreviewProps) {
  if (legendStyle !== "leftAndRight" && legendStyle !== "topAndBottom") {
    return null;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {items.map((item, index) => {
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
                    {formatLegendValue(item.value, valuePrefix, valueSuffix)}
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
              {showPercentage ? `${label} (${inlinePercentageFormatter(percent)}%)` : label}
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
  );
}

export default LegendPreview;
