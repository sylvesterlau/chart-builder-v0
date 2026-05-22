import { fontWeightFromFigmaStyle } from "./chartTypography";
import { importTextStyleByKey } from "./applyTypographyToken";
import { collectConfigTypographyTokenKeys } from "./typographyTokenDisplay";
import {
  getVariableByIdOrImport,
  resolveFloatVariableValue,
  resolveStringVariableValue,
} from "./resolveVariableValues";

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

function textStyleLineHeightPx(
  style: TextStyle,
  fontSize: number,
): number {
  const lh = style.lineHeight;
  if (lh && typeof lh === "object" && "unit" in lh) {
    if (lh.unit === "PIXELS") {
      return lh.value;
    }
    if (lh.unit === "PERCENT") {
      return Math.round((fontSize * lh.value) / 100);
    }
  }
  return fontSize;
}

async function metricsFromTextStyle(
  style: TextStyle,
): Promise<ResolvedTypographyMetrics> {
  let fontFamily = style.fontName.family;
  let fontSize = style.fontSize;

  const fontFamilyAlias = style.boundVariables?.fontFamily;
  if (fontFamilyAlias) {
    const variable = await getVariableByIdOrImport(fontFamilyAlias.id);
    if (variable?.resolvedType === "STRING") {
      const resolved = await resolveStringVariableValue(variable);
      if (resolved) {
        fontFamily = resolved;
      }
    }
  }

  const fontSizeAlias = style.boundVariables?.fontSize;
  if (fontSizeAlias) {
    const variable = await getVariableByIdOrImport(fontSizeAlias.id);
    if (variable?.resolvedType === "FLOAT") {
      const resolved = await resolveFloatVariableValue(variable);
      if (resolved !== null) {
        fontSize = resolved;
      }
    }
  }

  return {
    fontFamily,
    fontSize,
    lineHeight: textStyleLineHeightPx(style, fontSize),
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
      values[key] = await metricsFromTextStyle(style);
    } catch {
      // Library style unavailable — UI falls back to config fields.
    }
  }

  return { values, names };
}
