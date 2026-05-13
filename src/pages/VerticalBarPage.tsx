import {
  Button,
  Dropdown,
  DropdownOption,
  IconMinusSmall24,
  IconPlus16,
  Stack,
  Text,
  Textbox,
  TextboxNumeric,
  VerticalSpace,
} from "@create-figma-plugin/ui";
import { emit } from "@create-figma-plugin/utilities";
import { h } from "preact";
import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import VerticalBarChartPreview from "../components/VerticalBarChartPreview";
import { dataVisColor, pluginUISize, verticalBarChartConfig } from "../config";
import {
  VerticalBarChartConfig,
  VerticalBarChartSeries,
  VerticalBarAxisLineVisibility,
  VerticalBarMode,
  VerticalBarYAxisPosition,
} from "../types";
import styles from "../ui.css";

interface VerticalBarPageProps {
  onBack: () => void;
}

const BAR_MODE_OPTIONS: Array<DropdownOption> = [
  { text: "Dual", value: "dual" },
  { text: "Single", value: "single" },
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
const MIN_DATA_ITEMS = 1;
const MAX_DATA_ITEMS = 10;
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface VerticalBarDataItem {
  label: string;
  valueA: number;
  valueAInput: string;
  valueB: number;
  valueBInput: string;
}

function sanitizeDecimalInput(value: string) {
  let sanitizedValue = "";
  let hasDecimalPoint = false;
  for (let i = 0; i < value.length; i++) {
    const character = value[i];
    if (character >= "0" && character <= "9") {
      sanitizedValue += character;
      continue;
    }
    if (character === "." && !hasDecimalPoint) {
      sanitizedValue += character;
      hasDecimalPoint = true;
    }
  }
  return sanitizedValue;
}

function createDataItem(
  index: number,
  label = `Item ${index + 1}`,
  valueA = 0,
  valueB = 0,
): VerticalBarDataItem {
  return {
    label,
    valueA,
    valueAInput: String(valueA),
    valueB,
    valueBInput: String(valueB),
  };
}

function createSampleItems(itemCount: number): VerticalBarDataItem[] {
  const boundedItemCount = Math.max(
    MIN_DATA_ITEMS,
    Math.min(MAX_DATA_ITEMS, itemCount),
  );
  const startMonthIndex = Math.max(
    0,
    MONTH_LABELS.length - boundedItemCount,
  );
  return MONTH_LABELS.slice(
    startMonthIndex,
    startMonthIndex + boundedItemCount,
  ).map((label, index) =>
    createDataItem(index, label, createRandomValue(), createRandomValue()),
  );
}

function createRandomValue(): number {
  return Math.round(3000 + Math.random() * 27000);
}

function VerticalBarPage({ onBack }: VerticalBarPageProps) {
  const sample = verticalBarChartConfig;
  const [barMode, setBarMode] = useState<VerticalBarMode>(sample.barMode);
  const [yAxisPosition, setYAxisPosition] =
    useState<VerticalBarYAxisPosition>(sample.yAxisPosition);
  const [axisLineVisibility, setAxisLineVisibility] =
    useState<VerticalBarAxisLineVisibility>(
      sample.axisLineVisibility ?? "both",
    );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    sample.selectedIndex,
  );
  const [width, setWidth] = useState<number>(sample.width);
  const [height, setHeight] = useState<number>(sample.height);
  const [yAxisTitle, setYAxisTitle] = useState<string>(sample.yAxisTitle);
  const [xAxisTitle, setXAxisTitle] = useState<string>(sample.xAxisTitle);
  const [items, setItems] = useState<VerticalBarDataItem[]>(
    sample.labels.map((label, index) =>
      createDataItem(
        index,
        label,
        sample.series[0].values[index] ?? 0,
        sample.series[1].values[index] ?? 0,
      ),
    ),
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

  const chartConfig = useMemo<VerticalBarChartConfig>(() => {
    const labels = items.map((item, index) => item.label.trim() || `Item ${index + 1}`);
    const series: VerticalBarChartSeries[] = [
      {
        name: "Data set 1",
        color: dataVisColor.general[0].value,
        values: items.map((item) => item.valueA),
      },
      {
        name: "Data set 2",
        color: dataVisColor.general[1].value,
        values: items.map((item) => item.valueB),
      },
    ];
    return {
      chartType: "verticalBar",
      barMode,
      yAxisPosition,
      axisLineVisibility,
      periodCount: items.length,
      selectedIndex:
        selectedIndex === null ? -1 : Math.min(selectedIndex, items.length - 1),
      width,
      height,
      yAxisTitle,
      xAxisTitle,
      labels,
      series,
    };
  }, [
    barMode,
    axisLineVisibility,
    height,
    items,
    selectedIndex,
    width,
    xAxisTitle,
    yAxisPosition,
    yAxisTitle,
  ]);

  const selectedItemOptions = useMemo<Array<DropdownOption>>(
    () => [
      { text: "No selection", value: "none" },
      ...items.map((item, index) => ({
        text: `${index + 1}. ${item.label.trim() || `Item ${index + 1}`}`,
        value: String(index),
      })),
    ],
    [items],
  );

  const handleLabelInput = useCallback((index: number, label: string) => {
    setItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, label } : item,
      ),
    );
  }, []);

  const handleValueInput = useCallback(
    (index: number, key: "valueA" | "valueB", valueInput: string) => {
      const sanitizedValueInput = sanitizeDecimalInput(valueInput);
      const value = Number(sanitizedValueInput);
      setItems((currentItems) =>
        currentItems.map((item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                [key]: Number.isNaN(value) ? 0 : value,
                [`${key}Input`]: sanitizedValueInput,
              }
            : item,
        ),
      );
    },
    [],
  );

  const handleAddItem = useCallback(function () {
    setItems((currentItems) =>
      currentItems.length >= MAX_DATA_ITEMS
        ? currentItems
        : [...currentItems, createDataItem(currentItems.length)],
    );
  }, []);

  const handleDeleteItem = useCallback(function (index: number) {
    setItems((currentItems) =>
      currentItems.length <= MIN_DATA_ITEMS
        ? currentItems
        : currentItems.filter((_, itemIndex) => itemIndex !== index),
    );
    setSelectedIndex((currentIndex) => {
      if (currentIndex === null) return null;
      return Math.max(0, Math.min(currentIndex, items.length - 2));
    });
  }, [items.length]);

  const handleGenerateSampleData = useCallback(function () {
    setItems((currentItems) => {
      const nextItems = createSampleItems(currentItems.length);
      setSelectedIndex((currentIndex) =>
        currentIndex === null
          ? null
          : Math.max(0, Math.min(currentIndex, nextItems.length - 1)),
      );
      return nextItems;
    });
  }, []);

  const handleGenerateButtonClick = useCallback(
    function () {
      emit("SUBMIT_VERTICAL_BAR_CHART_DATA", chartConfig);
    },
    [chartConfig],
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
          <Text className={styles.horizontalBarTypeTitle}>
            Vertical bar chart
          </Text>
        </div>
        <div className={styles.verticalBarPreviewPanel}>
          <VerticalBarChartPreview config={chartConfig} />
        </div>
      </div>
      <div className={styles.horizontalBarRightPanel}>
        <div className={styles.horizontalBarControls}>
          <Stack space="small">
            <Text className={styles.sectionTitle}>Chart</Text>
            <div className={styles.fieldRow}>
              <Text className={styles.fieldLabel}>Bars</Text>
              <Dropdown
                onValueChange={(value) => setBarMode(value as VerticalBarMode)}
                options={BAR_MODE_OPTIONS}
                value={barMode}
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
                  setYAxisPosition(value as VerticalBarYAxisPosition)
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
                    value as VerticalBarAxisLineVisibility,
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
            <div className={styles.fieldRow}>
              <Text className={styles.fieldLabel}>X title</Text>
              <Textbox onValueInput={setXAxisTitle} value={xAxisTitle} />
            </div>
          </Stack>
          <VerticalSpace space="medium" />
          <div className={styles.divider} />
          <VerticalSpace space="medium" />
          <div className={styles.verticalBarDataSection}>
            <div className={styles.verticalBarDataHeader}>
              <Text className={styles.sectionTitle}>Data</Text>
              <Text className={styles.fieldLabel}>
                {items.length}/{MAX_DATA_ITEMS} items
              </Text>
            </div>
            <VerticalSpace space="small" />
            <div className={styles.fieldRow}>
              <Text className={styles.fieldLabel}>Selected</Text>
              <Dropdown
                onValueChange={(value) =>
                  setSelectedIndex(value === "none" ? null : Number(value))
                }
                options={selectedItemOptions}
                value={selectedIndex === null ? "none" : String(selectedIndex)}
              />
            </div>
            <VerticalSpace space="small" />
            <Stack space="small">
              {items.map((item, index) => (
                <div
                  className={
                    barMode === "dual"
                      ? styles.verticalBarDataRowDual
                      : styles.verticalBarDataRowSingle
                  }
                  key={index}
                >
                  <Textbox
                    onValueInput={(label) => handleLabelInput(index, label)}
                    value={item.label}
                    placeholder="X-axis label"
                  />
                  <Textbox
                    onValueInput={(valueInput) =>
                      handleValueInput(index, "valueA", valueInput)
                    }
                    value={item.valueAInput}
                    placeholder="Value"
                  />
                  {barMode === "dual" ? (
                    <Textbox
                      onValueInput={(valueInput) =>
                        handleValueInput(index, "valueB", valueInput)
                      }
                      value={item.valueBInput}
                      placeholder="Value"
                    />
                  ) : null}
                  <button
                    className={styles.verticalBarDeleteButton}
                    disabled={items.length <= MIN_DATA_ITEMS}
                    onClick={() => handleDeleteItem(index)}
                    title="Delete item"
                    type="button"
                  >
                    <IconMinusSmall24 />
                  </button>
                </div>
              ))}
              <Button
                secondary
                disabled={items.length >= MAX_DATA_ITEMS}
                fullWidth
                onClick={handleAddItem}
              >
                <span className={styles.verticalBarButtonContent}>
                  <IconPlus16 />
                  Add item
                </span>
              </Button>
              <Button secondary fullWidth onClick={handleGenerateSampleData}>
                Generate random data
              </Button>
            </Stack>
          </div>
        </div>
        <div className={styles.horizontalBarActions}>
          <Button fullWidth onClick={handleGenerateButtonClick}>
            Generate
          </Button>
        </div>
      </div>
    </div>
  );
}

export default VerticalBarPage;
