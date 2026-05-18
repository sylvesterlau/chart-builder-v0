import { h } from "preact";
import type { ComponentChildren } from "preact";
import styles from "./TokenChipTooltip.module.css";

export interface TokenChipTooltipProps {
  children: ComponentChildren;
  /** Primary line — Figma variable path. */
  tokenName: string;
  /** Secondary line — hex/opacity, numeric value, etc. */
  meta?: string;
}

/** Hover tooltip for design-token chips (dark panel + upward arrow). */
export function TokenChipTooltip(props: TokenChipTooltipProps) {
  const { children, tokenName, meta } = props;
  const metaLine = meta?.trim();

  return (
    <div className={styles.wrap}>
      {children}
      <div className={styles.tooltip} role="tooltip">
        <div className={styles.panel}>
          <div className={styles.tokenName}>{tokenName}</div>
          {metaLine ? <div className={styles.meta}>{metaLine}</div> : null}
        </div>
      </div>
    </div>
  );
}
