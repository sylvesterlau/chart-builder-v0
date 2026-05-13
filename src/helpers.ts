// helpers.ts for reused function
import { dataVisColor, dataVisAt } from "./config";
import { ChartData } from "./types";
// Convert token name dots to slashes
export function dotToSlash(token: string): string {
  if (typeof token !== "string") return String(token);
  return token.replace(/\./g, "/");
}

export function formatLegendPercentageDisplay(percentage: number): string {
  const fixedPercentage = percentage.toFixed(1);
  return fixedPercentage.endsWith(".0")
    ? fixedPercentage.slice(0, -2)
    : fixedPercentage;
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
  items.forEach((item, index) => {
    item.colorToken = dataVisAt(index).key;
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
  // default base paint (first Data Vis swatch when binding fails / missing variable)
  const defaultSolid: SolidPaint = {
    type: "SOLID",
    color: figma.util.rgb(dataVisColor.general[0].value),
  };
  const paintToUse: SolidPaint =
    (basePaint as SolidPaint).type === "SOLID"
      ? (basePaint as SolidPaint)
      : defaultSolid;
  if (!variableKey) return paintToUse;
  let importedVar: Variable | null = null;
  try {
    importedVar = await figma.variables.importVariableByKeyAsync(variableKey);
  } catch (err) {
    // Missing team-library variables should not block creating the chart.
    return paintToUse;
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
// token lookup handler (search all available library collections)
export async function getTokenVarKey(tokenPath: string) {
  try {
    const tokenName = dotToSlash(tokenPath);
    const collections =
      await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
    const matches: Array<{
      key: string;
      name: string;
      collectionName: string;
      libraryName?: string;
    }> = [];
    for (let i = 0; i < collections.length; i++) {
      const collection = collections[i];
      const varsInCollection =
        await figma.teamLibrary.getVariablesInLibraryCollectionAsync(
          collection.key,
        );
      for (let j = 0; j < varsInCollection.length; j++) {
        const v = varsInCollection[j];
        if ((v.name || "") === tokenName && v.key) {
          matches.push({
            key: v.key,
            name: v.name || tokenName,
            collectionName: (collection as any).name || "Unknown Collection",
            libraryName: (collection as any).libraryName,
          });
        }
      }
    }
    if (matches.length === 1) {
      const match = matches[0];
      figma.notify(`Token found: ${match.key}`);
      console.log(
        `Token "${tokenPath}" -> Key: ${match.key} (Collection: ${match.collectionName})`,
      );
    } else if (matches.length > 1) {
      figma.notify(`Found ${matches.length} matches. Check console.`);
      console.log(`Multiple matches found for "${tokenPath}":`);
      matches.forEach((m, idx) => {
        console.log(
          `${idx + 1}. key=${m.key}, collection=${m.collectionName}, library=${m.libraryName || "Unknown Library"}`,
        );
      });
    } else {
      figma.notify(`Token "${tokenPath}" not found in any collection`);
      console.log(`Token "${tokenPath}" not found in any available collection`);
    }
  } catch (err) {
    console.error("Token lookup failed:", err);
    figma.notify("Token lookup failed. Check console for details.");
  }
}
