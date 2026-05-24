/** Figma FLOAT variable: numeric `value` with optional library import `key`. */
export interface NumberToken {
  value: number;
  /** Library import key for `importVariableByKeyAsync`. */
  key?: string;
}

/** Figma-style paint: hex `value`, optional variable `key`, optional `opacity` (0–1). */
export interface ColorToken {
  value: string;
  opacity?: number;
  /** Library import key for `importVariableByKeyAsync`. */
  key?: string;
}

/** One row from Util page batch variable-key lookup. */
export interface TokenVarKeyLookupMatch {
  key: string;
  collectionName: string;
  libraryName?: string;
}

export type TokenVarKeyLookupStatus = "found" | "multiple" | "not_found" | "error";

export interface TokenVarKeyLookupResult {
  /** User-entered path (trimmed line). */
  path: string;
  /** Normalized name used for library search (`dotToSlash`). */
  tokenName: string;
  status: TokenVarKeyLookupStatus;
  key?: string;
  matches?: TokenVarKeyLookupMatch[];
  message?: string;
}

export type SelectedTextStyleKeyStatus = "found" | "not_found" | "error";

/** Result of reading text style import key from the current selection. */
export interface SelectedTextStyleKeyResult {
  status: SelectedTextStyleKeyStatus;
  /** Selected text layer name. */
  layerName?: string;
  /** Figma text style name (e.g. `heading/medium`). */
  styleName?: string;
  /** Import key for `figma.importStyleByKeyAsync`. */
  key?: string;
  message?: string;
}

/** Figma-aligned text style; optional variable `key` and Figma style name override. */
export interface TypographyToken {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  /** Library import key for `figma.importStyleByKeyAsync`. */
  key?: string;
  figmaFontStyle?: string;
}

// Define types for chart data
export interface ChartDataItem {
  label: string;
  value: number;
  colorToken?: string | null;
}
export type LegendStyle = "none" | "leftAndRight" | "topAndBottom";

/** Pie/donut screen selector; semi-donut uses its own page. */
export type PiePageChartKind = "pie" | "donut" | "semiDonut";
export interface ChartData {
  chartTitle?: string;
  /** Pie/donut generate payload only; omit for semi-donut submissions. */
  pieChartKind?: Exclude<PiePageChartKind, "semiDonut">;
  data: ChartDataItem[];
  legendStyle?: LegendStyle;
  showPercentage?: boolean;
  showIndicator?: boolean;
  showIndicatorPercentage?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
  showTotalValue?: boolean;
  totalValueTitle?: string;
}

export type VerticalBarMode = "single" | "dual";
export type CartesianYAxisPosition = "left" | "right";
export type CartesianAxisLineVisibility = "both" | "x" | "y" | "none";
export type LineChartMode = "single" | "multi";
export type LineChartRange = "partial" | "full";

export interface VerticalBarChartSeries {
  name: string;
  color: string;
  values: number[];
}

export interface LineChartSeries {
  name: string;
  color: string;
  values: number[];
}

export interface CartesianChartColorConfig {
  axisLine: ColorToken;
  gridLine: ColorToken;
  selected: {
    labelBg: ColorToken;
    highlightBg: ColorToken;
  };
  typography: {
    xAxisTitle: TypographyToken;
    yAxisTitle: TypographyToken;
    xAxisLabel: TypographyToken;
  };
  yAxisLabel: TypographyToken;
}

export interface VerticalBarChartConfig {
  chartType: "verticalBar";
  chartTitle: string;
  barMode: VerticalBarMode;
  yAxisPosition?: CartesianYAxisPosition;
  axisLineVisibility?: CartesianAxisLineVisibility;
  color: CartesianChartColorConfig;
  periodCount: number;
  selectedIndex: number;
  width: number;
  height: number;
  yAxisTitle: string;
  xAxisTitle: string;
  labels: string[];
  series: VerticalBarChartSeries[];
}

export interface NormalizedVerticalBarChartConfig extends VerticalBarChartConfig {
  maxValue: number;
  yTicks: number[];
}

export interface LineChartConfig {
  chartType: "lineChart";
  chartTitle: string;
  lineMode: LineChartMode;
  lineRange: LineChartRange;
  yAxisPosition?: CartesianYAxisPosition;
  axisLineVisibility?: CartesianAxisLineVisibility;
  color: CartesianChartColorConfig;
  pointCount: number;
  selectedIndex: number;
  width: number;
  height: number;
  minValue: number;
  maxValue: number;
  yAxisTitle: string;
  xAxisLabels: string[];
  pointLabels: string[];
  series: LineChartSeries[];
}

export interface NormalizedLineChartConfig extends LineChartConfig {
  yTicks: number[];
}
