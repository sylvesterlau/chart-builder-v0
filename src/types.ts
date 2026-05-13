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

/** Figma-style paint token (key + hex value). */
export interface VerticalBarChartColorToken {
  key: string;
  value: string;
}

export interface VerticalBarChartSelectedColors {
  labelBg: {
    value: string;
  };
  highlightBg: {
    value: string;
    opacity: number;
  };
}

/** Vertical bar axis / title text (matches `verticalBarChartConfig.color`). */
export interface VerticalBarChartTextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
}

export interface VerticalBarChartConfig {
  chartType: "verticalBar";
  barMode: VerticalBarMode;
  yAxisPosition?: VerticalBarYAxisPosition;
  axisLineVisibility?: VerticalBarAxisLineVisibility;
  color: {
    axisLine: VerticalBarChartColorToken;
    gridLine: VerticalBarChartColorToken;
    selected: VerticalBarChartSelectedColors;
    typography: {
      xAxisTitle: VerticalBarChartTextStyle;
      yAxisTitle: VerticalBarChartTextStyle;
      xAxisLabel: VerticalBarChartTextStyle;
    };
    yAxisLabel: VerticalBarChartTextStyle;
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
