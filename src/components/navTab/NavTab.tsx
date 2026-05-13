import { h } from "preact";
import type { ComponentChildren } from "preact";
import { useCallback } from "preact/hooks";
import styles from "./NavTab.module.css";

export interface NavTabProps {
  /** When true, row uses selected background (no check icon). */
  selected: boolean;
  onSelect: () => void;
  children: ComponentChildren;
  disabled?: boolean;
}

/** Design-system sidebar tab: SelectableItem-like states without lateral padding or tick. */
export default function NavTab({
  selected,
  onSelect,
  children,
  disabled = false,
}: NavTabProps) {
  const handleClick = useCallback(
    function () {
      if (!disabled) {
        onSelect();
      }
    },
    [disabled, onSelect],
  );

  const handleKeyDown = useCallback(
    function (event: KeyboardEvent) {
      if (disabled) {
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSelect();
      }
    },
    [disabled, onSelect],
  );

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      className={styles.root}
      data-selected={selected ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      aria-disabled={disabled}
      aria-pressed={selected}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <span className={styles.inner}>{children}</span>
    </div>
  );
}
