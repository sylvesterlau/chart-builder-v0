import { Fragment, h } from "preact";
import { clamp, rgbaFromHex } from "../../helpers";
import type { ColorToken } from "../../types";
import {
  colorTokenChipLabel,
  colorTokenHasVariableBinding,
  colorTokenSwatchHex,
  getColorTokenVariableName,
} from "../../utils/colorTokenDisplay";
import { TokenChipTooltip } from "../TokenChipTooltip/TokenChipTooltip";
import { useColorTokenResolved } from "./colorTokenSwatchContext";
import styles from "./ColorTokenChip.module.css";

function isFullOpacity(alpha: number | undefined): boolean {
  return alpha === undefined || Math.abs(alpha - 1) < 1e-6;
}

/** Opacity is explicitly set and below 100% — show split swatch with checkerboard. */
function hasPartialOpacity(alpha: number | undefined): boolean {
  return alpha !== undefined && !isFullOpacity(alpha);
}

function formatTooltipHex(hex: string): string {
  const trimmed = hex.trim();
  return (trimmed.startsWith("#") ? trimmed : `#${trimmed}`).toUpperCase();
}

function formatTooltipOpacityPercent(alpha: number | undefined): string {
  if (alpha === undefined || isFullOpacity(alpha)) {
    return "100%";
  }
  return `${Math.round(alpha * 100)}%`;
}

function TransparencyCheckerboard() {
  return (
    <svg
      className={styles.swatchChecker}
      viewBox="0 0 8 8"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="4" height="4" fill="#E6E6E6" />
      <rect x="4" width="4" height="4" fill="#FFFFFF" />
      <rect y="4" width="4" height="4" fill="#FFFFFF" />
      <rect x="4" y="4" width="4" height="4" fill="#E6E6E6" />
    </svg>
  );
}

function ColorTokenSwatch(props: {
  boundVariable: boolean;
  swatchHex: string;
  previewBackground: string;
  alpha: number | undefined;
}) {
  const { boundVariable, swatchHex, previewBackground, alpha } = props;

  if (!boundVariable) {
    return (
      <div
        className={styles.swatch}
        style={{ backgroundColor: previewBackground }}
      />
    );
  }

  if (!hasPartialOpacity(alpha)) {
    return (
      <div
        className={styles.swatch}
        style={{ backgroundColor: previewBackground }}
      />
    );
  }

  return (
    <div className={styles.swatchSplit}>
      <div
        className={styles.swatchLeft}
        style={{ backgroundColor: swatchHex }}
      />
      <div className={styles.swatchRight}>
        <TransparencyCheckerboard />
        <div
          className={styles.swatchAlphaOverlay}
          style={{ backgroundColor: previewBackground }}
        />
      </div>
    </div>
  );
}

export interface ColorTokenChipProps {
  token: ColorToken;
  /**
   * When `token.opacity` is omitted, used for swatch and percentage
   * (e.g. `0.08` for highlight fill default).
   */
  fallbackOpacity?: number;
}

export function ColorTokenChip(props: ColorTokenChipProps) {
  const { token, fallbackOpacity } = props;
  const { values: resolvedSwatches, names: resolvedNames } =
    useColorTokenResolved();
  const swatchHex = colorTokenSwatchHex(token, resolvedSwatches);

  const alpha =
    token.opacity !== undefined
      ? clamp(token.opacity, 0, 1)
      : fallbackOpacity !== undefined
        ? clamp(fallbackOpacity, 0, 1)
        : undefined;

  const boundVariable = colorTokenHasVariableBinding(token);
  const showOpacityPercent =
    !boundVariable && alpha !== undefined && !isFullOpacity(alpha);
  const previewBackground =
    alpha !== undefined && !isFullOpacity(alpha)
      ? rgbaFromHex(swatchHex, alpha)
      : swatchHex;
  const pct = alpha !== undefined ? Math.round(alpha * 100) : 0;
  const label = colorTokenChipLabel(token, resolvedNames);
  const tooltipTokenName =
    getColorTokenVariableName(token, resolvedNames) ?? label;
  const tooltipHex = formatTooltipHex(swatchHex);
  const tooltipOpacity = formatTooltipOpacityPercent(alpha);
  const chipClass = boundVariable
    ? `${styles.chip} ${styles.chipBound}`
    : styles.chip;

  return (
    <TokenChipTooltip
      tokenName={tooltipTokenName}
      meta={`${tooltipHex} · ${tooltipOpacity}`}
    >
      <div className={chipClass}>
        <div className={styles.segment}>
          <ColorTokenSwatch
            boundVariable={boundVariable}
            swatchHex={swatchHex}
            previewBackground={previewBackground}
            alpha={alpha}
          />
          <span className={styles.hex}>{label}</span>
        </div>
        {showOpacityPercent ? (
          <Fragment>
            <div className={styles.divider} role="presentation" />
            <div className={styles.opacity}>
              <span className={styles.opacityValue}>{pct}</span>
              <span className={styles.opacitySymbol}>%</span>
            </div>
          </Fragment>
        ) : null}
      </div>
    </TokenChipTooltip>
  );
}
