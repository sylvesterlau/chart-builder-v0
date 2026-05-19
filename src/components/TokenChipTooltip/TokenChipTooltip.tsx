import { createPortal } from "preact/compat";
import { h } from "preact";
import type { ComponentChildren } from "preact";
import { useCallback, useRef, useState } from "preact/hooks";
import styles from "./TokenChipTooltip.module.css";

export interface TokenChipTooltipProps {
  children: ComponentChildren;
  /** Primary line — Figma variable path. */
  tokenName: string;
  /** Secondary line — hex/opacity, numeric value, etc. */
  meta?: string;
}

/** Hover tooltip for design-token chips (fixed layer, does not affect layout). */
export function TokenChipTooltip(props: TokenChipTooltipProps) {
  const { children, tokenName, meta } = props;
  const metaLine = meta?.trim();
  const triggerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });

  const updatePosition = useCallback(function () {
    const el = triggerRef.current;
    if (!el) {
      return;
    }
    const rect = el.getBoundingClientRect();
    setPosition({
      left: rect.left + rect.width / 2,
      top: rect.bottom + 6,
    });
  }, []);

  const showTooltip = useCallback(function () {
    updatePosition();
    setVisible(true);
  }, [updatePosition]);

  const hideTooltip = useCallback(function () {
    setVisible(false);
  }, []);

  const tooltipNode =
    visible && typeof document !== "undefined"
      ? createPortal(
          <div
            className={styles.tooltip}
            role="tooltip"
            style={{
              left: `${position.left}px`,
              top: `${position.top}px`,
            }}
          >
            <div className={styles.panel}>
              <div className={styles.tokenName}>{tokenName}</div>
              {metaLine ? <div className={styles.meta}>{metaLine}</div> : null}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div
      ref={triggerRef}
      className={styles.wrap}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {tooltipNode}
    </div>
  );
}
