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
import VerticalBarChartPreview from "../components/VerticalBarChartPreview";
import { pluginUI, sampleData } from "../config";
import {
  VerticalBarChartConfig,
  VerticalBarChartSeries,
  VerticalBarMode,
} from "../types";
import styles from "../ui.css";

interface VerticalBarPageProps {
  onBack: () => void;
}

const BAR_MODE_OPTIONS: Array<DropdownOption> = [
  { text: "Dual", value: "dual" },
  { text: "Single", value: "single" },
];

function parseList(value: string): string[] {
  return value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseNumberList(value: string): number[] {
  return parseList(value)
    .map((item) => Number(item.replace(/,/g, "")))
    .filter((item) => Number.isFinite(item));
}

function formatValues(values: number[]) {
  return values.join(", ");
}

function VerticalBarPage({ onBack }: VerticalBarPageProps) {
  const sample = sampleData.verticalBar;
  const [barMode, setBarMode] = useState<VerticalBarMode>(sample.barMode);
  const [periodCount, setPeriodCount] = useState<number>(sample.periodCount);
  const [selectedIndex, setSelectedIndex] = useState<number>(sample.selectedIndex);
  const [width, setWidth] = useState<number>(sample.width);
  const [height, setHeight] = useState<number>(sample.height);
  const [yAxisTitle, setYAxisTitle] = useState<string>(sample.yAxisTitle);
  const [xAxisTitle, setXAxisTitle] = useState<string>(sample.xAxisTitle);
  const [labelsInput, setLabelsInput] = useState<string>(sample.labels.join(", "));
  const [seriesAName, setSeriesAName] = useState<string>(sample.series[0].name);
  const [seriesAColor, setSeriesAColor] = useState<string>(sample.series[0].color);
  const [seriesAValues, setSeriesAValues] = useState<string>(
    formatValues(sample.series[0].values),
  );
  const [seriesBName, setSeriesBName] = useState<string>(sample.series[1].name);
  const [seriesBColor, setSeriesBColor] = useState<string>(sample.series[1].color);
  const [seriesBValues, setSeriesBValues] = useState<string>(
    formatValues(sample.series[1].values),
  );

  useEffect(() => {
    emit("RESIZE_PLUGIN_UI_WINDOW", {
      width: pluginUI.verticalBarPageSize.width,
      height: pluginUI.verticalBarPageSize.height,
    });
    return () => {
      emit("RESIZE_PLUGIN_UI_WINDOW", {
        width: pluginUI.size.width,
        height: pluginUI.size.height,
      });
    };
  }, []);

  const chartConfig = useMemo<VerticalBarChartConfig>(() => {
    const labels = parseList(labelsInput);
    const series: VerticalBarChartSeries[] = [
      {
        name: seriesAName,
        color: seriesAColor,
        values: parseNumberList(seriesAValues),
      },
      {
        name: seriesBName,
        color: seriesBColor,
        values: parseNumberList(seriesBValues),
      },
    ];
    return {
      chartType: "verticalBar",
      barMode,
      periodCount,
      selectedIndex,
      width,
      height,
      yAxisTitle,
      xAxisTitle,
      labels,
      series,
    };
  }, [
    barMode,
    height,
    labelsInput,
    periodCount,
    selectedIndex,
    seriesAColor,
    seriesAName,
    seriesAValues,
    seriesBColor,
    seriesBName,
    seriesBValues,
    width,
    xAxisTitle,
    yAxisTitle,
  ]);

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
              <Text className={styles.fieldLabel}>Periods</Text>
              <TextboxNumeric
                onNumericValueInput={(value) => setPeriodCount(value ?? 1)}
                value={String(periodCount)}
              />
            </div>
            <div className={styles.fieldRow}>
              <Text className={styles.fieldLabel}>Selected</Text>
              <TextboxNumeric
                onNumericValueInput={(value) => setSelectedIndex(value ?? 0)}
                value={String(selectedIndex)}
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
              <Text className={styles.fieldLabel}>Y title</Text>
              <Textbox onValueInput={setYAxisTitle} value={yAxisTitle} />
            </div>
            <div className={styles.fieldRow}>
              <Text className={styles.fieldLabel}>X title</Text>
              <Textbox onValueInput={setXAxisTitle} value={xAxisTitle} />
            </div>
            <div className={styles.fieldRow}>
              <Text className={styles.fieldLabel}>Labels</Text>
              <Textbox onValueInput={setLabelsInput} value={labelsInput} />
            </div>
          </Stack>
          <VerticalSpace space="medium" />
          <div className={styles.divider} />
          <VerticalSpace space="medium" />
          <Stack space="small">
            <Text className={styles.sectionTitle}>Series A</Text>
            <div className={styles.fieldRow}>
              <Text className={styles.fieldLabel}>Name</Text>
              <Textbox onValueInput={setSeriesAName} value={seriesAName} />
            </div>
            <div className={styles.fieldRow}>
              <Text className={styles.fieldLabel}>Color</Text>
              <Textbox onValueInput={setSeriesAColor} value={seriesAColor} />
            </div>
            <div className={styles.fieldRow}>
              <Text className={styles.fieldLabel}>Values</Text>
              <Textbox onValueInput={setSeriesAValues} value={seriesAValues} />
            </div>
          </Stack>
          {barMode === "dual" ? (
            <div>
              <VerticalSpace space="medium" />
              <div className={styles.divider} />
              <VerticalSpace space="medium" />
              <Stack space="small">
                <Text className={styles.sectionTitle}>Series B</Text>
                <div className={styles.fieldRow}>
                  <Text className={styles.fieldLabel}>Name</Text>
                  <Textbox onValueInput={setSeriesBName} value={seriesBName} />
                </div>
                <div className={styles.fieldRow}>
                  <Text className={styles.fieldLabel}>Color</Text>
                  <Textbox onValueInput={setSeriesBColor} value={seriesBColor} />
                </div>
                <div className={styles.fieldRow}>
                  <Text className={styles.fieldLabel}>Values</Text>
                  <Textbox
                    onValueInput={setSeriesBValues}
                    value={seriesBValues}
                  />
                </div>
              </Stack>
            </div>
          ) : null}
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
