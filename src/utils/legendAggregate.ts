/** Show first N items normally; remaining items nest under an "Others" row. */
export const LEGEND_LEADING_ITEM_COUNT = 5;

/** Aggregate when legend/chart item count exceeds this threshold. */
export const LEGEND_AGGREGATE_THRESHOLD = 6;

export const LEGEND_OTHERS_LABEL = "Others";

export function shouldAggregateLegendItems(itemCount: number): boolean {
  return itemCount > LEGEND_AGGREGATE_THRESHOLD;
}

export function resolveOthersLabel(label?: string | null): string {
  const trimmed = label?.trim();
  return trimmed || LEGEND_OTHERS_LABEL;
}

/** Same inclusion rule used by preview, draw, and config aggregation cues. */
export function isLegendSourceItem(item: {
  label: string;
  value: number;
}): boolean {
  return item.label.trim() !== "" || item.value > 0;
}

export function toLegendSourceItems<T extends { label: string; value: number }>(
  items: T[],
): Array<T & { index: number }> {
  return items
    .map((item, index) => ({ ...item, index }))
    .filter((item) => isLegendSourceItem(item));
}

export interface LegendAggregationLayout {
  active: boolean;
  /** Original indices that nest under Others (matches preview/draw). */
  nestedIndices: ReadonlySet<number>;
  /** Insert the Others row before this original index. */
  othersInsertBeforeIndex: number | null;
  /** Color for the Others swatch (6th source item). */
  othersColorIndex: number | null;
}

/**
 * Config-UI layout for Others cues, derived from the same filtered source
 * list as preview/draw aggregation.
 */
export function getLegendAggregationLayout(
  items: Array<{ label: string; value: number }>,
): LegendAggregationLayout {
  const sourceItems = toLegendSourceItems(items);
  if (!shouldAggregateLegendItems(sourceItems.length)) {
    return {
      active: false,
      nestedIndices: new Set(),
      othersInsertBeforeIndex: null,
      othersColorIndex: null,
    };
  }

  const nested = sourceItems.slice(LEGEND_LEADING_ITEM_COUNT);
  return {
    active: true,
    nestedIndices: new Set(nested.map((item) => item.index)),
    othersInsertBeforeIndex: nested[0].index,
    othersColorIndex: nested[0].index,
  };
}

export type LegendEntryKind = "item" | "others" | "nested";

export interface LegendSourceItem {
  index: number;
  label: string;
  value: number;
  /** Precomputed percentage of total; used by Figma draw path. */
  percentage?: number;
}

export interface LegendEntry {
  kind: LegendEntryKind;
  /** Index into dataVis palette (Others uses the 6th item's color). */
  colorIndex: number;
  label: string;
  value: number;
  percentage: number | null;
  showValue: boolean;
  showPercentage: boolean;
  transparentSwatch: boolean;
}

export interface ChartSegmentItem {
  /** Index into dataVis palette (Others uses the 6th item's color). */
  colorIndex: number;
  label: string;
  value: number;
}

function defaultLabel(item: { index: number; label: string }): string {
  return item.label.trim() || `Item ${item.index + 1}`;
}

/**
 * Build chart slices/bars with optional "Others" aggregation.
 * Uses the same item order/count as the legend (including zero-value rows),
 * then drops zero-value segments so they don't take visual space.
 * When item count > 6: first 5 normal + one Others bar/slice (sum, 6th color).
 * Chart area shows at most 6 positive segments.
 */
export function buildChartSegments(
  items: Array<{ index: number; label: string; value: number }>,
  othersLabel: string = LEGEND_OTHERS_LABEL,
): ChartSegmentItem[] {
  const resolvedOthersLabel = resolveOthersLabel(othersLabel);
  const segments =
    items.length <= LEGEND_AGGREGATE_THRESHOLD
      ? items.map((item) => ({
          colorIndex: item.index,
          label: defaultLabel(item),
          value: item.value,
        }))
      : (() => {
          const leading = items.slice(0, LEGEND_LEADING_ITEM_COUNT);
          const nested = items.slice(LEGEND_LEADING_ITEM_COUNT);
          return [
            ...leading.map((item) => ({
              colorIndex: item.index,
              label: defaultLabel(item),
              value: item.value,
            })),
            {
              colorIndex: nested[0].index,
              label: resolvedOthersLabel,
              value: nested.reduce((sum, item) => sum + item.value, 0),
            },
          ];
        })();

  return segments.filter((item) => item.value > 0);
}

/**
 * Build legend rows with optional "Others" aggregation.
 * When item count > 6: first 5 normal, then Others (6th color, no %/value),
 * then remaining items with transparent swatches.
 */
export function buildLegendEntries(
  items: LegendSourceItem[],
  othersLabel: string = LEGEND_OTHERS_LABEL,
): LegendEntry[] {
  const resolvedOthersLabel = resolveOthersLabel(othersLabel);
  if (items.length <= LEGEND_AGGREGATE_THRESHOLD) {
    return items.map((item) => ({
      kind: "item" as const,
      colorIndex: item.index,
      label: defaultLabel(item),
      value: item.value,
      percentage: item.percentage ?? null,
      showValue: true,
      showPercentage: true,
      transparentSwatch: false,
    }));
  }

  const leading = items.slice(0, LEGEND_LEADING_ITEM_COUNT);
  const nested = items.slice(LEGEND_LEADING_ITEM_COUNT);
  const othersColorIndex = nested[0].index;
  const entries: LegendEntry[] = [];

  for (const item of leading) {
    entries.push({
      kind: "item",
      colorIndex: item.index,
      label: defaultLabel(item),
      value: item.value,
      percentage: item.percentage ?? null,
      showValue: true,
      showPercentage: true,
      transparentSwatch: false,
    });
  }

  entries.push({
    kind: "others",
    colorIndex: othersColorIndex,
    label: resolvedOthersLabel,
    value: 0,
    percentage: null,
    showValue: false,
    showPercentage: false,
    transparentSwatch: false,
  });

  for (const item of nested) {
    entries.push({
      kind: "nested",
      colorIndex: item.index,
      label: defaultLabel(item),
      value: item.value,
      percentage: item.percentage ?? null,
      showValue: true,
      showPercentage: true,
      transparentSwatch: true,
    });
  }

  return entries;
}
