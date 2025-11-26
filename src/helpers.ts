import { chartConfig } from "./config";

// convert token key dots to slashes
export function dotToSlash(token: string): string {
  if (typeof token !== "string") return String(token);
  return token.replace(/\./g, "/");
}
//check local collection existence

// check local variable in a collection
interface VariableCheckResult {
  exists: boolean;
  variable?: Variable;
  collection?: VariableCollection;
  availableVariables: string[];
}

// Bind a team variable to a SolidPaint
export async function bindVariableKeyToPaint(
  variableKey: string | null,
  basePaint: Paint
): Promise<Paint> {
  // default base paint (use chartConfig.defaultColor from config)
  const defaultSolid: SolidPaint = {
    type: "SOLID",
    color: figma.util.rgb(chartConfig.defaultColor),
  };
  const paintToUse: SolidPaint =
    (basePaint as SolidPaint).type === "SOLID"
      ? (basePaint as SolidPaint)
      : defaultSolid;
  if (!variableKey) return paintToUse;
  let importedVar: Variable | { key: string } | null = null;
  try {
    importedVar = await figma.variables.importVariableByKeyAsync(variableKey);
  } catch (err) {
    // import may fail (permissions/team library), fall back to using key object
    console.warn(
      "bindVariableKeyToPaint: importVariableByKeyAsync failed",
      err
    );
    importedVar = { key: variableKey };
  }
  try {
    // deep clone paint to avoid mutating shared fills
    const clonedPaint: Paint =
      typeof (globalThis as any).structuredClone === "function"
        ? (globalThis as any).structuredClone(paintToUse)
        : JSON.parse(JSON.stringify(paintToUse));
    // @ts-ignore - setBoundVariableForPaint may not be in typings
    const bound = figma.variables.setBoundVariableForPaint(
      clonedPaint as any,
      "color",
      importedVar as any
    );
    return bound as Paint;
  } catch (err) {
    console.error(
      "bindVariableKeyToPaint: setBoundVariableForPaint failed",
      err
    );
    // try to read color from importedVar.valuesByMode
    try {
      if (importedVar && (importedVar as any).valuesByMode) {
        const modeId = Object.keys((importedVar as any).valuesByMode)[0];
        const val = (importedVar as any).valuesByMode[modeId];
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
    // final fallback
    return paintToUse;
  }
}
