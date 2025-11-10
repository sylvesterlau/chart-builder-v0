// convert token key dots to slashes
export function dotToSlash(token: string): string {
  if (typeof token !== "string") return String(token);
  return token.replace(/\./g, "/");
}

/**
 * 检查指定名称的变量集合是否存在
 * @param name 要查找的变量集合名称
 * @param exact 是否进行精确匹配（默认为 false，使用包含匹配）
 * @returns Promise<CollectionCheckResult> 包含查找结果的对象
 */
/**
 * helpers.ts
 * 通用 helper 函数集合
 */

// 描述 collection 的查找结果
interface CollectionCheckResult {
  exists: boolean;
  collection?: VariableCollection;
  availableCollections: string[];
}

// 描述 variable 的查找结果
interface VariableCheckResult {
  exists: boolean;
  variable?: Variable;
  collection?: VariableCollection;
  availableVariables: string[];
}

// 转换后的数据项类型
export interface TransformedChartItem {
  label: string;
  value: number;
  startPercent: number;
  endPercent: number;
}

/**
 * 将原始数据数组转换为带 start/end 百分比的结构
 * 会对总和为 0 的情况返回空数组
 */
export function transformToPercents(
  items: { label: string; value: number }[]
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
    };
    startPercent = result.endPercent;
    return result;
  });
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

/**
 * 检查指定 collection 中是否存在特定名称的变量
 * @param variableName 要查找的变量名称
 * @param collectionName collection 的名称
 * @param exact 是否进行精确匹配（默认为 false，使用包含匹配）
 * @returns Promise<VariableCheckResult> 包含查找结果的对象
 */
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

// 导出所有 helper 函数
export default {
  dotToSlash,
  checkCollectionExists,
  checkVariableExists,
};
