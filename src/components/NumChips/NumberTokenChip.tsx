import { IconNumber16 } from "@create-figma-plugin/ui";
import { h } from "preact";
import type { NumberToken } from "../../types";
import {
  getNumberTokenVariableName,
  numberTokenHasVariableBinding,
  numberTokenResolvedValue,
} from "../../utils/numberTokenDisplay";
import { useNumberTokenResolved } from "./numberTokenValueContext";
import styles from "./NumChip.module.css";

export interface NumberTokenChipProps {
  token: NumberToken;
}

export function NumberTokenChip(props: NumberTokenChipProps) {
  const { token } = props;
  const { values, names } = useNumberTokenResolved();
  const boundVariable = numberTokenHasVariableBinding(token);
  const variableName = getNumberTokenVariableName(token, names);
  const resolved = numberTokenResolvedValue(token, values);
  const chipClass = boundVariable
    ? `${styles.chip} ${styles.chipBound}`
    : styles.chip;

  return (
    <div className={chipClass} title={variableName ?? String(resolved)}>
      <span className={styles.icon}>
        <IconNumber16 />
      </span>
      {boundVariable && variableName ? (
        <span className={styles.labelGroup}>
          <span className={styles.variableName}>{variableName}</span>
          <span className={styles.resolvedValue}>{resolved}</span>
        </span>
      ) : (
        <span className={styles.value}>{String(resolved)}</span>
      )}
    </div>
  );
}
