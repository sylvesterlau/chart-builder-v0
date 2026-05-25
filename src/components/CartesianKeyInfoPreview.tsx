import { h } from "preact";
import { cartesianKeyInfoConfig, ds, textColor } from "../config";
import {
  CartesianKeyInfoData,
  formatPercentageChange,
} from "../utils/cartesianKeyInfo";
import { colorTokenPreviewBackground } from "../utils/colorTokenDisplay";
import { numberTokenResolvedValue } from "../utils/numberTokenDisplay";
import { typographyTokenToPreviewCss } from "../utils/typographyTokenDisplay";
import { useColorTokenResolved } from "./ColorChips/colorTokenSwatchContext";
import { useNumberTokenResolved } from "./NumChips/numberTokenValueContext";
import { useTypographyTokenResolved } from "./TypographyChips/typographyTokenValueContext";

interface CartesianKeyInfoPreviewProps {
  data: CartesianKeyInfoData;
}

function lineIndicator(index: number, color: string, chartBgColor: string) {
  const containerStyle = {
    alignItems: "center",
    display: "flex",
    height: 18,
    justifyContent: "center",
    position: "relative" as const,
    width: 18,
  };
  const lineStyle = {
    background: color,
    height: 2,
    left: 0,
    position: "absolute" as const,
    top: 8,
    width: 18,
  };

  if (index === 1) {
    return (
      <div style={containerStyle}>
        <div style={lineStyle} />
        <div
          style={{
            background: color,
            height: 9.5,
            outline: `1.5px solid ${chartBgColor}`,
            position: "relative",
            width: 9.5,
            zIndex: 1,
          }}
        />
      </div>
    );
  }
  if (index === 2) {
    return (
      <div style={containerStyle}>
        <div style={lineStyle} />
        <div
          style={{
            background: color,
            boxSizing: "border-box",
            clipPath: "polygon(50% 0, 100% 100%, 0 100%)",
            filter: `drop-shadow(0 -1.5px 0 ${chartBgColor}) drop-shadow(1.5px 1.5px 0 ${chartBgColor}) drop-shadow(-1.5px 1.5px 0 ${chartBgColor})`,
            height: 10.5,
            position: "relative",
            width: 11.5,
            zIndex: 1,
          }}
        />
      </div>
    );
  }
  return (
    <div style={containerStyle}>
      <div style={lineStyle} />
      <div
        style={{
          background: color,
          borderRadius: "50%",
          height: 11,
          outline: `1.5px solid ${chartBgColor}`,
          position: "relative",
          width: 11,
          zIndex: 1,
        }}
      />
    </div>
  );
}

function swatch(kind: CartesianKeyInfoData["kind"], index: number, color: string, chartBgColor: string) {
  if (kind === "line") {
    return lineIndicator(index, color, chartBgColor);
  }
  return <div style={{ background: color, height: 14, width: 14 }} />;
}

function CartesianKeyInfoPreview({ data }: CartesianKeyInfoPreviewProps) {
  const { values: resolvedColors } = useColorTokenResolved();
  const { values: resolvedNumbers } = useNumberTokenResolved();
  const { values: resolvedTypography } = useTypographyTokenResolved();
  const primaryText = colorTokenPreviewBackground(textColor.primary, resolvedColors);
  const chartBgColor = colorTokenPreviewBackground(ds.colors.background, resolvedColors);
  const rangeCss = typographyTokenToPreviewCss(
    cartesianKeyInfoConfig.typography.range,
    resolvedTypography,
  );
  const labelCss = typographyTokenToPreviewCss(
    cartesianKeyInfoConfig.typography.label,
    resolvedTypography,
  );
  const valueCss = typographyTokenToPreviewCss(
    cartesianKeyInfoConfig.typography.value,
    resolvedTypography,
  );
  const valueLargeCss = typographyTokenToPreviewCss(
    cartesianKeyInfoConfig.typography.valueLarge,
    resolvedTypography,
  );
  const rowValueCss = typographyTokenToPreviewCss(
    cartesianKeyInfoConfig.typography.rowValue,
    resolvedTypography,
  );
  const unitCss = typographyTokenToPreviewCss(
    cartesianKeyInfoConfig.typography.unit,
    resolvedTypography,
  );
  const changeCss = typographyTokenToPreviewCss(
    cartesianKeyInfoConfig.typography.change,
    resolvedTypography,
  );
  const horizontalPadding = numberTokenResolvedValue(
    cartesianKeyInfoConfig.spacing.horizontalPadding,
    resolvedNumbers,
  );
  const topPadding = numberTokenResolvedValue(
    cartesianKeyInfoConfig.spacing.topPadding,
    resolvedNumbers,
  );
  const bottomPadding = numberTokenResolvedValue(
    cartesianKeyInfoConfig.spacing.bottomPadding,
    resolvedNumbers,
  );
  const itemGap = numberTokenResolvedValue(
    cartesianKeyInfoConfig.spacing.itemGap,
    resolvedNumbers,
  );
  const rowGap = numberTokenResolvedValue(
    cartesianKeyInfoConfig.spacing.rowGap,
    resolvedNumbers,
  );
  const isRows = data.layout === "rows";

  if (data.items.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        boxSizing: "border-box",
        color: primaryText,
        display: "flex",
        flexDirection: "column",
        padding: `${topPadding}px ${horizontalPadding}px ${bottomPadding}px`,
        width: "100%",
      }}
    >
      {data.rangeLabel ? (
        <div style={{ whiteSpace: "nowrap", ...rangeCss }}>
          {data.rangeLabel}
        </div>
      ) : null}
      <div
        style={{
          display: "flex",
          flexDirection: isRows ? "column" : "row",
          gap: isRows ? rowGap : 0,
          width: "100%",
        }}
      >
        {data.items.map((item) => {
          const change = item.percentageChange;
          const changeColor =
            change === undefined
              ? primaryText
              : change < 0
                ? "#a8000b"
                : "#007873";
          return (
            <div
              key={item.label}
              style={{
                display: "flex",
                flex: isRows ? undefined : "1 1 0",
                flexDirection: isRows ? "row" : "column",
                minWidth: 0,
              }}
            >
              <div style={{ alignItems: "center", display: "flex", flex: isRows ? "1 1 0" : undefined, gap: 8, minWidth: 0 }}>
                <div
                  style={{
                    alignItems: "center",
                    display: "flex",
                    flexShrink: 0,
                    height: 20,
                    justifyContent: "center",
                    width: 18,
                  }}
                >
                  {swatch(data.kind, item.colorTokenIndex, item.color, chartBgColor)}
                </div>
                <div style={{ flex: "1 1 0", minWidth: 0, ...labelCss }}>
                  {item.label}
                </div>
              </div>
              <div
                style={{
                  alignItems: "baseline",
                  display: "flex",
                  flexShrink: 0,
                  gap: itemGap,
                  whiteSpace: "nowrap",
                }}
              >
                <span style={data.kind === "line" && !isRows ? valueLargeCss : isRows ? rowValueCss : valueCss}>
                  {item.value}
                </span>
                <span style={unitCss}>
                  {item.unit}
                </span>
                {change !== undefined ? (
                  <span style={{ color: changeColor, display: "flex", ...changeCss }}>
                    {change < 0 ? "-" : "+"}
                    {formatPercentageChange(change)}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CartesianKeyInfoPreview;
