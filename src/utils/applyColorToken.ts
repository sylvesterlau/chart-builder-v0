import type { ColorToken } from "../types";

/** Non-empty variable import key, or null when binding should be skipped. */
export function colorTokenVariableKey(token: ColorToken): string | null {
  const key = token.key?.trim();
  return key ? key : null;
}

/** Solid paint from token `value` and optional `opacity` (no variable binding). */
export function solidPaintFromColorToken(token: ColorToken): SolidPaint {
  return {
    type: "SOLID",
    color: figma.util.rgb(token.value),
    ...(token.opacity !== undefined ? { opacity: token.opacity } : {}),
  };
}

/**
 * Bind a library variable to a solid paint when `variableKey` is set;
 * otherwise return `basePaint` unchanged.
 */
export async function bindVariableKeyToPaint(
  variableKey: string | null,
  basePaint: Paint,
): Promise<Paint> {
  const paintToUse: SolidPaint =
    (basePaint as SolidPaint).type === "SOLID"
      ? (basePaint as SolidPaint)
      : solidPaintFromColorToken({ value: "#000000" });

  if (!variableKey) {
    return paintToUse;
  }

  let importedVar: Variable | null = null;
  try {
    importedVar = await figma.variables.importVariableByKeyAsync(variableKey);
  } catch {
    return paintToUse;
  }

  try {
    const clonedPaint: Paint =
      typeof (globalThis as { structuredClone?: <T>(v: T) => T })
        .structuredClone === "function"
        ? (globalThis as { structuredClone: <T>(v: T) => T }).structuredClone(
            paintToUse,
          )
        : JSON.parse(JSON.stringify(paintToUse));
    const bound = figma.variables.setBoundVariableForPaint(
      clonedPaint as SolidPaint,
      "color",
      importedVar,
    );
    return bound as Paint;
  } catch (err) {
    console.error(
      "bindVariableKeyToPaint: setBoundVariableForPaint failed",
      err,
    );
    try {
      if (importedVar?.valuesByMode) {
        const modeId = Object.keys(importedVar.valuesByMode)[0];
        const val = importedVar.valuesByMode[modeId];
        if (val && typeof val === "object" && "r" in val) {
          return {
            type: "SOLID",
            color: { r: val.r, g: val.g, b: val.b },
          } as SolidPaint;
        }
      }
    } catch (e) {
      console.error("bindVariableKeyToPaint: fallback read failed", e);
    }
    return paintToUse;
  }
}

async function paintFromColorToken(token: ColorToken): Promise<Paint> {
  const base = solidPaintFromColorToken(token);
  return bindVariableKeyToPaint(colorTokenVariableKey(token), base);
}

type FillsNode = SceneNode & MinimalFillsMixin;
type StrokesNode = SceneNode & MinimalStrokesMixin;

/** Apply token to node fills — binds variable when `token.key` is set, else uses `token.value`. */
export async function applyColorTokenToFills(
  node: FillsNode,
  token: ColorToken,
): Promise<void> {
  node.fills = [await paintFromColorToken(token)];
}

/** Apply token to node strokes — binds variable when `token.key` is set, else uses `token.value`. */
export async function applyColorTokenToStrokes(
  node: StrokesNode,
  token: ColorToken,
): Promise<void> {
  node.strokes = [await paintFromColorToken(token)];
}
