// helpers.ts for reused function
import { dataVisAt } from "./config";
import {
  ChartData,
  ColorToken,
  NormalizedVerticalBarChartConfig,
  TokenVarKeyLookupMatch,
  TokenVarKeyLookupResult,
  TypographyToken,
  VerticalBarAxisLineVisibility,
  VerticalBarChartConfig,
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
/** Split multiline util input into unique non-empty token paths. */
export function parseTokenPathLines(input: string): string[] {
  const seen = new Set<string>();
  const paths: string[] = [];
  for (const line of input.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || seen.has(trimmed)) {
      continue;
    }
    seen.add(trimmed);
    paths.push(trimmed);
  }
  return paths;
}

type LibraryVariableIndexEntry = TokenVarKeyLookupMatch & { name: string };

async function buildLibraryVariableIndex(): Promise<LibraryVariableIndexEntry[]> {
  const collections =
    await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
  const index: LibraryVariableIndexEntry[] = [];

  for (let i = 0; i < collections.length; i++) {
    const collection = collections[i];
    const varsInCollection =
      await figma.teamLibrary.getVariablesInLibraryCollectionAsync(
        collection.key,
      );
    const collectionName =
      (collection as { name?: string }).name || "Unknown Collection";
    const libraryName = (collection as { libraryName?: string }).libraryName;

    for (let j = 0; j < varsInCollection.length; j++) {
      const variable = varsInCollection[j];
      if (!variable.key) {
        continue;
      }
      index.push({
        name: variable.name || "",
        key: variable.key,
        collectionName,
        libraryName,
      });
    }
  }

  return index;
}

/** Batch lookup import keys for token paths in enabled team libraries. */
export async function lookupTokenVarKeys(
  paths: string[],
): Promise<TokenVarKeyLookupResult[]> {
  try {
    const index = await buildLibraryVariableIndex();

    return paths.map(function (path): TokenVarKeyLookupResult {
      const tokenName = dotToSlash(path);
      const matches = index.filter(function (entry) {
        return entry.name === tokenName;
      });

      if (matches.length === 1) {
        return {
          path,
          tokenName,
          status: "found",
          key: matches[0].key,
          matches,
        };
      }

      if (matches.length > 1) {
        return {
          path,
          tokenName,
          status: "multiple",
          matches,
          message: `${matches.length} matches — see keys below`,
        };
      }

      return {
        path,
        tokenName,
        status: "not_found",
        message: "Not found in any enabled library collection",
      };
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Token lookup failed";
    return paths.map(function (path): TokenVarKeyLookupResult {
      return {
        path,
        tokenName: dotToSlash(path),
        status: "error",
        message,
      };
    });
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

export function mergeColorToken(
  input: Partial<ColorToken> | undefined,
  fallback: ColorToken,
): ColorToken {
  const value = normalizeHexColor(input?.value, fallback.value);
  const next: ColorToken = { value };
  const key = input?.key !== undefined ? String(input.key) : fallback.key;
  if (key !== undefined) next.key = key;
  const opacity =
    input?.opacity !== undefined
      ? clampNumber(
          input.opacity,
          0,
          1,
          fallback.opacity ?? 0,
        )
      : fallback.opacity;
  if (opacity !== undefined) next.opacity = opacity;
  return next;
}

/** CSS inline style fragment from vertical bar text tokens (preview). */
export function verticalBarTextStyleToCss(
  style: TypographyToken,
): Record<string, string | number> {
  return {
    fontFamily: `${style.fontFamily}, sans-serif`,
    fontSize: `${style.fontSize}px`,
    fontWeight: style.fontWeight,
    lineHeight: `${style.lineHeight}px`,
  };
}

export function mergeVerticalBarTextStyle(
  input: Partial<TypographyToken> | undefined,
  fallback: TypographyToken,
): TypographyToken {
  const family = String(input?.fontFamily ?? "").trim();
  const merged: TypographyToken = {
    fontFamily: family || fallback.fontFamily,
    fontSize: Math.round(clampNumber(input?.fontSize, 6, 96, fallback.fontSize)),
    fontWeight: Math.round(
      clampNumber(input?.fontWeight, 100, 900, fallback.fontWeight),
    ),
    lineHeight: Math.round(
      clampNumber(input?.lineHeight, 8, 160, fallback.lineHeight),
    ),
  };
  const key = input?.key !== undefined ? String(input.key) : fallback.key;
  if (key !== undefined) merged.key = key;
  const figma = input?.figmaFontStyle ?? fallback.figmaFontStyle;
  if (figma !== undefined) merged.figmaFontStyle = figma;
  return merged;
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
      axisLine: mergeColorToken(inputColor?.axisLine, fallbackColor.axisLine),
      gridLine: mergeColorToken(inputColor?.gridLine, fallbackColor.gridLine),
      selected: {
        labelBg: mergeColorToken(
          inputColor?.selected?.labelBg,
          fallbackColor.selected.labelBg,
        ),
        highlightBg: mergeColorToken(
          inputColor?.selected?.highlightBg,
          fallbackColor.selected.highlightBg,
        ),
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
