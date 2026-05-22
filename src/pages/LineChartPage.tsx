import {
  Button,
  Dropdown,
  DropdownOption,
  Stack,
  Text,
  Textbox,
  TextboxNumeric,
  VerticalSpace,
} from "@create-figma-plugin/ui";
import { emit } from "@create-figma-plugin/utilities";
import { h } from "preact";
import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import LineChartPreview from "../components/LineChartPreview";
import { dataVisColor, lineChartConfig, pluginUISize } from "../config";
import {
  LineChartConfig,
  LineChartMode,
  LineChartRange,
  LineChartSeries,
  CartesianAxisLineVisibility,
  CartesianYAxisPosition,
} from "../types";
import styles from "../ui.css";
import { useRefreshDesignTokensOnMount } from "../utils/useRefreshDesignTokens";

interface LineChartPageProps {
  onBack: () => void;
}

type LineSelectedMode = "none" | "half" | "threeQuarter" | "last";
type XAxisMode = "time" | "date";

const LINE_MODE_OPTIONS: Array<DropdownOption> = [
  { text: "Single", value: "single" },
  { text: "Multi", value: "multi" },
];
const Y_AXIS_POSITION_OPTIONS: Array<DropdownOption> = [
  { text: "Right", value: "right" },
  { text: "Left", value: "left" },
];
const AXIS_LINE_VISIBILITY_OPTIONS: Array<DropdownOption> = [
  { text: "Show both", value: "both" },
  { text: "Y-axis only", value: "y" },
  { text: "X-axis only", value: "x" },
  { text: "Hide both", value: "none" },
];
const SELECTED_OPTIONS: Array<DropdownOption> = [
  { text: "No selection", value: "none" },
  { text: "50% position", value: "half" },
  { text: "75% position", value: "threeQuarter" },
  { text: "100% position", value: "last" },
];
const X_AXIS_MODE_OPTIONS: Array<DropdownOption> = [
  { text: "Time range", value: "time" },
  { text: "Date range", value: "date" },
];
const LINE_RANGE_OPTIONS: Array<DropdownOption> = [
  { text: "Partial line", value: "partial" },
  { text: "Full line", value: "full" },
];
const MIN_POINTS = 2;
const MAX_POINTS = 180;
const DEFAULT_START_DATE = "2026-01";
const DEFAULT_END_DATE = "2026-03";
const DEFAULT_START_TIME = "09:30";
const DEFAULT_END_TIME = "16:00";
const DATE_INPUT_PATTERN = /^\d{4}-\d{2}$/;
const TIME_INPUT_PATTERN = /^\d{2}:\d{2}$/;
const PARTIAL_LINE_RANGE_RATIO = 0.788;

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

function selectedIndexFromMode(mode: LineSelectedMode, pointCount: number): number {
  if (mode === "none") return -1;
  if (mode === "last") return pointCount - 1;
  if (mode === "half") return Math.round((pointCount - 1) * 0.5);
  return Math.round((pointCount - 1) * 0.75);
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
    const minutes = Math.round(startMinutes + (range * index) / (pointCount - 1));
    return formatAxisTime(minutes);
  });
}

function createTimeAxisLabels(startMinutes: number, endMinutes: number): string[] {
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
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1
  ) {
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
    const dateIndex = Math.round((index / (pointCount - 1)) * (dates.length - 1));
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

function interpolateEndDate(startDate: Date, endDate: Date, ratio: number): Date {
  return new Date(
    Math.round(startDate.getTime() + (endDate.getTime() - startDate.getTime()) * ratio),
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
    value = Math.max(min, Math.min(max, value + random * volatility + drift + wave));
    values.push(Math.round(value));
  }
  return values;
}

function createRandomSeries(pointCount: number, lineMode: LineChartMode): LineChartSeries[] {
  return createRandomSeriesInRange(pointCount, lineMode, 100, 250);
}

function createSeriesInRange(
  pointCount: number,
  lineMode: LineChartMode,
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
      name: "Line 1",
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
      name: "Line 2",
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
      name: "Line 3",
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
  return lineMode === "single" ? series.slice(0, 1) : series;
}

function createRandomSeriesInRange(
  pointCount: number,
  lineMode: LineChartMode,
  minValue: number,
  maxValue: number,
): LineChartSeries[] {
  return createSeriesInRange(
    pointCount,
    lineMode,
    minValue,
    maxValue,
    Date.now() % 100000,
  );
}

function LineChartPage({ onBack }: LineChartPageProps) {
  const sample = lineChartConfig;
  useRefreshDesignTokensOnMount();
  const [lineMode, setLineMode] = useState<LineChartMode>(sample.lineMode);
  const [yAxisPosition, setYAxisPosition] =
    useState<CartesianYAxisPosition>(sample.yAxisPosition);
  const [axisLineVisibility, setAxisLineVisibility] =
    useState<CartesianAxisLineVisibility>(
      sample.axisLineVisibility ?? "y",
    );
  const [selectedMode, setSelectedMode] =
    useState<LineSelectedMode>("threeQuarter");
  const [lineRange, setLineRange] =
    useState<LineChartRange>(sample.lineRange);
  const [pointCountInput, setPointCountInput] = useState<string>(
    String(sample.pointCount),
  );
  const [minValueInput, setMinValueInput] = useState<string>(
    String(sample.minValue),
  );
  const [maxValueInput, setMaxValueInput] = useState<string>(
    String(sample.maxValue),
  );
  const [xAxisMode, setXAxisMode] =
    useState<XAxisMode>("date");
  const [xAxisStartInput, setXAxisStartInput] =
    useState<string>(DEFAULT_START_DATE);
  const [xAxisEndInput, setXAxisEndInput] =
    useState<string>(DEFAULT_END_DATE);
  const [width, setWidth] = useState<number>(sample.width);
  const [height, setHeight] = useState<number>(sample.height);
  const [yAxisTitle, setYAxisTitle] = useState<string>(sample.yAxisTitle);
  const [series, setSeries] = useState<LineChartSeries[]>(
    sample.series.map((item) => ({
      name: item.name,
      color: item.color,
      values: [...item.values],
    })),
  );

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
    : parseDateInput(DEFAULT_START_DATE) as Date;
  const effectiveXAxisEndDate = isDateRangeValid
    ? parsedXAxisEndDate
    : parseDateInput(DEFAULT_END_DATE) as Date;
  const effectiveXAxisStartTime = isTimeRangeValid
    ? parsedXAxisStartTime
    : parseTimeInput(DEFAULT_START_TIME) as number;
  const effectiveXAxisEndTime = isTimeRangeValid
    ? parsedXAxisEndTime
    : parseTimeInput(DEFAULT_END_TIME) as number;
  const isDataConfigValid =
    isPointCountValid && isValueRangeValid && isXAxisRangeValid;

  const chartConfig = useMemo<LineChartConfig>(() => {
    const boundedPointCount = clampPointCount(effectivePointCount);
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
      lineMode,
      effectiveMinValue,
      effectiveMaxValue,
      20260516,
    );
    const visibleSeries =
      lineMode === "single"
        ? [series[0] || fallbackSeries[0]]
        : [
            series[0] || fallbackSeries[0],
            series[1] || fallbackSeries[1],
            series[2] || fallbackSeries[2],
          ];
    return {
      chartType: "lineChart",
      lineMode,
      lineRange,
      yAxisPosition,
      axisLineVisibility,
      color: sample.color,
      pointCount: boundedPointCount,
      selectedIndex: selectedIndexFromMode(selectedMode, boundedPointCount),
      width,
      height,
      minValue: effectiveMinValue,
      maxValue: effectiveMaxValue,
      yAxisTitle,
      xAxisLabels:
        xAxisMode === "time"
          ? createTimeAxisLabels(
              effectiveXAxisStartTime,
              effectiveXAxisEndTime,
            )
          : createXAxisLabels(
              effectiveXAxisStartDate,
              effectiveXAxisEndDate,
            ),
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
    effectiveMaxValue,
    effectiveMinValue,
    effectivePointCount,
    effectiveXAxisEndDate,
    effectiveXAxisEndTime,
    effectiveXAxisStartDate,
    effectiveXAxisStartTime,
    height,
    lineMode,
    lineRange,
    selectedMode,
    series,
    width,
    yAxisPosition,
    yAxisTitle,
    xAxisMode,
  ]);

  const handlePointCountChange = useCallback((value: string) => {
    setPointCountInput(sanitizeIntegerInput(value));
  }, []);

  const handleLineModeChange = useCallback((value: string) => {
    const nextLineMode = value as LineChartMode;
    setLineMode(nextLineMode);
    setSeries((currentSeries) => {
      const nextSeries = createRandomSeriesInRange(
        effectivePointCount,
        nextLineMode,
        effectiveMinValue,
        effectiveMaxValue,
      );
      return nextSeries.map((item, index) => currentSeries[index] || item);
    });
  }, [effectiveMaxValue, effectiveMinValue, effectivePointCount]);

  const handleXAxisModeChange = useCallback((value: string) => {
    const nextMode = value as XAxisMode;
    setXAxisMode(nextMode);
    setXAxisStartInput(
      nextMode === "time" ? DEFAULT_START_TIME : DEFAULT_START_DATE,
    );
    setXAxisEndInput(
      nextMode === "time" ? DEFAULT_END_TIME : DEFAULT_END_DATE,
    );
  }, []);

  const handleGenerateSampleData = useCallback(function () {
    if (!isDataConfigValid) return;
    setSeries(
      createRandomSeriesInRange(
        effectivePointCount,
        lineMode,
        effectiveMinValue,
        effectiveMaxValue,
      ),
    );
  }, [
    effectiveMaxValue,
    effectiveMinValue,
    effectivePointCount,
    isDataConfigValid,
    lineMode,
  ]);

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
          <Stack space="small">
            <Text className={styles.sectionTitle}>Chart</Text>
            <div className={styles.fieldRow}>
              <Text className={styles.fieldLabel}>Lines</Text>
              <Dropdown
                onValueChange={handleLineModeChange}
                options={LINE_MODE_OPTIONS}
                value={lineMode}
              />
            </div>
            <div className={styles.fieldRow}>
              <Text className={styles.fieldLabel}>Line range</Text>
              <Dropdown
                onValueChange={(value) =>
                  setLineRange(value as LineChartRange)
                }
                options={LINE_RANGE_OPTIONS}
                value={lineRange}
              />
            </div>
            <div className={styles.fieldRow}>
              <Text className={styles.fieldLabel}>Width</Text>
              <TextboxNumeric
                onNumericValueInput={(value) => setWidth(value ?? sample.width)}
                value={String(width)}
              />
            </div>
            <div className={styles.fieldRow}>
              <Text className={styles.fieldLabel}>Height</Text>
              <TextboxNumeric
                onNumericValueInput={(value) => setHeight(value ?? sample.height)}
                value={String(height)}
              />
            </div>
          </Stack>
          <VerticalSpace space="medium" />
          <div className={styles.divider} />
          <VerticalSpace space="medium" />
          <Stack space="small">
            <Text className={styles.sectionTitle}>Axes</Text>
            <div className={styles.fieldRow}>
              <Text className={styles.fieldLabel}>Y side</Text>
              <Dropdown
                onValueChange={(value) =>
                  setYAxisPosition(value as CartesianYAxisPosition)
                }
                options={Y_AXIS_POSITION_OPTIONS}
                value={yAxisPosition}
              />
            </div>
            <div className={styles.fieldRow}>
              <Text className={styles.fieldLabel}>Axis line</Text>
              <Dropdown
                onValueChange={(value) =>
                  setAxisLineVisibility(
                    value as CartesianAxisLineVisibility,
                  )
                }
                options={AXIS_LINE_VISIBILITY_OPTIONS}
                value={axisLineVisibility}
              />
            </div>
            <div className={styles.fieldRow}>
              <Text className={styles.fieldLabel}>Y title</Text>
              <Textbox onValueInput={setYAxisTitle} value={yAxisTitle} />
            </div>
          </Stack>
          <VerticalSpace space="medium" />
          <div className={styles.divider} />
          <VerticalSpace space="medium" />
          <div className={styles.verticalBarDataSection}>
            <div className={styles.verticalBarDataHeader}>
              <Text className={styles.sectionTitle}>Data</Text>
              <Text className={styles.fieldLabel}>
                {chartConfig.pointCount} data points
              </Text>
            </div>
            <div className={styles.fieldRow}>
              <Text className={styles.fieldLabel}>Selected</Text>
              <Dropdown
                onValueChange={(value) =>
                  setSelectedMode(value as LineSelectedMode)
                }
                options={SELECTED_OPTIONS}
                value={selectedMode}
              />
            </div>
            <Text className={styles.fieldGroupLabel}>Y-axis</Text>
            <div className={styles.fieldRow}>
              <Text className={styles.fieldLabel}>Min value</Text>
              <Textbox
                onValueInput={(value) =>
                  setMinValueInput(sanitizeNumberInput(value))
                }
                value={minValueInput}
              />
            </div>
            <div className={styles.fieldRow}>
              <Text className={styles.fieldLabel}>Max value</Text>
              <Textbox
                onValueInput={(value) =>
                  setMaxValueInput(sanitizeNumberInput(value))
                }
                value={maxValueInput}
              />
            </div>
            {!isValueRangeValid ? (
              <div className={styles.fieldHintError}>
                Max must be greater than min.
              </div>
            ) : null}
            <div className={styles.fieldRow}>
              <Text className={styles.fieldLabel}>Data-set count</Text>
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
            <Text className={styles.fieldGroupLabel}>X-axis</Text>
            <div className={styles.fieldRow}>
              <Text className={styles.fieldLabel}>Data type</Text>
              <Dropdown
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
