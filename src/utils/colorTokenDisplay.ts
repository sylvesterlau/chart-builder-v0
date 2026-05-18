import { ds, verticalBarChartConfig } from "../config";
import type { ColorToken } from "../types";

const KEY_TO_VARIABLE_NAME = new Map<string, string>();

function isColorToken(value: unknown): value is ColorToken {
  return (
    typeof value === "object" &&
    value !== null &&
    "value" in value &&
    typeof (value as ColorToken).value === "string"
  );
}

/** Map config paths to Figma variable paths (e.g. dataVis/01, text/primary). */
function pathToVariableName(path: string): string {
  const dataVis = path.match(/dataVis\.general\.(\d+)$/);
  if (dataVis) {
    return `dataVis/${String(Number(dataVis[1]) + 1).padStart(2, "0")}`;
  }
  const text = path.match(/(?:^|\.)text\.(\w+)$/);
  if (text) {
    return `text/${text[1]}`;
  }
  if (/(^|\.)background$/.test(path)) {
    return "background";
  }
  if (/divider/.test(path)) {
    return "divider";
  }
  const selected = path.match(/selected\.(\w+)$/);
  if (selected) {
    return selected[1];
  }
  const vbAxis = path.match(/color\.(axisLine|gridLine)$/);
  if (vbAxis) {
    return vbAxis[1];
  }
  const parts = path.split(".");
  return parts[parts.length - 1] ?? path;
}

function registerColorTokens(obj: unknown, path: string): void {
  if (isColorToken(obj)) {
    const key = obj.key?.trim();
    if (key) {
      KEY_TO_VARIABLE_NAME.set(key, pathToVariableName(path));
    }
    return;
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      registerColorTokens(item, `${path}.${index}`);
    });
    return;
  }
  if (obj && typeof obj === "object") {
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      registerColorTokens(value, path ? `${path}.${key}` : key);
    }
  }
}

registerColorTokens(ds.colors, "colors");
registerColorTokens(ds.legend.color, "legend.color");
registerColorTokens(verticalBarChartConfig.color, "color");

/** Whether the token is bound to a Figma library variable. */
export function colorTokenHasVariableBinding(token: ColorToken): boolean {
  return Boolean(token.key?.trim());
}

/** Resolved Figma variable path for a token with a library key, if known. */
export function getColorTokenVariableName(
  token: ColorToken,
): string | undefined {
  const key = token.key?.trim();
  if (!key) {
    return undefined;
  }
  return KEY_TO_VARIABLE_NAME.get(key);
}

/** Primary chip label: variable path when bound, otherwise uppercase hex without `#`. */
export function colorTokenChipLabel(token: ColorToken): string {
  const variableName = getColorTokenVariableName(token);
  if (variableName) {
    return variableName;
  }
  return token.value.trim().replace(/^#/, "").toUpperCase();
}

/** All library import keys registered from config color tokens. */
export function collectConfigColorTokenKeys(): string[] {
  return Array.from(KEY_TO_VARIABLE_NAME.keys());
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
