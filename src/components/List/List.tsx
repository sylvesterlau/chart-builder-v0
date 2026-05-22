import { IconChevronRightLarge24 } from "@create-figma-plugin/ui";
import { h } from "preact";
import { useCallback } from "preact/hooks";
import styles from "./List.module.css";

interface ListProps {
  icon?: h.JSX.Element;
  preview?: h.JSX.Element;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  disable?: boolean;
  variant?: "default" | "settings";
}

export default function List({
  icon,
  preview,
  title,
  subtitle,
  onClick,
  disable = false,
  variant = "default",
}: ListProps) {
  const handleKeyDown = useCallback(
    function (event: KeyboardEvent) {
      if (disable || !onClick) {
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onClick();
      }
    },
    [disable, onClick],
  );

  const leading = preview ?? icon;
  const hasPreview = Boolean(preview);
  const containerClass = disable
    ? styles.listContainerDisable
    : variant === "settings"
      ? styles.listContainerSettings
      : styles.listContainer;

  return (
    <div
      role="button"
      tabIndex={disable ? -1 : 0}
      className={`${containerClass}${hasPreview ? ` ${styles.listContainerWithPreview}` : ""}`}
      aria-disabled={disable}
      onClick={!disable ? onClick : undefined}
      onKeyDown={handleKeyDown}
    >
      {leading && (
        <div
          className={
            hasPreview ? styles.leadingPreview : styles.leading
          }
        >
          {leading}
        </div>
      )}
      <div className={styles.textColumn}>
        <span className={styles.listTitle}>{title}</span>
        {subtitle && <span className={styles.listSubtitle}>{subtitle}</span>}
      </div>
      <div className={styles.trailing}>
        <IconChevronRightLarge24 />
      </div>
    </div>
  );
}
