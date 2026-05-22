import { h } from "preact";
import {
  dividerColor,
  dataVisAt,
  legendSpacingConfig,
  textColor,
  typography,
} from "../config";
import { useColorTokenResolved } from "./ColorChips/colorTokenSwatchContext";
import { useNumberTokenResolved } from "./NumChips/numberTokenValueContext";
import { useTypographyTokenResolved } from "./TypographyChips/typographyTokenValueContext";
import { formatLegendPercentageDisplay } from "../helpers";
import {
  colorTokenPreviewBackground,
  colorTokenSwatchHex,
} from "../utils/colorTokenDisplay";
import { numberTokenResolvedValue } from "../utils/numberTokenDisplay";
import { typographyTokenToPreviewCss } from "../utils/typographyTokenDisplay";
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

  const { values: resolvedNumbers } = useNumberTokenResolved();
  const { values: resolvedColors } = useColorTokenResolved();
  const { values: resolvedTypography } = useTypographyTokenResolved();

  const chartTextPrimary = colorTokenPreviewBackground(
    textColor.primary,
    resolvedColors,
  );
  const legendDivider = colorTokenPreviewBackground(
    dividerColor,
    resolvedColors,
  );
  const verticalPadding = numberTokenResolvedValue(
    legendSpacingConfig.verticalPadding,
    resolvedNumbers,
  );
  const horizontalPadding = numberTokenResolvedValue(
    legendSpacingConfig.horizontalPadding,
    resolvedNumbers,
  );
  const gap = numberTokenResolvedValue(legendSpacingConfig.gap, resolvedNumbers);
  const rowPadding = `${verticalPadding}px ${horizontalPadding}px`;
  const rowGap = `${gap}px`;
  const labelCss = typographyTokenToPreviewCss(
    typography.legend.label,
    resolvedTypography,
  );
  const valueCss = typographyTokenToPreviewCss(
    typography.legend.value,
    resolvedTypography,
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {items.map((item, index) => {
        const color = colorTokenSwatchHex(dataVisAt(item.index), resolvedColors);
        const percent = total > 0 ? (item.value / total) * 100 : 0;
        const label = item.label || `Item ${item.index + 1}`;
        const rowBase = {
          borderBottom: `1px solid ${legendDivider}`,
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
                    color: chartTextPrimary,
                    width: "100%",
                    ...labelCss,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    alignItems: "center",
                    color: chartTextPrimary,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "4px",
                    width: "100%",
                    ...labelCss,
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      fontWeight: valueCss.fontWeight,
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
                color: chartTextPrimary,
                flex: 1,
                minWidth: 0,
                ...labelCss,
              }}
            >
              {showPercentage
                ? `${label} (${inlinePercentageFormatter(percent)}%)`
                : label}
            </div>
            <div
              style={{
                color: chartTextPrimary,
                flexShrink: 0,
                whiteSpace: "nowrap",
                ...valueCss,
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
