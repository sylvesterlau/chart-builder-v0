import { chartConfig } from "./config";

// convert token key dots to slashes
export function dotToSlash(token: string): string {
  if (typeof token !== "string") return String(token);
  return token.replace(/\./g, "/");
}
// transformed chart item with percent data
export interface TransformedChartItem {
  label: string;
  value: number;
  startPercent: number;
  endPercent: number;
  // store variable key (string) instead of full Variable object
  colorToken?: string | null;
}
export function transformToPercents(
  items: { label: string; value: number; colorToken?: string | null }[]
): TransformedChartItem[] {
  const sum = items.reduce((s, it) => s + (it.value || 0), 0);
  if (sum === 0) return [];
  let startPercent = 0;
  return items.map((item) => {
    const endPercent = Math.round((item.value / sum) * 100);
    const result: TransformedChartItem = {
      label: item.label,
      value: item.value,
      startPercent: startPercent,
      endPercent: startPercent + endPercent,
      colorToken: item.colorToken ?? null,
    };
    startPercent = result.endPercent;
    return result;
  });
}
//check local collection existence
interface CollectionCheckResult {
  exists: boolean;
  collection?: VariableCollection;
  availableCollections: string[];
}
export async function checkCollectionExists(
  name: string,
  exact: boolean = false
): Promise<CollectionCheckResult> {
  try {
    const collections =
      await figma.variables.getLocalVariableCollectionsAsync();
    const availableCollections = collections.map((c) => c.name || "(unnamed)");
    // 查找匹配的集合
    const found = collections.find((c) =>
      exact
        ? c.name === name
        : c.name?.toLowerCase().includes(name.toLowerCase())
    );
    return {
      exists: !!found,
      collection: found,
      availableCollections,
    };
  } catch (err) {
    console.error("Error checking variable collections:", err);
    throw err;
  }
}
// check local variable in a collection
interface VariableCheckResult {
  exists: boolean;
  variable?: Variable;
  collection?: VariableCollection;
  availableVariables: string[];
}
export async function checkVariableExists(
  variableName: string,
  collectionName: string,
  exact: boolean = false
): Promise<VariableCheckResult> {
  try {
    // 首先检查 collection 是否存在
    const collectionResult = await checkCollectionExists(collectionName, true);
    if (!collectionResult.exists || !collectionResult.collection) {
      return {
        exists: false,
        availableVariables: [],
      };
    }
    const collection = collectionResult.collection;
    // 获取 collection 中的所有变量（使用异步方法）
    const variablePromises = collection.variableIds.map((id) =>
      figma.variables.getVariableByIdAsync(id)
    );
    // 等待所有变量加载完成
    const variables = (await Promise.all(variablePromises)).filter(
      (v): v is Variable => v !== null
    );
    // 获取所有变量名称用于显示
    const availableVariables = variables.map((v) => v.name);
    // 查找匹配的变量
    const found = variables.find((v) =>
      exact
        ? v.name === variableName
        : v.name.toLowerCase().includes(variableName.toLowerCase())
    );
    return {
      exists: !!found,
      variable: found,
      collection,
      availableVariables,
    };
  } catch (err) {
    console.error("Error checking variable:", err);
    throw err;
  }
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

export default {
  dotToSlash,
  checkCollectionExists,
  checkVariableExists,
};
