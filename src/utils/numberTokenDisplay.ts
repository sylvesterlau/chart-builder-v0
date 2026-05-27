import { ds, horizontalBarChartLayout } from "../config";
import type { NumberToken } from "../types";

const CONFIG_NUMBER_TOKEN_KEYS = new Set<string>();

export function isNumberToken(value: unknown): value is NumberToken {
  return (
    typeof value === "object" &&
    value !== null &&
    "value" in value &&
    typeof (value as NumberToken).value === "number"
  );
}

function registerNumberTokenKeys(obj: unknown): void {
  if (isNumberToken(obj)) {
    const key = obj.key?.trim();
    if (key) {
      CONFIG_NUMBER_TOKEN_KEYS.add(key);
    }
    return;
  }
  if (Array.isArray(obj)) {
    obj.forEach(registerNumberTokenKeys);
    return;
  }
  if (obj && typeof obj === "object") {
    for (const value of Object.values(obj as Record<string, unknown>)) {
      registerNumberTokenKeys(value);
    }
  }
}

registerNumberTokenKeys(ds.chartTitle.padding);
registerNumberTokenKeys(ds.legend.spacing);
registerNumberTokenKeys(ds.legend.shape);
registerNumberTokenKeys(horizontalBarChartLayout);
registerNumberTokenKeys(ds.chart.pie.indicator);

export function numberTokenHasVariableBinding(token: NumberToken): boolean {
  return Boolean(token.key?.trim());
}

/** Figma variable path from main-thread resolve (`names` map), if available. */
export function getNumberTokenVariableName(
  token: NumberToken,
  namesByKey: Readonly<Record<string, string>>,
): string | undefined {
  const key = token.key?.trim();
  if (!key) {
    return undefined;
  }
  const name = namesByKey[key]?.trim();
  return name || undefined;
}

export function collectConfigNumberTokenKeys(): string[] {
  return Array.from(CONFIG_NUMBER_TOKEN_KEYS);
}

/** Resolved FLOAT from library when available, else config `value`. */
export function numberTokenResolvedValue(
  token: NumberToken,
  valuesByKey: Readonly<Record<string, number>>,
): number {
  const key = token.key?.trim();
  if (key && valuesByKey[key] !== undefined) {
    return valuesByKey[key];
  }
  return token.value;
}
