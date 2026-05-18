import { fontWeightFromFigmaStyle } from "./chartTypography";
import { importTextStyleByKey } from "./applyTypographyToken";
import { collectConfigTypographyTokenKeys } from "./typographyTokenDisplay";

export interface ResolvedTypographyMetrics {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  fontWeight: number;
}

export type TypographyTokenValueMap = Record<string, ResolvedTypographyMetrics>;
export type TypographyTokenNameMap = Record<string, string>;

export interface TypographyTokenResolvedPayload {
  values: TypographyTokenValueMap;
  names: TypographyTokenNameMap;
}

function textStyleLineHeightPx(style: TextStyle): number {
  const lh = style.lineHeight;
  if (lh && typeof lh === "object" && "unit" in lh) {
    if (lh.unit === "PIXELS") {
      return lh.value;
    }
    if (lh.unit === "PERCENT") {
      return Math.round((style.fontSize * lh.value) / 100);
    }
  }
  return style.fontSize;
}

function metricsFromTextStyle(style: TextStyle): ResolvedTypographyMetrics {
  return {
    fontFamily: style.fontName.family,
    fontSize: style.fontSize,
    lineHeight: textStyleLineHeightPx(style),
    fontWeight: fontWeightFromFigmaStyle(style.fontName.style),
  };
}

/** Resolve config typography tokens via `importStyleByKeyAsync` (main thread only). */
export async function resolveTypographyTokenPayload(): Promise<TypographyTokenResolvedPayload> {
  const keys = collectConfigTypographyTokenKeys();
  const values: TypographyTokenValueMap = {};
  const names: TypographyTokenNameMap = {};

  for (const key of keys) {
    try {
      const style = await importTextStyleByKey(key);
      if (!style) {
        continue;
      }
      const styleName = style.name?.trim();
      if (styleName) {
        names[key] = styleName;
      }
      values[key] = metricsFromTextStyle(style);
    } catch {
      // Library style unavailable — UI falls back to config fields.
    }
  }

  return { values, names };
}
