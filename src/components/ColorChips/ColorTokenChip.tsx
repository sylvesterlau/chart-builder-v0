import { Fragment, h } from "preact";
import { clamp, rgbaFromHex } from "../../helpers";
import type { ColorToken } from "../../types";
import {
  colorTokenChipLabel,
  colorTokenHasVariableBinding,
  colorTokenSwatchHex,
} from "../../utils/colorTokenDisplay";
import { useColorTokenSwatches } from "./colorTokenSwatchContext";
import styles from "./ColorTokenChip.module.css";

function isFullOpacity(alpha: number | undefined): boolean {
  return alpha === undefined || Math.abs(alpha - 1) < 1e-6;
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
  const resolvedSwatches = useColorTokenSwatches();
  const swatchHex = colorTokenSwatchHex(token, resolvedSwatches);

  const alpha =
    token.opacity !== undefined
      ? clamp(token.opacity, 0, 1)
      : fallbackOpacity !== undefined
        ? clamp(fallbackOpacity, 0, 1)
        : undefined;

  const showOpacityPercent = alpha !== undefined && !isFullOpacity(alpha);
  const previewBackground =
    alpha !== undefined && !isFullOpacity(alpha)
      ? rgbaFromHex(swatchHex, alpha)
      : swatchHex;
  const pct = alpha !== undefined ? Math.round(alpha * 100) : 0;
  const label = colorTokenChipLabel(token);
  const boundVariable = colorTokenHasVariableBinding(token);
  const chipClass = boundVariable
    ? `${styles.chip} ${styles.chipBound}`
    : styles.chip;

  return (
    <div className={chipClass}>
      <div className={styles.segment}>
        <div
          className={styles.swatch}
          style={{ backgroundColor: previewBackground }}
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
  );
}
