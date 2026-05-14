import { IconText16 } from "@create-figma-plugin/ui";
import { h } from "preact";
import type { TypographyToken } from "../../types";
import { formatTypographyTokenAsCssFontShorthand } from "../../utils/chartTypography";
import styles from "./TypographyTokenChip.module.css";

export interface TypographyTokenChipProps {
  token: TypographyToken;
}

export function TypographyTokenChip(props: TypographyTokenChipProps) {
  const line = formatTypographyTokenAsCssFontShorthand(props.token);
  return (
    <div className={styles.chip} title={line}>
      <span className={styles.icon}>
        <IconText16 />
      </span>
      <span className={styles.summary}>{line}</span>
    </div>
  );
}
