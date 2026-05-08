// Define types for chart data
export interface ChartDataItem {
  label: string;
  value: number;
  colorToken?: string | null;
}
export type LegendStyle = "none" | "leftAndRight" | "topAndBottom";
export interface ChartData {
  chartTitle?: string;
  data: ChartDataItem[];
  legendStyle?: LegendStyle;
  showPercentage?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
}

export type VerticalBarMode = "single" | "dual";

export interface VerticalBarChartSeries {
  name: string;
  color: string;
  values: number[];
}

export interface VerticalBarChartConfig {
  chartType: "verticalBar";
  barMode: VerticalBarMode;
  periodCount: number;
  selectedIndex: number;
  width: number;
  height: number;
  yAxisTitle: string;
  xAxisTitle: string;
  labels: string[];
  series: VerticalBarChartSeries[];
}

export interface NormalizedVerticalBarChartConfig
  extends VerticalBarChartConfig {
  maxValue: number;
  yTicks: number[];
}
