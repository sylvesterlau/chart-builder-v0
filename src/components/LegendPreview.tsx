import { h } from "preact";
import {
  dividerColor,
  dataVisAt,
  legendSpacingConfig,
  textColor,
  typography,
} from "../config";
import { typographyTokenToCss } from "../utils/chartTypography";
import { formatLegendPercentageDisplay } from "../helpers";
import { LegendStyle } from "../types";

const chartTextPrimaryHex = textColor.primary.value;
const legendDividerHex = dividerColor.value;

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

  const rowPadding = `${legendSpacingConfig.verticalPadding}px ${legendSpacingConfig.horizontalPadding}px`;
  const rowGap = `${legendSpacingConfig.gap}px`;

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {items.map((item, index) => {
        const color = dataVisAt(item.index).value;
        const percent = total > 0 ? (item.value / total) * 100 : 0;
        const label = item.label || `Item ${item.index + 1}`;
        const rowBase = {
          borderBottom: `1px solid ${legendDividerHex}`,
          boxSizing: "border-box" as const,
          padding: rowPadding,
          width: "100%",
        };

        if (legendStyle === "topAndBottom") {
          return (
            <div
              key={`${label}-${index}`}
              style={{
                alignItems: "flex-start",
                display: "flex",
                gap: rowGap,
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
                    color: chartTextPrimaryHex,
                    width: "100%",
                    ...typographyTokenToCss(typography.legend.label),
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    alignItems: "center",
                    color: chartTextPrimaryHex,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "4px",
                    width: "100%",
                    ...typographyTokenToCss(typography.legend.label),
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      fontWeight: typography.legend.value.fontWeight,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatLegendValue(item.value, valuePrefix, valueSuffix)}
                  </span>
                  {showPercentage ? (
                    <span
                      style={{
                        flexShrink: 0,
                        fontWeight: typography.legend.percentage.fontWeight,
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
              gap: rowGap,
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
                color: chartTextPrimaryHex,
                flex: 1,
                minWidth: 0,
                ...typographyTokenToCss(typography.legend.label),
              }}
            >
              {showPercentage
                ? `${label} (${inlinePercentageFormatter(percent)}%)`
                : label}
            </div>
            <div
              style={{
                color: chartTextPrimaryHex,
                flexShrink: 0,
                whiteSpace: "nowrap",
                ...typographyTokenToCss(typography.legend.value),
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
