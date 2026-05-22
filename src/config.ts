import type { ColorToken, TypographyToken } from "./types";

// chart sample data — demo inputs, not visual tokens
export const sampleData = {
  spending: {
    data: [
      { label: "Shopping", value: 412 },
      { label: "Travel", value: 252 },
      { label: "Food", value: 159 },
      { label: "Transportation", value: 112 },
    ],
  },
};

/** Plugin panel window sizes */
export const pluginUISize = {
  homePage: {
    width: 348,
    height: 490,
  },
  editPage: {
    width: 640,
    height: 490,
  },
  verticalBarPage: {
    width: 680,
    height: 560,
  },
} as const;

/**
 * Design system: shared colors plus component-scoped layout & typography.
 * Use `ds` for new code; flat exports below alias into `ds` where applicable.
 */
export const ds = {
  colors: {
    /** Ordered palette (by index) for slices / bars. */
    dataVis: {
      general: [
        {
          key: "875460d9abc2d89a5bb76a9a7a2e9e43d4516efa",
          value: "#347893",
        },
        {
          key: "ade3677d0cf6c19280ba43cc438d6112af0657c6",
          value: "#e76e84",
        },
        {
          key: "2a18acdfd9be77b1f87f24a271bac3674196e6c7",
          value: "#518827",
        },
        {
          key: "af459e2d6f04e6f778fdadfa0392569f5404a6d6",
          value: "#ec7046",
        },
        {
          key: "61f03e307c88fd771dba5d5be8bb1062455e1f2a",
          value: "#509ebc",
        },
        { key: "", value: "#c03954" },
        { key: "", value: "#74a157" },
        { key: "", value: "#c64d24" },
        { key: "", value: "#266076" },
        { key: "", value: "#f14e73" },
      ] satisfies ReadonlyArray<ColorToken>,
    },
    text: {
      primary: {
        key: "",
        value: "#333333",
      },
      secondary: {
        key: "",
        value: "#545454",
      },
      onDark: {
        key: "",
        value: "#ffffff",
      } satisfies Readonly<ColorToken>,
    },
    background: {
      value: "#ffffff",
      key: "",
    } satisfies Readonly<ColorToken>,
  },

  chartTitle: {
    typography: {
      fontFamily: "Inter",
      fontSize: 19,
      fontWeight: 500,
      lineHeight: 23,
    },
    padding: {
      horizontal: 16,
      vertical: 8,
    },
  },

  legend: {
    typography: {
      label: {
        fontFamily: "Inter",
        fontSize: 14,
        fontWeight: 400,
        lineHeight: 20,
      } satisfies Readonly<TypographyToken>,
      value: {
        fontFamily: "Inter",
        fontSize: 14,
        fontWeight: 600,
        lineHeight: 20,
      } satisfies Readonly<TypographyToken>,
      percentage: {
        fontFamily: "Inter",
        fontSize: 14,
        fontWeight: 400,
        lineHeight: 20,
      } satisfies Readonly<TypographyToken>,
    },
    spacing: {
      horizontalPadding: 16,
      verticalPadding: 12,
      gap: 8,
    },
    color: {
      divider: {
        key: "",
        value: "#EDEDED",
      } satisfies Readonly<ColorToken>,
    },
  },

  chart: {
    semiDonut: {
      size: 318,
      ratio: 0.88,
      totalValue: {
        typography: {
          title: {
            fontFamily: "Inter",
            fontSize: 14,
            fontWeight: 400,
            lineHeight: 20,
          } satisfies Readonly<TypographyToken>,
          value: {
            fontFamily: "Inter",
            fontSize: 19,
            fontWeight: 600,
            lineHeight: 27,
          } satisfies Readonly<TypographyToken>,
        },
      },
    },
    /** Pie + donut preview/draw (donut uses `donutInnerRadiusRatio`). */
    pie: {
      frameWidth: 390,
      frameHeight: 312,
      radius: 100,
      radiusLarge: 120,
      /** Full donut hole as a fraction of outer radius (preview + draw). */
      donutInnerRadiusRatio: 0.8,
      indicator: {
        /** Leader line extend past slice outer edge (px). */
        lineExtend: 8,
        /** Offset from line end to label anchor (px). */
        labelCenterOffset: 30,
        /** Separator stroke between pie/donut slices (SVG path stroke + Figma ellipse). */
        sliceStrokeWeight: 1.5,
        /** Indicator leader line stroke (SVG line + Figma vector). */
        leaderLineStrokeWeight: 1.5,
        typography: {
          label: {
            fontFamily: "Inter",
            fontSize: 12,
            fontWeight: 400,
            lineHeight: 20,
          } satisfies Readonly<TypographyToken>,
          percentage: {
            fontFamily: "Inter",
            fontSize: 12,
            fontWeight: 600,
            lineHeight: 20,
          } satisfies Readonly<TypographyToken>,
        },
      },
    },
  },
} as const;

export const cartesianChartConfig = {
  yAxisPosition: "right" as const,
  axisLineVisibility: "y" as const,
  color: {
    axisLine: {
      value: "#333333",
      key: "",
    } satisfies Readonly<ColorToken>,
    gridLine: {
      value: "#F1F1F1",
      key: "",
    } satisfies Readonly<ColorToken>,
    selected: {
      labelBg: {
        value: "#000000",
      } satisfies Readonly<ColorToken>,
      highlightBg: {
        value: "#000000",
        opacity: 0.08,
      } satisfies Readonly<ColorToken>,
    },
    typography: {
      xAxisTitle: {
        fontFamily: "Inter",
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 20,
      } satisfies Readonly<TypographyToken>,
      yAxisTitle: {
        fontFamily: "Inter",
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 20,
      } satisfies Readonly<TypographyToken>,
      xAxisLabel: {
        fontFamily: "Inter",
        fontSize: 12,
        fontWeight: 400,
        lineHeight: 20,
      } satisfies Readonly<TypographyToken>,
    },
    yAxisLabel: {
      fontFamily: "Inter",
      fontSize: 12,
      fontWeight: 400,
      lineHeight: 20,
    } satisfies Readonly<TypographyToken>,
  },
} as const;

export const verticalBarChartConfig = {
  chartType: "verticalBar" as const,
  barMode: "dual" as const,
  yAxisPosition: cartesianChartConfig.yAxisPosition,
  axisLineVisibility: cartesianChartConfig.axisLineVisibility,
  color: cartesianChartConfig.color,
  periodCount: 6,
  selectedIndex: 3,
  width: 390,
  height: 280,
  yAxisTitle: "USD",
  xAxisTitle: "Year 2023",
  labels: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  series: [
    {
      name: "Product A",
      color: ds.colors.dataVis.general[0].value,
      values: [9120, 12500, 28880, 20300, 24500, 26880],
    },
    {
      name: "Product B",
      color: ds.colors.dataVis.general[1].value,
      values: [6320, 20300, 15320, 6320, 3000, 26880],
    },
  ],
} as const;

function createSeededLineValues(
  count: number,
  seed: number,
  start: number,
  volatility: number,
  drift: number,
  min: number,
  max: number,
): number[] {
  let state = seed;
  let value = start;
  const values: number[] = [];
  for (let index = 0; index < count; index += 1) {
    state = (state * 1664525 + 1013904223) % 4294967296;
    const random = state / 4294967296 - 0.5;
    const wave = Math.sin(index / 6) * volatility * 0.35;
    value = Math.max(min, Math.min(max, value + random * volatility + drift + wave));
    values.push(Math.round(value));
  }
  return values;
}

function createLinePointLabels(count: number): string[] {
  const start = new Date(Date.UTC(2026, 0, 1));
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      timeZone: "UTC",
    });
  });
}

export const lineChartConfig = {
  chartType: "lineChart" as const,
  lineMode: "single" as const,
  lineRange: "partial" as const,
  yAxisPosition: cartesianChartConfig.yAxisPosition,
  axisLineVisibility: cartesianChartConfig.axisLineVisibility,
  color: cartesianChartConfig.color,
  pointCount: 100,
  selectedIndex: 64,
  width: 390,
  height: 320,
  minValue: 100,
  maxValue: 250,
  yAxisTitle: "HKD",
  xAxisLabels: ["Jan 2026", "", "", "Feb 2026", "", "", "Mar 2026"],
  pointLabels: createLinePointLabels(100),
  series: [
    {
      name: "Line 1",
      color: ds.colors.dataVis.general[0].value,
      values: createSeededLineValues(100, 8, 132, 14, 0.7, 110, 238),
    },
    {
      name: "Line 2",
      color: ds.colors.dataVis.general[1].value,
      values: createSeededLineValues(100, 13, 168, 7, -0.08, 116, 230),
    },
    {
      name: "Line 3",
      color: ds.colors.dataVis.general[2].value,
      values: createSeededLineValues(100, 21, 205, 5, -0.12, 124, 236),
    },
  ],
} as const;
/** Cycle through `ds.colors.dataVis.general` by row index. */
export function dataVisAt(index: number): { key: string; value: string } {
  const palette = ds.colors.dataVis.general;
  return palette[index % palette.length];
}

// --- Legacy flat exports (reference `ds`; existing imports keep working) ---

export const semiDonutChartConfig = ds.chart.semiDonut;
export const pieChartConfig = ds.chart.pie;
export const legendSpacingConfig = ds.legend.spacing;
export const dataVisColor = ds.colors.dataVis;
export const textColor = ds.colors.text;
export const dividerColor = ds.legend.color.divider;

/** Canvas / chart area fill + pie·donut slice stroke (Figma + UI preview). */
export const chartBackground = ds.colors.background;

/** Chart title: padding + typography (`drawChartTitle.ts`, `ChartTitlePreview`, design system). */
export const chartTitleConfig = {
  padding: ds.chartTitle.padding,
  typography: ds.chartTitle.typography,
} as const;

/** Flat typography map for APIs that expect `typography.chartTitle` etc. */
export const typography = {
  chartTitle: chartTitleConfig.typography,
  legend: ds.legend.typography,
  indicator: ds.chart.pie.indicator.typography,
  totalValue: ds.chart.semiDonut.totalValue.typography,
} as const;
