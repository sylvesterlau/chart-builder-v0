import { Fragment, h } from "preact";
import { clamp, rgbaFromHex } from "../../helpers";
import type { ColorToken } from "../../types";
import styles from "./ColorTokenChip.module.css";

function hexDigits(hex: string): string {
  const trimmed = hex.trim().replace(/^#/, "");
  return trimmed.toUpperCase();
}

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
  const alpha =
    token.opacity !== undefined
      ? clamp(token.opacity, 0, 1)
      : fallbackOpacity !== undefined
        ? clamp(fallbackOpacity, 0, 1)
        : undefined;

  const showOpacityPercent = alpha !== undefined && !isFullOpacity(alpha);
  const previewBackground =
    alpha !== undefined && !isFullOpacity(alpha)
      ? rgbaFromHex(token.value, alpha)
      : token.value;
  const pct = alpha !== undefined ? Math.round(alpha * 100) : 0;

  return (
    <div className={styles.chip}>
      <div className={styles.segment}>
        <div
          className={styles.swatch}
          style={{ backgroundColor: previewBackground }}
        />
        <span className={styles.hex}>{hexDigits(token.value)}</span>
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
