import {
  Button,
  Checkbox,
  IconPlus16,
  IconBorderLeftSmall24,
  IconBorderRightSmall24,
  RangeSlider,
  SegmentedControl,
  SegmentedControlOption,
  Stack,
  Text,
  Textbox,
  TextboxNumeric,
  VerticalSpace,
  Divider,
} from "@create-figma-plugin/ui";
import { emit } from "@create-figma-plugin/utilities";
import { h } from "preact";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "preact/hooks";
import LineChartPreview from "../components/LineChartPreview";
import ChartTitleControl, {
  getEffectiveChartTitle,
} from "../components/editControl/ChartTitleControl";
import EditSectionHeader from "../components/editControl/EditSectionHeader";
import { dataVisColor, lineChartConfig, pluginUISize } from "../config";
import {
  isCartesianXAxisLineVisible,
  isCartesianYAxisLineVisible,
} from "../helpers";
import {
  LineChartConfig,
  LineChartRange,
  LineChartSeries,
  CartesianAxisLineVisibility,
  CartesianYAxisPosition,
  YAxisDataType,
} from "../types";
import styles from "../ui.css";
import { useRefreshDesignTokensOnMount } from "../utils/useRefreshDesignTokens";

interface LineChartPageProps {
  onBack: () => void;
}

type XAxisMode = "time" | "date";

const Y_AXIS_POSITION_OPTIONS: Array<SegmentedControlOption> = [
  { children: <IconBorderLeftSmall24 />, value: "left" },
  { children: <IconBorderRightSmall24 />, value: "right" },
];
const X_AXIS_MODE_OPTIONS: Array<SegmentedControlOption> = [
  { children: "Date", value: "date" },
  { children: "Time", value: "time" },
];
const Y_AXIS_DATA_TYPE_OPTIONS: Array<SegmentedControlOption> = [
  { children: "Num", value: "number" },
  { children: "Percent", value: "percentage" },
];
const LINE_RANGE_OPTIONS: Array<SegmentedControlOption> = [
  { children: "Partial", value: "partial" },
  { children: "Full", value: "full" },
];
const MIN_POINTS = 2;
const MAX_POINTS = 180;
const DEFAULT_START_DATE = "2026-01";
const DEFAULT_END_DATE = "2026-03";
const DEFAULT_START_TIME = "09:30";
const DEFAULT_END_TIME = "16:00";
const DEFAULT_PERCENT_MIN_VALUE = 0;
const DEFAULT_PERCENT_MAX_VALUE = 100;
const DATE_INPUT_PATTERN = /^\d{4}-\d{2}$/;
const TIME_INPUT_PATTERN = /^\d{2}:\d{2}$/;
const PARTIAL_LINE_RANGE_RATIO = 0.788;
const DEFAULT_TOOLTIP_PERCENT = 75;
const MIN_DATASETS = 1;
const MAX_DATASETS = 3;

function cartesianAxisLineVisibilityFromGridToggles(
  showXGridLine: boolean,
  showYGridLine: boolean,
): CartesianAxisLineVisibility {
  if (showXGridLine && showYGridLine) return "both";
  if (showXGridLine) return "x";
  if (showYGridLine) return "y";
  return "none";
}

function clampPointCount(value: number): number {
  return Math.max(MIN_POINTS, Math.min(MAX_POINTS, Math.round(value)));
}

function parseInputNumber(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function sanitizeIntegerInput(value: string): string {
  return value.replace(/[^\d]/g, "");
}

function sanitizeDateInput(value: string): string {
  return value.replace(/[^\d-]/g, "").slice(0, 7);
}

function sanitizeTimeInput(value: string): string {
  return value.replace(/[^\d:]/g, "").slice(0, 5);
}

function sanitizeNumberInput(value: string): string {
  let hasDecimal = false;
  let hasSign = false;
  return value
    .replace(/[^\d.-]/g, "")
    .split("")
    .filter((character, index) => {
      if (character === "-") {
        if (hasSign || index !== 0) return false;
        hasSign = true;
        return true;
      }
      if (character !== ".") return true;
      if (hasDecimal) return false;
      hasDecimal = true;
      return true;
    })
    .join("");
}

function tooltipIndexFromPercent(percent: number, pointCount: number): number {
  const boundedPercent = Math.max(0, Math.min(100, Math.round(percent)));
  return Math.round(((pointCount - 1) * boundedPercent) / 100);
}

function clampTooltipPercent(value: number | null): number {
  if (value === null) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function syncTooltipRangeProgress(
  inputElement: HTMLInputElement | null,
  percent: number,
  showTooltip: boolean,
) {
  if (inputElement === null) return;
  if (showTooltip === false) {
    inputElement.style.background = "";
    return;
  }
  const sliderThumbWidth = inputElement.offsetHeight;
  const progressX =
    inputElement.offsetWidth > 0
      ? (percent / 100) * (inputElement.offsetWidth - sliderThumbWidth) +
        sliderThumbWidth / 2
      : percent;
  const progressStop =
    inputElement.offsetWidth > 0 ? `${progressX}px` : `${percent}%`;
  inputElement.style.background = `linear-gradient(to right, var(--figma-color-bg-brand) ${progressStop}, transparent ${progressStop})`;
}

function lineRangeRatio(lineRange: LineChartRange): number {
  return lineRange === "full" ? 1 : PARTIAL_LINE_RANGE_RATIO;
}

function createPointLabels(pointCount: number): string[] {
  return createTradingPointLabels(
    pointCount,
    parseDateInput(DEFAULT_START_DATE) as Date,
    parseDateInput(DEFAULT_END_DATE) as Date,
  );
}

function parseTimeInput(value: string): number | null {
  if (!TIME_INPUT_PATTERN.test(value)) return null;
  const [hours, minutes] = value.split(":").map(Number);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function formatAxisTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function createTimePointLabels(
  pointCount: number,
  startMinutes: number,
  endMinutes: number,
): string[] {
  if (pointCount <= 1) return [formatAxisTime(startMinutes)];
  const range = endMinutes - startMinutes;
  return Array.from({ length: pointCount }, (_, index) => {
    const minutes = Math.round(
      startMinutes + (range * index) / (pointCount - 1),
    );
    return formatAxisTime(minutes);
  });
}

function createTimeAxisLabels(
  startMinutes: number,
  endMinutes: number,
): string[] {
  const midpoint = Math.round((startMinutes + endMinutes) / 2);
  return [
    formatAxisTime(startMinutes),
    "",
    "",
    formatAxisTime(midpoint),
    "",
    "",
    formatAxisTime(endMinutes),
  ];
}

function interpolateEndMinutes(
  startMinutes: number,
  endMinutes: number,
  ratio: number,
): number {
  return Math.round(startMinutes + (endMinutes - startMinutes) * ratio);
}

function parseDateInput(value: string): Date | null {
  if (!DATE_INPUT_PATTERN.test(value)) return null;
  const [year, month] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1) {
    return null;
  }
  return date;
}

function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function isWeekday(date: Date): boolean {
  const day = date.getUTCDay();
  return day !== 0 && day !== 6;
}

function formatPointDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  });
}

function formatAxisDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function sampleDates(dates: Date[], pointCount: number): Date[] {
  if (dates.length === 0) return [];
  if (pointCount <= 1) return [dates[0]];
  return Array.from({ length: pointCount }, (_, index) => {
    const dateIndex = Math.round(
      (index / (pointCount - 1)) * (dates.length - 1),
    );
    return dates[dateIndex];
  });
}

function createTradingDates(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  for (
    let date = new Date(startDate);
    date.getTime() <= endDate.getTime();
    date = addUtcDays(date, 1)
  ) {
    if (isWeekday(date)) dates.push(new Date(date));
  }
  return dates;
}

function createCalendarDates(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  for (
    let date = new Date(startDate);
    date.getTime() <= endDate.getTime();
    date = addUtcDays(date, 1)
  ) {
    dates.push(new Date(date));
  }
  return dates;
}

function createDateRange(
  pointCount: number,
  startDate: Date,
  endDate: Date,
): Date[] {
  const tradingDates = createTradingDates(startDate, endDate);
  if (tradingDates.length >= pointCount) {
    return sampleDates(tradingDates, pointCount);
  }
  return sampleDates(createCalendarDates(startDate, endDate), pointCount);
}

function createTradingPointLabels(
  pointCount: number,
  startDate: Date,
  endDate: Date,
): string[] {
  return createDateRange(pointCount, startDate, endDate).map(formatPointDate);
}

function interpolateEndDate(
  startDate: Date,
  endDate: Date,
  ratio: number,
): Date {
  return new Date(
    Math.round(
      startDate.getTime() + (endDate.getTime() - startDate.getTime()) * ratio,
    ),
  );
}

function createXAxisLabels(startDate: Date, endDate: Date): string[] {
  const monthDistance =
    (endDate.getUTCFullYear() - startDate.getUTCFullYear()) * 12 +
    (endDate.getUTCMonth() - startDate.getUTCMonth());
  const midpoint = new Date(
    Date.UTC(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth() + Math.round(monthDistance / 2),
      1,
    ),
  );
  return [
    formatAxisDate(startDate),
    "",
    "",
    formatAxisDate(midpoint),
    "",
    "",
    formatAxisDate(endDate),
  ];
}

function createLineValues(
  pointCount: number,
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
  for (let index = 0; index < pointCount; index += 1) {
    state = (state * 1664525 + 1013904223) % 4294967296;
    const random = state / 4294967296 - 0.5;
    const wave = Math.sin(index / 6) * volatility * 0.35;
    value = Math.max(
      min,
      Math.min(max, value + random * volatility + drift + wave),
    );
    values.push(Math.round(value));
  }
  return values;
}

function createSeriesInRange(
  pointCount: number,
  datasetCount: number,
  minValue: number,
  maxValue: number,
  seed: number,
): LineChartSeries[] {
  const range = Math.max(1, maxValue - minValue);
  const innerMin = minValue + range * 0.08;
  const innerMax = maxValue - range * 0.08;
  const innerRange = Math.max(1, innerMax - innerMin);
  const series: LineChartSeries[] = [
    {
      name: "Product A",
      color: dataVisColor.general[0].value,
      values: createLineValues(
        pointCount,
        seed + 8,
        innerMin + innerRange * 0.12,
        innerRange * 0.13,
        innerRange * 0.005,
        innerMin,
        innerMax,
      ),
    },
    {
      name: "Product B",
      color: dataVisColor.general[1].value,
      values: createLineValues(
        pointCount,
        seed + 13,
        innerMin + innerRange * 0.32,
        innerRange * 0.05,
        -innerRange * 0.0007,
        innerMin,
        innerMax,
      ),
    },
    {
      name: "Product C",
      color: dataVisColor.general[2].value,
      values: createLineValues(
        pointCount,
        seed + 21,
        innerMin + innerRange * 0.6,
        innerRange * 0.032,
        -innerRange * 0.0009,
        innerMin,
        innerMax,
      ),
    },
  ];
  const boundedDatasetCount = Math.max(
    MIN_DATASETS,
    Math.min(MAX_DATASETS, Math.round(datasetCount)),
  );
  return series.slice(0, boundedDatasetCount);
}

function createRandomSeriesInRange(
  pointCount: number,
  datasetCount: number,
  minValue: number,
  maxValue: number,
): LineChartSeries[] {
  return createSeriesInRange(
    pointCount,
    datasetCount,
    minValue,
    maxValue,
    Date.now() % 100000,
  );
}

function LineChartPage({ onBack }: LineChartPageProps) {
  const sample = lineChartConfig;
  const initialDatasetCount = sample.lineMode === "single" ? 1 : MAX_DATASETS;
  useRefreshDesignTokensOnMount();
  const [yAxisPosition, setYAxisPosition] = useState<CartesianYAxisPosition>(
    sample.yAxisPosition,
  );
  const [axisLineVisibility, setAxisLineVisibility] =
    useState<CartesianAxisLineVisibility>(sample.axisLineVisibility ?? "y");
  const [tooltipPercent, setTooltipPercent] = useState<number>(
    DEFAULT_TOOLTIP_PERCENT,
  );
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const tooltipRangeInputRef = useRef<HTMLInputElement>(null);
  const [lineRange, setLineRange] = useState<LineChartRange>(sample.lineRange);
  const [pointCountInput, setPointCountInput] = useState<string>(
    String(sample.pointCount),
  );
  const [minValueInput, setMinValueInput] = useState<string>(
    String(sample.minValue),
  );
  const [maxValueInput, setMaxValueInput] = useState<string>(
    String(sample.maxValue),
  );
  const [xAxisMode, setXAxisMode] = useState<XAxisMode>("date");
  const [xAxisStartInput, setXAxisStartInput] =
    useState<string>(DEFAULT_START_DATE);
  const [xAxisEndInput, setXAxisEndInput] = useState<string>(DEFAULT_END_DATE);
  const [width, setWidth] = useState<number>(sample.width);
  const [height, setHeight] = useState<number>(sample.height);
  const [chartTitle, setChartTitle] = useState<string>(sample.chartTitle);
  const [showChartTitle, setShowChartTitle] = useState<boolean>(false);
  const effectiveChartTitle = getEffectiveChartTitle(
    showChartTitle,
    chartTitle,
  );
  const [yAxisDataType, setYAxisDataType] = useState<YAxisDataType>("number");
  const [yAxisUnit, setYAxisUnit] = useState<string>(sample.yAxisTitle);
  const effectiveYAxisTitle = yAxisDataType === "number" ? yAxisUnit : "";
  const yAxisValueSuffix = yAxisDataType === "percentage" ? "%" : yAxisUnit;
  const [series, setSeries] = useState<LineChartSeries[]>(() => {
    const initialSeries = sample.series
      .slice(0, initialDatasetCount)
      .map((item, index) => ({
        name: item.name || `Product ${String.fromCharCode(65 + index)}`,
        color: item.color,
        values: [...item.values],
      }));
    if (initialSeries.length > 0) {
      return initialSeries;
    }
    return createSeriesInRange(
      sample.pointCount,
      MIN_DATASETS,
      sample.minValue,
      sample.maxValue,
      20260516,
    );
  });

  useEffect(() => {
    emit("RESIZE_PLUGIN_UI_WINDOW", {
      width: pluginUISize.verticalBarPage.width,
      height: pluginUISize.verticalBarPage.height,
    });
    return () => {
      emit("RESIZE_PLUGIN_UI_WINDOW", {
        width: pluginUISize.homePage.width,
        height: pluginUISize.homePage.height,
      });
    };
  }, []);

  useEffect(() => {
    const syncProgress = () =>
      syncTooltipRangeProgress(
        tooltipRangeInputRef.current,
        tooltipPercent,
        showTooltip,
      );
    syncProgress();
    const animationFrame = window.requestAnimationFrame(syncProgress);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [tooltipPercent, showTooltip]);

  const parsedPointCount = parseInputNumber(pointCountInput);
  const parsedMinValue = parseInputNumber(minValueInput);
  const parsedMaxValue = parseInputNumber(maxValueInput);
  const parsedXAxisStartDate = parseDateInput(xAxisStartInput);
  const parsedXAxisEndDate = parseDateInput(xAxisEndInput);
  const parsedXAxisStartTime = parseTimeInput(xAxisStartInput);
  const parsedXAxisEndTime = parseTimeInput(xAxisEndInput);
  const isPointCountValid =
    parsedPointCount !== null &&
    Number.isInteger(parsedPointCount) &&
    parsedPointCount >= MIN_POINTS &&
    parsedPointCount <= MAX_POINTS;
  const isValueRangeValid =
    parsedMinValue !== null &&
    parsedMaxValue !== null &&
    parsedMaxValue > parsedMinValue;
  const isDateRangeValid =
    parsedXAxisStartDate !== null &&
    parsedXAxisEndDate !== null &&
    parsedXAxisEndDate.getTime() > parsedXAxisStartDate.getTime();
  const isTimeRangeValid =
    parsedXAxisStartTime !== null &&
    parsedXAxisEndTime !== null &&
    parsedXAxisEndTime > parsedXAxisStartTime;
  const isXAxisRangeValid =
    xAxisMode === "time" ? isTimeRangeValid : isDateRangeValid;
  const effectivePointCount = isPointCountValid
    ? parsedPointCount
    : sample.pointCount;
  const effectiveMinValue = isValueRangeValid
    ? parsedMinValue
    : sample.minValue;
  const effectiveMaxValue = isValueRangeValid
    ? parsedMaxValue
    : sample.maxValue;
  const effectiveXAxisStartDate = isDateRangeValid
    ? parsedXAxisStartDate
    : (parseDateInput(DEFAULT_START_DATE) as Date);
  const effectiveXAxisEndDate = isDateRangeValid
    ? parsedXAxisEndDate
    : (parseDateInput(DEFAULT_END_DATE) as Date);
  const effectiveXAxisStartTime = isTimeRangeValid
    ? parsedXAxisStartTime
    : (parseTimeInput(DEFAULT_START_TIME) as number);
  const effectiveXAxisEndTime = isTimeRangeValid
    ? parsedXAxisEndTime
    : (parseTimeInput(DEFAULT_END_TIME) as number);
  const isDataConfigValid =
    isPointCountValid && isValueRangeValid && isXAxisRangeValid;

  const chartConfig = useMemo<LineChartConfig>(() => {
    const boundedPointCount = clampPointCount(effectivePointCount);
    const datasetCount = Math.max(
      MIN_DATASETS,
      Math.min(MAX_DATASETS, series.length),
    );
    const lineMode = datasetCount === 1 ? "single" : "multi";
    const selectedLabelRangeRatio = lineRangeRatio(lineRange);
    const pointLabelEndTime = interpolateEndMinutes(
      effectiveXAxisStartTime,
      effectiveXAxisEndTime,
      selectedLabelRangeRatio,
    );
    const pointLabelEndDate = interpolateEndDate(
      effectiveXAxisStartDate,
      effectiveXAxisEndDate,
      selectedLabelRangeRatio,
    );
    const fallbackSeries = createSeriesInRange(
      boundedPointCount,
      datasetCount,
      effectiveMinValue,
      effectiveMaxValue,
      20260516,
    );
    const visibleSeries = Array.from({ length: datasetCount }, (_, index) => {
      return series[index] || fallbackSeries[index];
    });
    return {
      chartType: "lineChart",
      chartTitle: effectiveChartTitle,
      lineMode,
      lineRange,
      yAxisPosition,
      axisLineVisibility,
      color: sample.color,
      pointCount: boundedPointCount,
      selectedIndex: showTooltip
        ? tooltipIndexFromPercent(tooltipPercent, boundedPointCount)
        : -1,
      width,
      height,
      minValue: effectiveMinValue,
      maxValue: effectiveMaxValue,
      yAxisDataType,
      yAxisTitle: effectiveYAxisTitle,
      xAxisLabels:
        xAxisMode === "time"
          ? createTimeAxisLabels(effectiveXAxisStartTime, effectiveXAxisEndTime)
          : createXAxisLabels(effectiveXAxisStartDate, effectiveXAxisEndDate),
      pointLabels:
        xAxisMode === "time"
          ? createTimePointLabels(
              boundedPointCount,
              effectiveXAxisStartTime,
              pointLabelEndTime,
            )
          : createTradingPointLabels(
              boundedPointCount,
              effectiveXAxisStartDate,
              pointLabelEndDate,
            ),
      series: visibleSeries.map((item, index) => ({
        ...item,
        values:
          item.values.length >= boundedPointCount
            ? item.values.slice(0, boundedPointCount)
            : fallbackSeries[index].values,
      })),
    };
  }, [
    axisLineVisibility,
    effectiveChartTitle,
    effectiveMaxValue,
    effectiveMinValue,
    effectivePointCount,
    effectiveXAxisEndDate,
    effectiveXAxisEndTime,
    effectiveXAxisStartDate,
    effectiveXAxisStartTime,
    height,
    lineRange,
    showTooltip,
    tooltipPercent,
    series,
    width,
    yAxisPosition,
    effectiveYAxisTitle,
    yAxisDataType,
    yAxisUnit,
    xAxisMode,
  ]);

  const handlePointCountChange = useCallback((value: string) => {
    setPointCountInput(sanitizeIntegerInput(value));
  }, []);

  const handleDatasetNameInput = useCallback((index: number, name: string) => {
    setSeries((currentSeries) =>
      currentSeries.map((item, itemIndex) =>
        itemIndex === index ? { ...item, name } : item,
      ),
    );
  }, []);

  const handleAddDataset = useCallback(() => {
    setSeries((currentSeries) => {
      if (currentSeries.length >= MAX_DATASETS) {
        return currentSeries;
      }
      const nextSeries = createRandomSeriesInRange(
        effectivePointCount,
        currentSeries.length + 1,
        effectiveMinValue,
        effectiveMaxValue,
      );
      const nextItem = nextSeries[currentSeries.length];
      if (!nextItem) {
        return currentSeries;
      }
      return [...currentSeries, nextItem];
    });
  }, [effectiveMaxValue, effectiveMinValue, effectivePointCount]);

  const handleDeleteDataset = useCallback((index: number) => {
    setSeries((currentSeries) =>
      currentSeries.length <= MIN_DATASETS
        ? currentSeries
        : currentSeries.filter((_, itemIndex) => itemIndex !== index),
    );
  }, []);

  const handleXAxisModeChange = useCallback((value: string) => {
    const nextMode = value as XAxisMode;
    setXAxisMode(nextMode);
    setXAxisStartInput(
      nextMode === "time" ? DEFAULT_START_TIME : DEFAULT_START_DATE,
    );
    setXAxisEndInput(nextMode === "time" ? DEFAULT_END_TIME : DEFAULT_END_DATE);
  }, []);

  const handleYAxisDataTypeChange = useCallback(
    (value: string) => {
      const nextType = value as YAxisDataType;
      const nextMinValue =
        nextType === "percentage"
          ? DEFAULT_PERCENT_MIN_VALUE
          : lineChartConfig.minValue;
      const nextMaxValue =
        nextType === "percentage"
          ? DEFAULT_PERCENT_MAX_VALUE
          : lineChartConfig.maxValue;

      setYAxisDataType(nextType);
      setMinValueInput(String(nextMinValue));
      setMaxValueInput(String(nextMaxValue));

      setSeries((currentSeries) => {
        const pointCount =
          isPointCountValid && parsedPointCount !== null
            ? parsedPointCount
            : sample.pointCount;
        if (nextMaxValue <= nextMinValue) return currentSeries;

        return createRandomSeriesInRange(
          pointCount,
          currentSeries.length,
          nextMinValue,
          nextMaxValue,
        ).map((item, index) => ({
          ...item,
          name: currentSeries[index]?.name || item.name,
        }));
      });
    },
    [isPointCountValid, parsedPointCount, sample.pointCount],
  );

  const handleGenerateSampleData = useCallback(
    function () {
      if (!isDataConfigValid) return;
      setSeries(
        createRandomSeriesInRange(
          effectivePointCount,
          series.length,
          effectiveMinValue,
          effectiveMaxValue,
        ).map((item, index) => ({
          ...item,
          name: series[index]?.name || item.name,
        })),
      );
    },
    [
      effectiveMaxValue,
      effectiveMinValue,
      effectivePointCount,
      isDataConfigValid,
      series,
    ],
  );

  const handleGenerateButtonClick = useCallback(
    function () {
      if (!isDataConfigValid) return;
      emit("SUBMIT_LINE_CHART_DATA", chartConfig);
    },
    [chartConfig, isDataConfigValid],
  );

  return (
    <div className={styles.verticalBarPage}>
      <div className={styles.verticalBarLeftPanel}>
        <div className={styles.horizontalBarHeader}>
          <button
            className={styles.horizontalBarBackButton}
            onClick={onBack}
            title="Back"
            type="button"
          >
            ←
          </button>
          <Text className={styles.horizontalBarTypeTitle}>Line chart</Text>
        </div>
        <div className={styles.verticalBarPreviewPanel}>
          <LineChartPreview config={chartConfig} />
        </div>
      </div>
      <div className={styles.horizontalBarRightPanel}>
        <div className={styles.horizontalBarControls}>
          <ChartTitleControl
            onTitleChange={setChartTitle}
            onVisibleChange={setShowChartTitle}
            title={chartTitle}
            visible={showChartTitle}
          />
          <VerticalSpace space="medium" />
          <div className={styles.divider} />
          <VerticalSpace space="medium" />
          <Stack space="small">
            <Text className={styles.sectionTitle}>Chart</Text>

            <div className={styles.fieldRow}>
              <Text className={styles.fieldLabel}>Size</Text>
              <div className={styles.chartDimensionInputs}>
                <TextboxNumeric
                  icon="W"
                  onNumericValueInput={(value) =>
                    setWidth(value ?? sample.width)
                  }
                  value={String(width)}
                />
                <TextboxNumeric
                  icon="H"
                  onNumericValueInput={(value) =>
                    setHeight(value ?? sample.height)
                  }
                  value={String(height)}
                />
              </div>
            </div>
            <div className={styles.fieldRow}>
              <Text className={styles.fieldLabel}>Grid line</Text>
              <div className={styles.gridLineCheckboxGroup}>
                <Checkbox
                  onValueChange={(value) =>
                    setAxisLineVisibility(
                      cartesianAxisLineVisibilityFromGridToggles(
                        value,
                        isCartesianYAxisLineVisible(axisLineVisibility),
                      ),
                    )
                  }
                  value={isCartesianXAxisLineVisible(axisLineVisibility)}
                >
                  <Text>X</Text>
                </Checkbox>
                <Checkbox
                  onValueChange={(value) =>
                    setAxisLineVisibility(
                      cartesianAxisLineVisibilityFromGridToggles(
                        isCartesianXAxisLineVisible(axisLineVisibility),
                        value,
                      ),
                    )
                  }
                  value={isCartesianYAxisLineVisible(axisLineVisibility)}
                >
                  <Text>Y</Text>
                </Checkbox>
              </div>
            </div>
            <div className={styles.fieldRow}>
              <Text className={styles.fieldLabel}>Line range</Text>
              <div className={styles.fieldRowSegmentControl}>
                <SegmentedControl
                  onValueChange={(value) =>
                    setLineRange(value as LineChartRange)
                  }
                  options={LINE_RANGE_OPTIONS}
                  value={lineRange}
                />
              </div>
            </div>
            <div className={styles.fieldRow}>
              <Text className={styles.fieldLabel}>Y axis position</Text>
              <div className={styles.fieldRowSegmentControl}>
                <SegmentedControl
                  onValueChange={(value) =>
                    setYAxisPosition(value as CartesianYAxisPosition)
                  }
                  options={Y_AXIS_POSITION_OPTIONS}
                  value={yAxisPosition}
                />
              </div>
            </div>
          </Stack>
          <VerticalSpace space="medium" />
          <div className={styles.divider} />
          <VerticalSpace space="medium" />
          <Stack space="small">
            <EditSectionHeader
              hideTitle="Hide tooltip"
              onVisibilityToggle={() => setShowTooltip((current) => !current)}
              showTitle="Show tooltip"
              title="Tooltip"
              visible={showTooltip}
            />
            {showTooltip ? (
              <div className={styles.selectedControlStack}>
                <div className={styles.selectedPositionRow}>
                  <Text className={styles.fieldLabel}>Position</Text>
                  <RangeSlider
                    aria-label="Tooltip position"
                    increment={1}
                    maximum={100}
                    minimum={0}
                    onNumericValueInput={(value) =>
                      setTooltipPercent(clampTooltipPercent(value))
                    }
                    ref={tooltipRangeInputRef}
                    value={String(tooltipPercent)}
                  />
                </div>
                <div className={styles.selectedPercentInputRow}>
                  <span />
                  <div className={styles.selectedPercentInputWrap}>
                    <TextboxNumeric
                      integer
                      maximum={100}
                      minimum={0}
                      onNumericValueInput={(value) =>
                        setTooltipPercent(clampTooltipPercent(value))
                      }
                      value={String(tooltipPercent)}
                    />
                    <span className={styles.selectedPercentSuffix}>%</span>
                  </div>
                </div>
              </div>
            ) : null}
          </Stack>
          <VerticalSpace space="medium" />
          <div className={styles.divider} />
          <VerticalSpace space="medium" />
          <div className={styles.verticalBarDataSection}>
            <div className={styles.verticalBarDataHeader}>
              <Text className={styles.sectionTitle}>Data</Text>
              <Text className={styles.fieldLabel}>
                {series.length}/{MAX_DATASETS} datasets
              </Text>
            </div>
            {series.map((item, index) => (
              <div key={index} className={styles.chartItemInput}>
                <div
                  style={{
                    backgroundColor: dataVisColor.general[index].value,
                    flexShrink: 0,
                    height: "12px",
                    marginRight: "2px",
                    width: "12px",
                  }}
                />
                <div className={styles.chartItemInputField}>
                  <Textbox
                    onValueInput={(value) =>
                      handleDatasetNameInput(index, value)
                    }
                    placeholder={`Product ${String.fromCharCode(65 + index)}`}
                    value={item.name}
                  />
                </div>
                <div className={styles.chartItemDeleteButtonWrap}>
                  {series.length > MIN_DATASETS ? (
                    <div
                      className={styles.chartItemDeleteButton}
                      onClick={() => handleDeleteDataset(index)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleDeleteDataset(index);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      title="Delete dataset"
                    >
                      —
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
            <Button
              secondary
              disabled={series.length >= MAX_DATASETS}
              fullWidth
              onClick={handleAddDataset}
            >
              <span
                style={{
                  alignItems: "center",
                  display: "inline-flex",
                  gap: "6px",
                  justifyContent: "center",
                }}
              >
                <IconPlus16 />
                Add dataset
              </span>
            </Button>
            <VerticalSpace space="extraSmall" />
            <Divider />
            <VerticalSpace space="extraSmall" />
            <div className={styles.yAxisSection}>
              <div className={styles.yAxisSectionHeader}>
                <Text className={styles.sectionTitle}>Y-axis</Text>
                <SegmentedControl
                  onValueChange={handleYAxisDataTypeChange}
                  options={Y_AXIS_DATA_TYPE_OPTIONS}
                  value={yAxisDataType}
                />
              </div>
              {yAxisDataType === "number" ? (
                <div className={styles.fieldRow}>
                  <Text className={styles.fieldLabel}>Unit</Text>
                  <Textbox onValueInput={setYAxisUnit} value={yAxisUnit} />
                </div>
              ) : null}
              <div className={styles.fieldRow}>
                <Text className={styles.fieldLabel}>Min value</Text>
                <div className={styles.yAxisValueInputWrap}>
                  <Textbox
                    onValueInput={(value) =>
                      setMinValueInput(sanitizeNumberInput(value))
                    }
                    value={minValueInput}
                  />
                  <span className={styles.yAxisValueInputSuffix}>
                    {yAxisValueSuffix}
                  </span>
                </div>
              </div>
              <div className={styles.fieldRow}>
                <Text className={styles.fieldLabel}>Max value</Text>
                <div className={styles.yAxisValueInputWrap}>
                  <Textbox
                    onValueInput={(value) =>
                      setMaxValueInput(sanitizeNumberInput(value))
                    }
                    value={maxValueInput}
                  />
                  <span className={styles.yAxisValueInputSuffix}>
                    {yAxisValueSuffix}
                  </span>
                </div>
              </div>
              {!isValueRangeValid ? (
                <div className={styles.fieldHintError}>
                  Max must be greater than min.
                </div>
              ) : null}
            </div>
            <VerticalSpace space="extraSmall" />
            <div className={styles.xAxisSection}>
              <div className={styles.xAxisSectionHeader}>
                <Text className={styles.sectionTitle}>X-axis</Text>
                <SegmentedControl
                  onValueChange={handleXAxisModeChange}
                  options={X_AXIS_MODE_OPTIONS}
                  value={xAxisMode}
                />
              </div>
              <div className={styles.fieldRow}>
                <Text className={styles.fieldLabel}>
                  {xAxisMode === "time" ? "Start time" : "Start date"}
                </Text>
                <Textbox
                  onValueInput={(value) =>
                    setXAxisStartInput(
                      xAxisMode === "time"
                        ? sanitizeTimeInput(value)
                        : sanitizeDateInput(value),
                    )
                  }
                  value={xAxisStartInput}
                />
              </div>
              <div className={styles.fieldRow}>
                <Text className={styles.fieldLabel}>
                  {xAxisMode === "time" ? "End time" : "End date"}
                </Text>
                <Textbox
                  onValueInput={(value) =>
                    setXAxisEndInput(
                      xAxisMode === "time"
                        ? sanitizeTimeInput(value)
                        : sanitizeDateInput(value),
                    )
                  }
                  value={xAxisEndInput}
                />
              </div>
              {!isXAxisRangeValid ? (
                <div className={styles.fieldHintError}>
                  {xAxisMode === "time"
                    ? "Use 00:00-23:59; start < end."
                    : "Use YYYY-MM; start < end."}
                </div>
              ) : null}
            </div>
            <div className={styles.fieldRow}>
              <Text className={styles.fieldLabel}>Data points</Text>
              <Textbox
                onValueInput={handlePointCountChange}
                value={pointCountInput}
              />
            </div>
            {!isPointCountValid ? (
              <div className={styles.fieldHintError}>
                Use {MIN_POINTS}-{MAX_POINTS}.
              </div>
            ) : null}
            <div className={styles.dataSectionActions}>
              <Button
                disabled={!isDataConfigValid}
                fullWidth
                onClick={handleGenerateSampleData}
                secondary
              >
                Generate random data
              </Button>
            </div>
          </div>
        </div>
        <div className={styles.horizontalBarActions}>
          <Button
            disabled={!isDataConfigValid}
            fullWidth
            onClick={handleGenerateButtonClick}
          >
            Generate
          </Button>
        </div>
      </div>
    </div>
  );
}

export default LineChartPage;
