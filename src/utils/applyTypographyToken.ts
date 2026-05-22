import type { TypographyToken } from "../types";
import { applyFigmaTypographyToken } from "./applyFigmaTypography";
import { resolveFigmaFontStyle } from "./chartTypography";

/** Non-empty text style import key, or null when binding should be skipped. */
export function typographyTokenStyleKey(token: TypographyToken): string | null {
  const key = token.key?.trim();
  return key ? key : null;
}

const importedTextStyleCache = new Map<string, TextStyle>();

export async function importTextStyleByKey(
  key: string,
): Promise<TextStyle | null> {
  const cached = importedTextStyleCache.get(key);
  if (cached) {
    return cached;
  }

  try {
    const style = await figma.importStyleByKeyAsync(key);
    if (style.type !== "TEXT") {
      return null;
    }
    const textStyle = style as TextStyle;
    importedTextStyleCache.set(key, textStyle);
    return textStyle;
  } catch {
    return null;
  }
}

async function loadFontName(fontName: FontName): Promise<void> {
  try {
    await figma.loadFontAsync(fontName);
  } catch {
    // Style may reference a font unavailable in this file; caller may fall back.
  }
}

/** Font names from style definition plus every mode of a bound fontFamily variable. */
async function collectFontNamesForTextStyle(
  style: TextStyle,
): Promise<FontName[]> {
  const fontStyle = style.fontName.style;
  const fontNames: FontName[] = [style.fontName];
  const seenFamilies = new Set<string>([style.fontName.family]);

  const alias = style.boundVariables?.fontFamily;
  if (!alias) {
    return fontNames;
  }

  try {
    const variable = await figma.variables.getVariableByIdAsync(alias.id);
    if (!variable || variable.resolvedType !== "STRING") {
      return fontNames;
    }

    for (const modeId of Object.keys(variable.valuesByMode)) {
      const value = variable.valuesByMode[modeId];
      if (typeof value !== "string") {
        continue;
      }
      const family = value.trim();
      if (!family || seenFamilies.has(family)) {
        continue;
      }
      seenFamilies.add(family);
      fontNames.push({ family, style: fontStyle });
    }
  } catch {
    // Variable unavailable in this file; style.fontName is still loaded.
  }

  return fontNames;
}

async function loadFontsForTextStyle(style: TextStyle): Promise<void> {
  const fontNames = await collectFontNamesForTextStyle(style);
  for (const fontName of fontNames) {
    await loadFontName(fontName);
  }
}

/** Load fonts resolved on the node (e.g. after text style bind in active variable mode). */
async function loadResolvedTextNodeFont(node: TextNode): Promise<void> {
  const length = node.characters.length;
  const fontNames =
    length > 0 && node.fontName === figma.mixed
      ? node.getRangeAllFontNames(0, length)
      : node.fontName === figma.mixed
        ? []
        : [node.fontName];

  for (const fontName of fontNames) {
    await loadFontName(fontName);
  }
}

/** Load fonts required before setting characters / text style on a node. */
export async function loadTypographyTokenFonts(
  token: TypographyToken,
): Promise<void> {
  const key = typographyTokenStyleKey(token);
  if (key) {
    const style = await importTextStyleByKey(key);
    if (style) {
      await loadFontsForTextStyle(style);
      return;
    }
  }

  await loadFontName({
    family: token.fontFamily,
    style: resolveFigmaFontStyle(token),
  });
}

/** Apply token typography — binds library text style when `token.key` is set. */
export async function applyTypographyTokenToText(
  node: TextNode,
  token: TypographyToken,
): Promise<void> {
  const key = typographyTokenStyleKey(token);
  if (!key) {
    applyFigmaTypographyToken(node, token);
    return;
  }

  const style = await importTextStyleByKey(key);
  if (!style) {
    applyFigmaTypographyToken(node, token);
    return;
  }

  try {
    await loadFontsForTextStyle(style);
    // Empty nodes may not resolve variable-bound fontFamily until they have content.
    if (node.characters.length === 0) {
      node.fontName = style.fontName;
      node.characters = " ";
    }
    await node.setTextStyleIdAsync(style.id);
    await loadResolvedTextNodeFont(node);
  } catch {
    applyFigmaTypographyToken(node, token);
  }
}

/** Preload fonts for multiple typography tokens (deduped by style key / font). */
export async function loadTypographyTokenFontsBatch(
  tokens: TypographyToken[],
): Promise<void> {
  const seenKeys = new Set<string>();
  const seenFonts = new Set<string>();

  for (const token of tokens) {
    const key = typographyTokenStyleKey(token);
    if (key) {
      if (seenKeys.has(key)) {
        continue;
      }
      seenKeys.add(key);
      const style = await importTextStyleByKey(key);
      if (style) {
        await loadFontsForTextStyle(style);
        continue;
      }
    }

    const fontName = {
      family: token.fontFamily,
      style: resolveFigmaFontStyle(token),
    };
    const fontId = `${fontName.family}\0${fontName.style}`;
    if (seenFonts.has(fontId)) {
      continue;
    }
    seenFonts.add(fontId);
    await loadFontName(fontName);
  }
}
