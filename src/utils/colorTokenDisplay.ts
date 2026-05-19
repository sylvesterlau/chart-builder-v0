import { ds, verticalBarChartConfig } from "../config";
import { rgbaFromHex } from "../helpers";
import type { ColorToken } from "../types";

const CONFIG_COLOR_TOKEN_KEYS = new Set<string>();

function isColorToken(value: unknown): value is ColorToken {
  return (
    typeof value === "object" &&
    value !== null &&
    "value" in value &&
    typeof (value as ColorToken).value === "string"
  );
}

function registerColorTokenKeys(obj: unknown): void {
  if (isColorToken(obj)) {
    const key = obj.key?.trim();
    if (key) {
      CONFIG_COLOR_TOKEN_KEYS.add(key);
    }
    return;
  }
  if (Array.isArray(obj)) {
    obj.forEach(registerColorTokenKeys);
    return;
  }
  if (obj && typeof obj === "object") {
    for (const value of Object.values(obj as Record<string, unknown>)) {
      registerColorTokenKeys(value);
    }
  }
}

registerColorTokenKeys(ds.colors);
registerColorTokenKeys(ds.legend.color);
registerColorTokenKeys(verticalBarChartConfig.color);

/** Whether the token is bound to a Figma library variable. */
export function colorTokenHasVariableBinding(token: ColorToken): boolean {
  return Boolean(token.key?.trim());
}

/** Figma variable path from main-thread resolve (`names` map), if available. */
export function getColorTokenVariableName(
  token: ColorToken,
  namesByKey: Readonly<Record<string, string>>,
): string | undefined {
  const key = token.key?.trim();
  if (!key) {
    return undefined;
  }
  const name = namesByKey[key]?.trim();
  return name || undefined;
}

/** Primary chip label: variable path when bound, otherwise uppercase hex without `#`. */
export function colorTokenChipLabel(
  token: ColorToken,
  namesByKey: Readonly<Record<string, string>>,
): string {
  const variableName = getColorTokenVariableName(token, namesByKey);
  if (variableName) {
    return variableName;
  }
  return token.value.trim().replace(/^#/, "").toUpperCase();
}

/** All library import keys registered from config color tokens. */
export function collectConfigColorTokenKeys(): string[] {
  return Array.from(CONFIG_COLOR_TOKEN_KEYS);
}

/** Swatch hex: resolved variable color when available, else config `value`. */
export function colorTokenSwatchHex(
  token: ColorToken,
  resolvedByKey: Readonly<Record<string, string>>,
): string {
  const key = token.key?.trim();
  if (key && resolvedByKey[key]) {
    return resolvedByKey[key];
  }
  return token.value;
}

/** CSS color for preview surfaces (applies token opacity when set). */
export function colorTokenPreviewBackground(
  token: ColorToken,
  resolvedByKey: Readonly<Record<string, string>>,
): string {
  const hex = colorTokenSwatchHex(token, resolvedByKey);
  if (token.opacity !== undefined && token.opacity < 1) {
    return rgbaFromHex(hex, token.opacity);
  }
  return hex;
}
