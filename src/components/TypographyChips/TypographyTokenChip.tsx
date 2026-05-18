import { IconText16 } from "@create-figma-plugin/ui";
import { h } from "preact";
import type { TypographyToken } from "../../types";
import {
  getTypographyTokenStyleName,
  typographyTokenChipSummary,
  typographyTokenHasStyleBinding,
} from "../../utils/typographyTokenDisplay";
import { TokenChipTooltip } from "../TokenChipTooltip/TokenChipTooltip";
import { useTypographyTokenResolved } from "./typographyTokenValueContext";
import styles from "./TypographyTokenChip.module.css";

export interface TypographyTokenChipProps {
  token: TypographyToken;
}

export function TypographyTokenChip(props: TypographyTokenChipProps) {
  const { token } = props;
  const { values, names } = useTypographyTokenResolved();
  const boundStyle = typographyTokenHasStyleBinding(token);
  const styleName = getTypographyTokenStyleName(token, names);
  const summary = typographyTokenChipSummary(token, values);
  const chipClass = boundStyle ? `${styles.chip} ${styles.chipBound}` : styles.chip;
  const showStyleNameOnly = boundStyle && Boolean(styleName);
  const displayLabel = showStyleNameOnly ? styleName! : summary;

  const chipContent = (
    <div className={chipClass} title={showStyleNameOnly ? undefined : displayLabel}>
      <span className={styles.icon}>
        <IconText16 />
      </span>
      <span className={showStyleNameOnly ? styles.styleName : styles.summary}>
        {displayLabel}
      </span>
    </div>
  );

  if (!showStyleNameOnly) {
    return chipContent;
  }

  return (
    <TokenChipTooltip tokenName={summary}>{chipContent}</TokenChipTooltip>
  );
}
