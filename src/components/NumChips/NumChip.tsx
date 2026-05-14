import { IconNumber16 } from "@create-figma-plugin/ui";
import { h } from "preact";
import styles from "./NumChip.module.css";

export interface NumChipProps {
  value: string | number;
}

export function NumChip(props: NumChipProps) {
  const text = String(props.value);
  return (
    <div className={styles.chip} title={text}>
      <span className={styles.icon}>
        <IconNumber16 />
      </span>
      <span className={styles.value}>{text}</span>
    </div>
  );
}
