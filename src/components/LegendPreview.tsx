import { h } from "preact";
import {
  dividerColor,
  legendShapeConfig,
  legendSpacingConfig,
  textColor,
  typography,
} from "../config";
import { dataVisAt } from "../utils/dataVisAt";
import { buildLegendEntries } from "../utils/legendAggregate";
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
  const shapeSize = numberTokenResolvedValue(
    legendShapeConfig.size,
    resolvedNumbers,
  );
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

  const entries = buildLegendEntries(items);

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {entries.map((entry, index) => {
        const color = entry.transparentSwatch
          ? "transparent"
          : colorTokenSwatchHex(dataVisAt(entry.colorIndex), resolvedColors);
        const percent =
          entry.percentage !== null
            ? entry.percentage
            : total > 0
              ? (entry.value / total) * 100
              : 0;
        const rowShowPercentage = showPercentage && entry.showPercentage;
        const rowBase = {
          borderBottom: `1px solid ${legendDivider}`,
          boxSizing: "border-box" as const,
          padding: rowPadding,
          width: "100%",
        };

        if (legendStyle === "topAndBottom") {
          return (
            <div
              key={`${entry.kind}-${entry.label}-${index}`}
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
                  height: `${shapeSize}px`,
                  width: `${shapeSize}px`,
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
                  {entry.label}
                </div>
                {entry.showValue ? (
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
                      {formatLegendValue(
                        entry.value,
                        valuePrefix,
                        valueSuffix,
                      )}
                    </span>
                    {rowShowPercentage ? (
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
                ) : null}
              </div>
            </div>
          );
        }

        return (
          <div
            key={`${entry.kind}-${entry.label}-${index}`}
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
                height: `${shapeSize}px`,
                width: `${shapeSize}px`,
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
              {rowShowPercentage
                ? `${entry.label} (${inlinePercentageFormatter(percent)}%)`
                : entry.label}
            </div>
            {entry.showValue ? (
              <div
                style={{
                  color: chartTextPrimary,
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                  ...valueCss,
                }}
              >
                {formatLegendValue(entry.value, valuePrefix, valueSuffix)}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export default LegendPreview;
