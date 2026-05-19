import { ds, verticalBarChartConfig } from "../config";
import type { TypographyToken } from "../types";
import type { ResolvedTypographyMetrics } from "./resolveTypographyTokenValues";
import { formatTypographyMetricsShorthand } from "./chartTypography";

const CONFIG_TYPOGRAPHY_TOKEN_KEYS = new Set<string>();

function isTypographyToken(value: unknown): value is TypographyToken {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const o = value as Record<string, unknown>;
  if ("value" in o && typeof o.value === "number" && !("fontFamily" in o)) {
    return false;
  }
  return (
    typeof o.fontFamily === "string" &&
    typeof o.fontSize === "number" &&
    typeof o.fontWeight === "number" &&
    typeof o.lineHeight === "number"
  );
}

function registerTypographyTokenKeys(obj: unknown): void {
  if (isTypographyToken(obj)) {
    const key = obj.key?.trim();
    if (key) {
      CONFIG_TYPOGRAPHY_TOKEN_KEYS.add(key);
    }
    return;
  }
  if (Array.isArray(obj)) {
    obj.forEach(registerTypographyTokenKeys);
    return;
  }
  if (obj && typeof obj === "object") {
    for (const value of Object.values(obj as Record<string, unknown>)) {
      registerTypographyTokenKeys(value);
    }
  }
}

registerTypographyTokenKeys(ds);
registerTypographyTokenKeys(verticalBarChartConfig);

export function typographyTokenHasStyleBinding(token: TypographyToken): boolean {
  return Boolean(token.key?.trim());
}

export function getTypographyTokenStyleName(
  token: TypographyToken,
  namesByKey: Readonly<Record<string, string>>,
): string | undefined {
  const key = token.key?.trim();
  if (!key) {
    return undefined;
  }
  const name = namesByKey[key]?.trim();
  return name || undefined;
}

export function collectConfigTypographyTokenKeys(): string[] {
  return Array.from(CONFIG_TYPOGRAPHY_TOKEN_KEYS);
}

function metricsFromToken(token: TypographyToken): ResolvedTypographyMetrics {
  return {
    fontFamily: token.fontFamily,
    fontSize: token.fontSize,
    lineHeight: token.lineHeight,
    fontWeight: token.fontWeight,
  };
}

/** Resolved metrics from library when available, else config fields. */
export function typographyTokenResolvedMetrics(
  token: TypographyToken,
  valuesByKey: Readonly<Record<string, ResolvedTypographyMetrics>>,
): ResolvedTypographyMetrics {
  const key = token.key?.trim();
  if (key && valuesByKey[key]) {
    return valuesByKey[key];
  }
  return metricsFromToken(token);
}

/** CSS inline styles for chart preview (mode-aware when resolved). */
export function typographyTokenToPreviewCss(
  token: TypographyToken,
  valuesByKey: Readonly<Record<string, ResolvedTypographyMetrics>>,
): Record<string, string | number> {
  const metrics = typographyTokenResolvedMetrics(token, valuesByKey);
  return {
    fontFamily: `${metrics.fontFamily}, sans-serif`,
    fontSize: `${metrics.fontSize}px`,
    fontWeight: metrics.fontWeight,
    lineHeight: `${metrics.lineHeight}px`,
  };
}

export function typographyResolvedLineHeight(
  token: TypographyToken,
  valuesByKey: Readonly<Record<string, ResolvedTypographyMetrics>>,
): number {
  return typographyTokenResolvedMetrics(token, valuesByKey).lineHeight;
}

export function typographyTokenChipSummary(
  token: TypographyToken,
  valuesByKey: Readonly<Record<string, ResolvedTypographyMetrics>>,
): string {
  return formatTypographyMetricsShorthand(
    typographyTokenResolvedMetrics(token, valuesByKey),
  );
}
