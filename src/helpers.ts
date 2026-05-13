// helpers.ts for reused function
import { dataVisAt, dataVisColor } from "./config";
import {
  ChartData,
  NormalizedVerticalBarChartConfig,
  VerticalBarAxisLineVisibility,
  VerticalBarChartConfig,
  VerticalBarChartTextStyle,
} from "./types";
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

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function clampNumber(
  value: unknown,
  min: number,
  max: number,
  fallback: number,
): number {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return clamp(number, min, max);
}

export function niceMax(value: number): number {
  if (value <= 10) return 10;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const scaled = value / magnitude;
  let nice = 10;
  if (scaled <= 2) nice = 2;
  else if (scaled <= 3) nice = 3;
  else if (scaled <= 5) nice = 5;
  return nice * magnitude;
}

export function buildTicks(maxValue: number, steps: number): number[] {
  const ticks: number[] = [];
  for (let index = 0; index <= steps; index += 1) {
    ticks.push(Math.round(maxValue - (maxValue / steps) * index));
  }
  ticks[ticks.length - 1] = 0;
  return ticks;
}

export function normalizeHexColor(value: unknown, fallback: string): string {
  const text = String(value || "").trim();
  return /^#[0-9a-f]{6}$/i.test(text) ? text : fallback;
}

/** CSS inline style fragment from vertical bar text tokens (preview). */
export function verticalBarTextStyleToCss(
  style: VerticalBarChartTextStyle,
): Record<string, string | number> {
  return {
    fontFamily: `${style.fontFamily}, sans-serif`,
    fontSize: `${style.fontSize}px`,
    fontWeight: style.fontWeight,
    lineHeight: `${style.lineHeight}px`,
  };
}

export function mergeVerticalBarTextStyle(
  input: Partial<VerticalBarChartTextStyle> | undefined,
  fallback: VerticalBarChartTextStyle,
): VerticalBarChartTextStyle {
  const family = String(input?.fontFamily ?? "").trim();
  return {
    fontFamily: family || fallback.fontFamily,
    fontSize: Math.round(clampNumber(input?.fontSize, 6, 96, fallback.fontSize)),
    fontWeight: Math.round(
      clampNumber(input?.fontWeight, 100, 900, fallback.fontWeight),
    ),
    lineHeight: Math.round(
      clampNumber(input?.lineHeight, 8, 160, fallback.lineHeight),
    ),
  };
}

/** CSS `rgba(...)` from `#RRGGBB` and alpha in 0–1 (invalid hex → black). */
export function rgbaFromHex(hex: string, alpha: number): string {
  const text = String(hex || "").trim();
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(text);
  const a = clamp(Number(alpha) || 0, 0, 1);
  if (!match) return `rgba(0,0,0,${a})`;
  const r = parseInt(match[1], 16);
  const g = parseInt(match[2], 16);
  const b = parseInt(match[3], 16);
  return `rgba(${r},${g},${b},${a})`;
}

export function formatAxisNumber(value: number): string {
  const roundedValue = Math.round(Number(value) || 0);
  const sign = roundedValue < 0 ? "-" : "";
  const absoluteValue = String(Math.abs(roundedValue));
  return `${sign}${absoluteValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

export function normalizeVerticalBarAxisLineVisibility(
  value: unknown,
): VerticalBarAxisLineVisibility {
  return value === "x" || value === "y" || value === "none" ? value : "both";
}

export function isVerticalBarXAxisLineVisible(
  value: VerticalBarAxisLineVisibility | undefined,
): boolean {
  return value === undefined || value === "both" || value === "x";
}

export function isVerticalBarYAxisLineVisible(
  value: VerticalBarAxisLineVisibility | undefined,
): boolean {
  return value === undefined || value === "both" || value === "y";
}

function maxSeriesValue(series: Array<{ values: number[] }>): number {
  let max = 1;
  series.forEach((item) => {
    item.values.forEach((value) => {
      max = Math.max(max, Number(value) || 0);
    });
  });
  return max;
}

export function normalizeVerticalBarChartConfig(
  input: Partial<VerticalBarChartConfig>,
  fallback: VerticalBarChartConfig,
): NormalizedVerticalBarChartConfig {
  const periodCount = Math.round(
    clampNumber(input.periodCount, 1, 24, fallback.periodCount),
  );
  const barMode = input.barMode === "single" ? "single" : "dual";
  const seriesCount = barMode === "single" ? 1 : 2;
  const labels: string[] = [];
  const inputLabels = Array.isArray(input.labels) ? input.labels : [];

  for (let index = 0; index < periodCount; index += 1) {
    const label = String(
      inputLabels[index] || fallback.labels[index] || "",
    ).trim();
    labels.push(label || `P${index + 1}`);
  }

  const series = [];
  for (let index = 0; index < seriesCount; index += 1) {
    const fallbackSeries = fallback.series[index] || fallback.series[0];
    const inputSeries = Array.isArray(input.series)
      ? input.series[index]
      : null;
    const inputValues =
      inputSeries && Array.isArray(inputSeries.values)
        ? inputSeries.values
        : [];
    const values: number[] = [];

    for (let valueIndex = 0; valueIndex < periodCount; valueIndex += 1) {
      const fallbackValue = fallbackSeries.values[valueIndex] || 0;
      const nextValue =
        inputValues[valueIndex] !== undefined
          ? inputValues[valueIndex]
          : fallbackValue;
      values.push(Math.max(0, Number(nextValue) || 0));
    }

    series.push({
      name:
        String((inputSeries && inputSeries.name) || "").trim() ||
        fallbackSeries.name,
      color: normalizeHexColor(
        inputSeries && inputSeries.color,
        fallbackSeries.color,
      ),
      values,
    });
  }

  const maxValue = niceMax(maxSeriesValue(series));
  const selectedIndex = Math.round(
    clampNumber(
      input.selectedIndex,
      -1,
      periodCount - 1,
      Math.min(fallback.selectedIndex, periodCount - 1),
    ),
  );

  const fallbackColor = fallback.color;
  const inputColor = input.color;

  return {
    chartType: "verticalBar",
    barMode,
    yAxisPosition: input.yAxisPosition === "left" ? "left" : "right",
    axisLineVisibility: normalizeVerticalBarAxisLineVisibility(
      input.axisLineVisibility,
    ),
    color: {
      axisLine: {
        key: String(inputColor?.axisLine?.key ?? fallbackColor.axisLine.key),
        value: normalizeHexColor(
          inputColor?.axisLine?.value,
          fallbackColor.axisLine.value,
        ),
      },
      gridLine: {
        key: String(inputColor?.gridLine?.key ?? fallbackColor.gridLine.key),
        value: normalizeHexColor(
          inputColor?.gridLine?.value,
          fallbackColor.gridLine.value,
        ),
      },
      selected: {
        labelBg: {
          value: normalizeHexColor(
            inputColor?.selected?.labelBg?.value,
            fallbackColor.selected.labelBg.value,
          ),
        },
        highlightBg: {
          value: normalizeHexColor(
            inputColor?.selected?.highlightBg?.value,
            fallbackColor.selected.highlightBg.value,
          ),
          opacity: clampNumber(
            inputColor?.selected?.highlightBg?.opacity,
            0,
            1,
            fallbackColor.selected.highlightBg.opacity,
          ),
        },
      },
      typography: {
        xAxisTitle: mergeVerticalBarTextStyle(
          inputColor?.typography?.xAxisTitle,
          fallbackColor.typography.xAxisTitle,
        ),
        yAxisTitle: mergeVerticalBarTextStyle(
          inputColor?.typography?.yAxisTitle,
          fallbackColor.typography.yAxisTitle,
        ),
        xAxisLabel: mergeVerticalBarTextStyle(
          inputColor?.typography?.xAxisLabel,
          fallbackColor.typography.xAxisLabel,
        ),
      },
      yAxisLabel: mergeVerticalBarTextStyle(
        inputColor?.yAxisLabel,
        fallbackColor.yAxisLabel,
      ),
    },
    periodCount,
    selectedIndex,
    width: Math.round(clampNumber(input.width, 260, 1200, fallback.width)),
    height: Math.round(clampNumber(input.height, 220, 900, fallback.height)),
    yAxisTitle: String(input.yAxisTitle || "").trim() || fallback.yAxisTitle,
    xAxisTitle: String(input.xAxisTitle || "").trim() || fallback.xAxisTitle,
    labels,
    series,
    maxValue,
    yTicks: buildTicks(maxValue, 3),
  };
}
