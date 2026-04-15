// helpers.ts for reused function
import { chartConfig, dataVisColor } from "./config";
import { ChartData } from "./types";
// Convert token name dots to slashes
export function dotToSlash(token: string): string {
  if (typeof token !== "string") return String(token);
  return token.replace(/\./g, "/");
}
// Split integer and decimal, with thousands separator
export function splitNumber(
  value: number,
  thousandsSep: Boolean = true,
): { integer: string; decimal: string } {
  const fixed = value.toFixed(2);
  const [int, dec] = fixed.split(".");
  let formattedInt = int;
  // add , as thousands separator
  if (thousandsSep) {
    formattedInt = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  return {
    integer: formattedInt,
    decimal: dec || "00",
  };
}
// Calculate sum
export function getSum(chartData: ChartData) {
  let sum: number = 0;
  chartData.data.forEach((item) => {
    sum += item.value;
  });
  return sum;
}
// Transformed chart item with percent data
export interface TransformedChartItem {
  label: string;
  value: number;
  exactPercent: number;
  startPercent: number;
  endPercent: number;
  colorToken?: string | null;
}
export function transformToPercents(
  items: { label: string; value: number; colorToken?: string | null }[],
): TransformedChartItem[] {
  //add datavis color variable key to array
  dataVisColor.forEach((dColor, index) => {
    items[index].colorToken = dColor.key;
  });
  const sum = items.reduce((s, it) => s + (it.value || 0), 0);
  if (sum === 0) return [];
  let startPercent = 0;
  return items.map((item) => {
    const exactPercent = (item.value / sum) * 100;
    const endPercent = Math.round((startPercent + exactPercent) * 100) / 100;
    const result: TransformedChartItem = {
      label: item.label,
      value: item.value,
      exactPercent: exactPercent,
      startPercent: Math.round(startPercent * 100) / 100,
      endPercent: endPercent,
      colorToken: item.colorToken ?? null,
    };
    startPercent = result.endPercent;
    return result;
  });
}
// Bind a team variable to a SolidPaint
export async function bindVariableKeyToPaint(
  variableKey: string | null,
  basePaint: Paint,
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
      err,
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
      importedVar as any,
    );
    return bound as Paint;
  } catch (err) {
    console.error(
      "bindVariableKeyToPaint: setBoundVariableForPaint failed",
      err,
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
    return paintToUse;
  }
}
// token lookup handler
export async function getTokenVarKey(collectionKey: string, tokenPath: string) {
  try {
    const varsInThemeCol =
      await figma.teamLibrary.getVariablesInLibraryCollectionAsync(
        collectionKey,
      );
    const tokenName = dotToSlash(tokenPath);
    const foundVar = varsInThemeCol.find((v) => {
      const name = v.name || "";
      return name === tokenName;
    });
    if (foundVar && foundVar.key) {
      figma.notify(`Token found: ${foundVar.key}`);
      console.log(`Token "${tokenPath}" -> Key: ${foundVar.key}`);
    } else {
      figma.notify(`Token "${tokenPath}" not found in theme collection`);
      console.log(
        `Available tokens:`,
        varsInThemeCol.map((v) => v.name),
      );
    }
  } catch (err) {
    console.error("Token lookup failed:", err);
    figma.notify("Token lookup failed. Check console for details.");
  }
}
