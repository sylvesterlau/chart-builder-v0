/** Figma-style paint: hex `value`, optional variable `key`, optional `opacity` (0–1). */
export interface ColorToken {
  value: string;
  opacity?: number;
  key?: string;
}

/** Figma-aligned text style; optional variable `key` and Figma style name override. */
export interface TypographyToken {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
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

/** Unified pie/donut/semi-donut screen selector; semi uses `SUBMIT_SEMI_DONUT_CHART_DATA` + `drawSemiDonutChart`. */
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
export type VerticalBarYAxisPosition = "left" | "right";
export type VerticalBarAxisLineVisibility = "both" | "x" | "y" | "none";

export interface VerticalBarChartSeries {
  name: string;
  color: string;
  values: number[];
}

export interface VerticalBarChartConfig {
  chartType: "verticalBar";
  barMode: VerticalBarMode;
  yAxisPosition?: VerticalBarYAxisPosition;
  axisLineVisibility?: VerticalBarAxisLineVisibility;
  color: {
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
  };
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
