import type { TypographyToken } from "../types";

/** Alias for chart design-system leaves; same shape as `TypographyToken`. */
export type ChartTypographyToken = TypographyToken;

function isChartTypographyToken(v: unknown): v is ChartTypographyToken {
  if (v === null || typeof v !== "object" || Array.isArray(v)) {
    return false;
  }
  const o = v as Record<string, unknown>;
  if (o.figmaFontStyle !== undefined && typeof o.figmaFontStyle !== "string") {
    return false;
  }
  if (o.key !== undefined && typeof o.key !== "string") {
    return false;
  }
  return (
    typeof o.fontFamily === "string" &&
    typeof o.fontSize === "number" &&
    typeof o.fontWeight === "number" &&
    typeof o.lineHeight === "number"
  );
}

/** Walk nested `typography` — one leaf token per row for design system UI. */
export function collectTypographyTokenPaths(
  prefix: string,
  value: unknown,
): Array<{ path: string; token: ChartTypographyToken }> {
  if (isChartTypographyToken(value)) {
    return [{ path: prefix, token: value }];
  }
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return Object.entries(value as Record<string, unknown>).flatMap(
      ([key, child]) =>
        collectTypographyTokenPaths(prefix ? `${prefix}.${key}` : key, child),
    );
  }
  return [];
}

/**
 * Single-line CSS `font`-style summary for plugin design system page only.
 * Order matches CSS shorthand: `italic bold 1.2em "Fira Sans", sans-serif`
 * → here: `normal | italic`, weight, size/line-height, quoted family + fallback.
 */
export function formatTypographyMetricsShorthand(metrics: {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  fontWeight: number;
}): string {
  return `"${metrics.fontFamily}" ${metrics.fontSize}/${metrics.lineHeight} · ${metrics.fontWeight}`;
}

export function formatTypographyTokenAsCssFontShorthand(
  token: ChartTypographyToken,
): string {
  const weightKw = token.fontWeight >= 700 ? "bold" : String(token.fontWeight);
  const cssLine = `"${token.fontFamily}" ${token.fontSize}px/${token.lineHeight}px ${weightKw}`;
  const figmaOverride = token.figmaFontStyle?.trim();
  return figmaOverride ? `${cssLine} · Figma "${figmaOverride}"` : cssLine;
}

/**
 * Map numeric CSS-like weight to common Figma static style names.
 * Font families spell styles differently; use `token.figmaFontStyle` when needed.
 */
/** Map Figma `fontName.style` to approximate CSS font-weight. */
export function fontWeightFromFigmaStyle(style: string): number {
  const s = style.trim().toLowerCase();
  if (s.includes("thin")) return 100;
  if (s.includes("extra") && s.includes("light")) return 200;
  if (s.includes("light")) return 300;
  if (s.includes("regular") || s === "normal" || s === "book") return 400;
  if (s.includes("medium")) return 500;
  if (s.includes("semi") && s.includes("bold")) return 600;
  if (s.includes("bold") && !s.includes("semi") && !s.includes("extra")) return 700;
  if (s.includes("extra") && s.includes("bold")) return 800;
  if (s.includes("black") || s.includes("heavy")) return 900;
  return 400;
}

export function figmaFontStyleFromNumericWeight(fontWeight: number): string {
  if (fontWeight < 150) return "Thin";
  if (fontWeight < 250) return "Extra Light";
  if (fontWeight < 350) return "Light";
  if (fontWeight < 450) return "Regular";
  if (fontWeight < 550) return "Medium";
  if (fontWeight < 650) return "Semi Bold";
  if (fontWeight < 750) return "Bold";
  if (fontWeight < 850) return "Extra Bold";
  return "Black";
}

/** Resolved Figma `fontName.style` for `loadFontAsync` / text nodes. */
export function resolveFigmaFontStyle(token: ChartTypographyToken): string {
  const override = token.figmaFontStyle?.trim();
  if (override) return override;
  return figmaFontStyleFromNumericWeight(token.fontWeight);
}

export function typographyTokenToCss(token: ChartTypographyToken) {
  return {
    fontFamily: `${token.fontFamily}, sans-serif`,
    fontSize: `${token.fontSize}px`,
    fontWeight: token.fontWeight,
    lineHeight: `${token.lineHeight}px`,
  } as const;
}
