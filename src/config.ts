import { title } from "./pages/HomePage.module.css";
import type { ColorToken, NumberToken, TypographyToken } from "./types";
import {
  createLinePointLabels,
  createSeededLineValues,
} from "./utils/chart/lineChartCalculate";

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

/** Shared type scale; component typography references these tokens. */
const typeScale = {
  caption: {
    regular: {
      fontFamily: "Inter",
      fontSize: 12,
      fontWeight: 400,
      lineHeight: 20,
      key: "8efff2a3611b231864f23fcff8139b81a85e5884",
    } satisfies Readonly<TypographyToken>,
    medium: {
      fontFamily: "Inter",
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 20,
      key: "19b21b435c609ea25d26a5226d0753d52faecce0",
    } satisfies Readonly<TypographyToken>,
  },
  label: {
    regular: {
      fontFamily: "Inter",
      fontSize: 14,
      fontWeight: 400,
      lineHeight: 20,
      key: "6c0bedfa63b7860e94170b3aa921c56e1e3636a7",
    } satisfies Readonly<TypographyToken>,
    medium: {
      fontFamily: "Inter",
      fontSize: 14,
      fontWeight: 500,
      lineHeight: 20,
      key: "fdea4ce6bf257fe42bbe7b3ffa6a794a03de69ad",
    } satisfies Readonly<TypographyToken>,
  },
  heading: {
    regular: {
      fontFamily: "Inter",
      fontSize: 19,
      fontWeight: 400,
      lineHeight: 27,
      key: "6e8a38a9703ae020956f1c20bdc845e42cb3dcdc",
    } satisfies Readonly<TypographyToken>,
    medium: {
      fontFamily: "Inter",
      fontSize: 19,
      fontWeight: 500,
      lineHeight: 27,
      key: "8823d3e6d7f127e6bf95013924394e2915e402d1",
    } satisfies Readonly<TypographyToken>,
  },

  title: {
    regular: {
      fontFamily: "Inter",
      fontSize: 28,
      fontWeight: 400,
      lineHeight: 36,
    } satisfies Readonly<TypographyToken>,
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
          key: "75273ac5284f2c3622e5cacb3a8014b150697d6b",
          value: "#347893",
        },
        {
          key: "7dfef965515036fbd93e05d731cf720cb4f397da",
          value: "#e76e84",
        },
        {
          key: "8f12f52426efb5a180e33ac41503a514dc49e405",
          value: "#518827",
        },
        {
          key: "9bc08fe61adf50bdb025ae4732ae6d58e83b751f",
          value: "#ec7046",
        },
        {
          key: "953b3f5abb2484207fa8ae3c5377461279d60176",
          value: "#509ebc",
        },
        {
          key: "a00bd776c66435449e1ebc42c451e65d382e5b5b",
          value: "#c03954",
        },
        {
          key: "e3363f488b0d37766669d8df8afdce8a101d722d",
          value: "#74a157",
        },
        {
          key: "d96e9733dcdbbdc81bec4394c8130187ee2fc38c",
          value: "#c64d24",
        },
        {
          key: "17a6df3c58f488b3ec195ab009d544d6dcc5f9c5",
          value: "#266076",
        },
        {
          key: "eec2b693c8fbe3904f72337dcb8a9c4f5c0ca0ab",
          value: "#f14e73",
        },
      ] satisfies ReadonlyArray<ColorToken>,
    },
    text: {
      primary: {
        key: "7ef8e5402ea8909015c25b7375e9fdb2da279880",
        value: "#333333",
      },
      secondary: {
        key: "",
        value: "#545454",
      },
      onDark: {
        key: "de745792eaecea4d6268c8a23ae8c511351bea7d",
        value: "#f3f3f3",
      } satisfies Readonly<ColorToken>,
    },
    background: {
      value: "#ffffff",
      key: "707ed5f9ab4b5788817328c6002d8026dcdf8ae2",
    } satisfies Readonly<ColorToken>,
  },
  typography: typeScale,
  chartTitle: {
    typography: typeScale.heading.medium,
    padding: {
      horizontal: {
        value: 16,
        key: "b53449f649ed6c7b19d70d515454342346f4e064",
      } satisfies NumberToken,
      vertical: {
        value: 8,
        key: "958a0d4a08f694b42b1c052cead41a901e796118",
      } satisfies NumberToken,
    },
  },

  cartesianKeyInfo: {
    typography: {
      range: typeScale.label.regular,
      label: typeScale.label.regular,
      valueLarge: typeScale.title.regular,
      value: typeScale.heading.regular,
      rowValue: typeScale.label.medium,
      unit: typeScale.label.medium,
      change: typeScale.label.medium,
    },
    spacing: {
      horizontalPadding: {
        value: 16,
        key: "f70676fabdbeee4adc99373eb788957ad7e2d71d",
      } satisfies NumberToken,
      topPadding: {
        value: 8,
      } satisfies NumberToken,
      bottomPadding: {
        value: 16,
        key: "deb8773dea736196da7559874f5b7a6c7ab50472",
      } satisfies NumberToken,
      itemGap: {
        value: 8,
        key: "cb58133bee7f18a9cce49cbc9c63c806e4f816b1",
      } satisfies NumberToken,
      rowGap: {
        value: 4,
      } satisfies NumberToken,
    },
    color: {
      gain: {
        value: "#007873",
      } satisfies Readonly<ColorToken>,
      loss: {
        value: "#a8000b",
      } satisfies Readonly<ColorToken>,
    },
  },

  cartesianTooltip: {
    width: 358,
    pointerWidth: 16,
    pointerHeight: 8,
    typography: {
      title: typeScale.label.medium,
      label: typeScale.label.regular,
      value: typeScale.label.medium,
    },
    spacing: {
      outerPadding: {
        value: 16,
      } satisfies NumberToken,
      panelPadding: {
        value: 12,
      } satisfies NumberToken,
      itemGap: {
        value: 8,
        key: "cb58133bee7f18a9cce49cbc9c63c806e4f816b1",
      } satisfies NumberToken,
      pointerInsetEnd: {
        value: 16,
      } satisfies NumberToken,
      pointerBottomPadding: {
        value: 2,
      } satisfies NumberToken,
    },
    color: {
      panel: {
        value: "#ffffff",
        key: "707ed5f9ab4b5788817328c6002d8026dcdf8ae2",
      } satisfies Readonly<ColorToken>,
      border: {
        value: "#000000",
        key: "0b7fca77c493eec1e8cbd9a1c95672e80af34dbe",
      } satisfies Readonly<ColorToken>,
    },
  },

  legend: {
    typography: {
      label: typeScale.label.regular,
      value: typeScale.label.medium,
      percentage: typeScale.label.regular,
    },
    spacing: {
      horizontalPadding: {
        value: 16,
        key: "f70676fabdbeee4adc99373eb788957ad7e2d71d",
      } satisfies NumberToken,
      verticalPadding: {
        value: 12,
        key: "deb8773dea736196da7559874f5b7a6c7ab50472",
      } satisfies NumberToken,
      gap: {
        value: 8,
        key: "cb58133bee7f18a9cce49cbc9c63c806e4f816b1",
      } satisfies NumberToken,
      /** Label ↔ percentage gap in left-and-right legend rows. */
      leftRightItemSpacing: {
        value: 4,
      } satisfies NumberToken,
    },
    shape: {
      size: {
        value: 14,
      } satisfies NumberToken,
    },
    color: {
      divider: {
        key: "8d6515c52d71ded4d4487081d1f62ff9a47e8ff2",
        value: "#EDEDED",
      } satisfies Readonly<ColorToken>,
    },
  },

  chart: {
    general: {
      frameWidth: 390,
    },
    semiDonut: {
      ringWidth: 20,
      sliceGap: 2,
      totalValue: {
        typography: {
          title: typeScale.label.regular,
          value: typeScale.heading.medium,
        },
      },
    },
    /** Pie */
    pie: {
      frameWidthMin: 360,
      frameWidthMax: 1000,
      frameHeight: 312,
      chartSize: 200,
      sizeMinRatio: 0.3,
      sizeMaxRatio: 0.6,
      radius: 100,
      radiusLarge: 120,
      ratioMin: 0.5,
      ratioMax: 0.99,
      ringWidth: 20,
      sliceGap: 1.5,
      sliceGapMin: 0,
      sliceGapMax: 20,
      indicator: {
        lineExtend: 8,
        lineExtendMin: 0,
        lineExtendMax: 20,
        labelCenterOffset: 30,
        sliceStrokeWeight: {
          value: 1.5,
          key: "e7a7a7e1c7572287d371c5fb928b4cac8879bda6",
        } satisfies NumberToken,
        leaderLineStrokeWeight: {
          value: 1.5,
          key: "02a12e48d546e86ffbc3cbe52bf3027d21b40815",
        } satisfies NumberToken,
        typography: {
          label: typeScale.caption.regular,
          percentage: typeScale.caption.medium,
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
      key: "da0e838017502cd291f8c93681bf1b02d32f4dc2",
    } satisfies Readonly<ColorToken>,
    gridLine: {
      value: "#F1F1F1",
      key: "0fff85933d821adeeec27a700a8abffd45dad669",
    } satisfies Readonly<ColorToken>,
    selected: {
      labelBg: {
        key: "0b7fca77c493eec1e8cbd9a1c95672e80af34dbe",
        value: "#000000",
      } satisfies Readonly<ColorToken>,
      highlightBg: {
        key: "407fad596e932ec9df76f4c73d211d8ff58f6ccf",
        value: "#000000",
        opacity: 0.08,
      } satisfies Readonly<ColorToken>,
    },
    typography: {
      xAxisTitle: typeScale.caption.medium,
      yAxisTitle: typeScale.caption.medium,
      xAxisLabel: typeScale.caption.regular,
    },
    yAxisLabel: typeScale.caption.regular,
  },
} as const;

export const verticalBarChartConfig = {
  chartType: "verticalBar" as const,
  chartTitle: "Chart title",
  barMode: "dual" as const,
  yAxisPosition: cartesianChartConfig.yAxisPosition,
  axisLineVisibility: cartesianChartConfig.axisLineVisibility,
  color: cartesianChartConfig.color,
  periodCount: 6,
  selectedIndex: 3,
  width: 390,
  height: 280,
  yAxisTitle: "USD",
  xAxisTitle: "Year 2026",
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

export const lineChartConfig = {
  chartType: "lineChart" as const,
  chartTitle: "Chart title",
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
      name: "Product A",
      color: ds.colors.dataVis.general[0].value,
      values: createSeededLineValues(100, 8, 132, 14, 0.7, 110, 238),
    },
    {
      name: "Product B",
      color: ds.colors.dataVis.general[1].value,
      values: createSeededLineValues(100, 13, 168, 7, -0.08, 116, 230),
    },
    {
      name: "Product C",
      color: ds.colors.dataVis.general[2].value,
      values: createSeededLineValues(100, 21, 205, 5, -0.12, 124, 236),
    },
  ],
} as const;

// --- Legacy flat exports (reference `ds`; existing imports keep working) ---

export const semiDonutChartConfig = ds.chart.semiDonut;
export const pieChartConfig = ds.chart.pie;
export const chartGeneralConfig = ds.chart.general;

/** Semi-donut edit/draw layout constraints (not part of design-system tokens). */
export const semiDonutChartLayout = {
  frameWidthMin: 360,
  frameWidthMax: 1000,
  defaultChartSize: 318,
  sizeMinRatio: 0.5,
  sizeMaxRatio: 1,
  ratioMin: 0.5,
  ratioMax: 0.99,
  sliceGapMin: 0,
  sliceGapMax: 20,
} as const;

/** Horizontal bar edit/draw layout constraints (not part of design-system tokens). */
export const horizontalBarChartLayout = {
  sliceGap: 2,
  sliceGapMin: 0,
  sliceGapMax: 20,
  horizontalPadding: {
    value: 16,
  } satisfies NumberToken,
  verticalPadding: {
    value: 16,
  } satisfies NumberToken,
} as const;

export const legendSpacingConfig = ds.legend.spacing;
export const legendShapeConfig = ds.legend.shape;
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

export const cartesianKeyInfoConfig = ds.cartesianKeyInfo;
export const cartesianTooltipConfig = ds.cartesianTooltip;

/** Flat typography map for APIs that expect `typography.chartTitle` etc. */
export const typography = {
  chartTitle: chartTitleConfig.typography,
  legend: ds.legend.typography,
  indicator: ds.chart.pie.indicator.typography,
  totalValue: ds.chart.semiDonut.totalValue.typography,
} as const;
