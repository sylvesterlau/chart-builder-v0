// Define types for chart data
export interface ChartDataItem {
  label: string;
  value: number;
  colorToken?: string | null;
}
export interface ChartData {
  data: ChartDataItem[];
}
