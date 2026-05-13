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
