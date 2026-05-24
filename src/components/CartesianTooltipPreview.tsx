import { h } from "preact";
import { cartesianTooltipConfig, textColor } from "../config";
import { CartesianTooltipData } from "../utils/cartesianTooltip";
import { colorTokenPreviewBackground } from "../utils/colorTokenDisplay";
import { numberTokenResolvedValue } from "../utils/numberTokenDisplay";
import { typographyTokenToPreviewCss } from "../utils/typographyTokenDisplay";
import { useColorTokenResolved } from "./ColorChips/colorTokenSwatchContext";
import { useNumberTokenResolved } from "./NumChips/numberTokenValueContext";
import { useTypographyTokenResolved } from "./TypographyChips/typographyTokenValueContext";

interface CartesianTooltipPreviewProps {
  anchorX: number;
  chartTop: number;
  data: CartesianTooltipData | null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function tooltipHeight(itemCount: number): number {
  const panelPadding = cartesianTooltipConfig.spacing.panelPadding.value;
  const outerPadding = cartesianTooltipConfig.spacing.outerPadding.value;
  const pointerHeight =
    cartesianTooltipConfig.pointerHeight +
    cartesianTooltipConfig.spacing.pointerBottomPadding.value;
  const titleHeight = cartesianTooltipConfig.typography.title.lineHeight;
  const rowHeight = cartesianTooltipConfig.typography.label.lineHeight;
  const gap = cartesianTooltipConfig.spacing.itemGap.value;
  const contentHeight =
    titleHeight + gap + itemCount * rowHeight + Math.max(0, itemCount - 1) * gap;
  return outerPadding + panelPadding * 2 + contentHeight + pointerHeight;
}

function CartesianTooltipPreview({
  anchorX,
  chartTop,
  data,
}: CartesianTooltipPreviewProps) {
  const { values: resolvedColors } = useColorTokenResolved();
  const { values: resolvedNumbers } = useNumberTokenResolved();
  const { values: resolvedTypography } = useTypographyTokenResolved();

  if (!data || data.items.length === 0) {
    return null;
  }

  const outerPadding = numberTokenResolvedValue(
    cartesianTooltipConfig.spacing.outerPadding,
    resolvedNumbers,
  );
  const panelPadding = numberTokenResolvedValue(
    cartesianTooltipConfig.spacing.panelPadding,
    resolvedNumbers,
  );
  const itemGap = numberTokenResolvedValue(
    cartesianTooltipConfig.spacing.itemGap,
    resolvedNumbers,
  );
  const pointerBottomPadding = numberTokenResolvedValue(
    cartesianTooltipConfig.spacing.pointerBottomPadding,
    resolvedNumbers,
  );
  const pointerInsetEnd = numberTokenResolvedValue(
    cartesianTooltipConfig.spacing.pointerInsetEnd,
    resolvedNumbers,
  );
  const panelWidth = cartesianTooltipConfig.width;
  const pointerWidth = cartesianTooltipConfig.pointerWidth;
  const tooltipTop = Math.max(0, chartTop - tooltipHeight(data.items.length) - 16);
  const pointerLeft = clamp(
    anchorX - outerPadding - pointerWidth / 2,
    0,
    panelWidth - pointerInsetEnd - pointerWidth,
  );
  const primaryText = colorTokenPreviewBackground(textColor.primary, resolvedColors);
  const panelBg = colorTokenPreviewBackground(
    cartesianTooltipConfig.color.panel,
    resolvedColors,
  );
  const borderColor = colorTokenPreviewBackground(
    cartesianTooltipConfig.color.border,
    resolvedColors,
  );

  return (
    <div
      style={{
        boxSizing: "border-box",
        left: 0,
        padding: `${outerPadding}px ${outerPadding}px 0`,
        pointerEvents: "none",
        position: "absolute",
        top: `${tooltipTop}px`,
        width: "100%",
        zIndex: 5,
      }}
    >
      <div
        style={{
          filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
          width: `${panelWidth}px`,
        }}
      >
        <div
          style={{
            background: panelBg,
            border: `1px solid ${borderColor}`,
            boxSizing: "border-box",
            color: primaryText,
            display: "flex",
            flexDirection: "column",
            gap: `${itemGap}px`,
            padding: `${panelPadding}px`,
            width: "100%",
          }}
        >
          <div
            style={{
              whiteSpace: "nowrap",
              ...typographyTokenToPreviewCss(
                cartesianTooltipConfig.typography.title,
                resolvedTypography,
              ),
            }}
          >
            {data.title}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: `${itemGap}px`,
              width: "100%",
            }}
          >
            {data.items.map((item) => (
              <div
                key={item.label}
                style={{
                  alignItems: "flex-start",
                  display: "flex",
                  gap: `${itemGap}px`,
                  width: "100%",
                }}
              >
                <div
                  style={{
                    alignItems: "center",
                    display: "flex",
                    flex: "1 1 0",
                    gap: `${itemGap}px`,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      alignItems: "center",
                      display: "flex",
                      flexShrink: 0,
                      height: "20px",
                      justifyContent: "center",
                      width: "18px",
                    }}
                  >
                    <div
                      style={{
                        background: item.color,
                        height: "14px",
                        width: "14px",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      flex: "1 1 0",
                      minWidth: 0,
                      ...typographyTokenToPreviewCss(
                        cartesianTooltipConfig.typography.label,
                        resolvedTypography,
                      ),
                    }}
                  >
                    {item.label}
                  </div>
                </div>
                <div
                  style={{
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                    ...typographyTokenToPreviewCss(
                      cartesianTooltipConfig.typography.value,
                      resolvedTypography,
                    ),
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            boxSizing: "border-box",
            height: `${cartesianTooltipConfig.pointerHeight + pointerBottomPadding}px`,
            marginTop: "-1px",
            paddingBottom: `${pointerBottomPadding}px`,
            position: "relative",
            width: "100%",
          }}
        >
          <svg
            height={cartesianTooltipConfig.pointerHeight}
            style={{
              left: `${pointerLeft}px`,
              overflow: "visible",
              position: "absolute",
              top: 0,
            }}
            viewBox={`0 0 ${pointerWidth} ${cartesianTooltipConfig.pointerHeight}`}
            width={pointerWidth}
          >
            <path
              d={`M ${pointerWidth / 2} ${cartesianTooltipConfig.pointerHeight} L 0 0 L ${pointerWidth} 0 L ${pointerWidth / 2} ${cartesianTooltipConfig.pointerHeight} Z`}
              fill={panelBg}
            />
            <path
              d={`M 0 0 L ${pointerWidth / 2} ${cartesianTooltipConfig.pointerHeight} L ${pointerWidth} 0`}
              fill="none"
              stroke={borderColor}
              strokeLinejoin="miter"
              strokeWidth="1"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default CartesianTooltipPreview;
