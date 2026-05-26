import {
  Button,
  IconPlus16,
  SegmentedControl,
  SegmentedControlOption,
  Stack,
  Text,
  TextboxNumeric,
  Toggle,
  VerticalSpace,
} from "@create-figma-plugin/ui";
import { emit } from "@create-figma-plugin/utilities";
import { h } from "preact";
import { useCallback, useEffect, useState } from "preact/hooks";
import ChartItemInput, { ChartItem } from "../components/ChartItemInput";
import ChartSizeControl, {
  useChartSizeControl,
} from "../components/editControl/ChartSizeControl";
import ChartTitleControl, {
  getEffectiveChartTitle,
} from "../components/editControl/ChartTitleControl";
import EditSectionHeader from "../components/editControl/EditSectionHeader";
import LegendControl, {
  getEffectiveLegendStyle,
} from "../components/editControl/LegendControl";
import PieDonutPreview from "../components/PieDonutPreview";
import {
  chartGeneralConfig,
  pieChartConfig,
  pluginUISize,
  sampleData,
} from "../config";
import {
  getDonutRingWidthBounds,
  getPieChartSizeBounds,
  isValidDonutRingWidth,
  isValidPieSliceGap,
} from "../utils/chart/pieDonutCalculate";
import { LegendStyle } from "../types";
import { useRefreshDesignTokensOnMount } from "../utils/useRefreshDesignTokens";
import styles from "../ui.css";

interface PieDonutChartPageProps {
  onBack: () => void;
}

type PieDonutChartKind = "pie" | "donut";

const MIN_ITEMS = 2;
const MAX_ITEMS = 10;
const DEFAULT_ITEM_COUNT = 4;
const CHART_KIND_OPTIONS: Array<SegmentedControlOption> = [
  { children: "Pie", value: "pie" },
  { children: "Donut", value: "donut" },
];

function createEmptyItem(index: number): ChartItem {
  return { label: `Item ${index + 1}`, value: 0, valueInput: "0" };
}

function createSampleItems(): ChartItem[] {
  const fromSample = sampleData.spending.data.map((item) => ({
    label: item.label,
    value: item.value,
    valueInput: String(item.value),
  }));
  const result = [...fromSample];
  while (result.length < DEFAULT_ITEM_COUNT) {
    result.push(createEmptyItem(result.length));
  }
  return result.slice(0, DEFAULT_ITEM_COUNT);
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

function isValidIndicatorLineExtend(value: number) {
  const { lineExtendMin, lineExtendMax } = pieChartConfig.indicator;
  return (
    Number.isFinite(value) && value >= lineExtendMin && value <= lineExtendMax
  );
}

function PieDonutChartPage({ onBack }: PieDonutChartPageProps) {
  useRefreshDesignTokensOnMount();
  const [chartKind, setChartKind] = useState<PieDonutChartKind>("pie");
  const sizeControl = useChartSizeControl({
    chartSizeRangeLabel: "30%–60% of width",
    clampChartSizeToMaxOnFrameWidthChange: true,
    defaultChartSize: pieChartConfig.chartSize,
    defaultFrameWidth: chartGeneralConfig.frameWidth,
    frameWidthMax: pieChartConfig.frameWidthMax,
    frameWidthMin: pieChartConfig.frameWidthMin,
    getChartSizeBounds: getPieChartSizeBounds,
  });
  const [sliceGap, setSliceGap] = useState<number>(pieChartConfig.sliceGap);
  const [sliceGapInput, setSliceGapInput] = useState<string>(
    String(pieChartConfig.sliceGap),
  );
  const sliceGapInputValid = isValidPieSliceGap(Number(sliceGapInput));
  const [donutRingWidth, setDonutRingWidth] = useState<number>(
    pieChartConfig.ringWidth,
  );
  const [donutRingWidthInput, setDonutRingWidthInput] = useState<string>(
    String(pieChartConfig.ringWidth),
  );
  const donutRingWidthBounds = getDonutRingWidthBounds(sizeControl.chartSize);
  const donutRingWidthInputValid = isValidDonutRingWidth(
    Number(donutRingWidthInput),
    sizeControl.chartSize,
  );
  const [chartTitle, setChartTitle] = useState<string>("Chart title");
  const [showChartTitle, setShowChartTitle] = useState<boolean>(false);
  const effectiveChartTitle = getEffectiveChartTitle(
    showChartTitle,
    chartTitle,
  );
  const [items, setItems] = useState<ChartItem[]>(createSampleItems);
  const [showLegend, setShowLegend] = useState<boolean>(true);
  const [legendStyle, setLegendStyle] = useState<LegendStyle>("leftAndRight");
  const effectiveLegendStyle = getEffectiveLegendStyle(
    showLegend,
    legendStyle,
    "none",
  );
  const [showPercentage, setShowPercentage] = useState<boolean>(true);
  const [showIndicator, setShowIndicator] = useState<boolean>(true);
  const [showIndicatorPercentage, setShowIndicatorPercentage] =
    useState<boolean>(true);
  const [indicatorLineExtend, setIndicatorLineExtend] = useState<number>(
    pieChartConfig.indicator.lineExtend,
  );
  const [indicatorLineExtendInput, setIndicatorLineExtendInput] =
    useState<string>(String(pieChartConfig.indicator.lineExtend));
  const indicatorLineExtendInputValid = isValidIndicatorLineExtend(
    Number(indicatorLineExtendInput),
  );
  const [valuePrefix, setValuePrefix] = useState<string>("");
  const [valueSuffix, setValueSuffix] = useState<string>("HKD");

  useEffect(() => {
    emit("RESIZE_PLUGIN_UI_WINDOW", {
      width: pluginUISize.editPage.width,
      height: pluginUISize.editPage.height,
    });
    return () => {
      emit("RESIZE_PLUGIN_UI_WINDOW", {
        width: pluginUISize.homePage.width,
        height: pluginUISize.homePage.height,
      });
    };
  }, []);

  const handleLabelInput = useCallback((index: number, label: string) => {
    setItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, label } : item,
      ),
    );
  }, []);

  const handleValueInput = useCallback((index: number, valueInput: string) => {
    const sanitizedValueInput = sanitizeDecimalInput(valueInput);
    const value = Number(sanitizedValueInput);
    setItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              value: Number.isNaN(value) ? 0 : value,
              valueInput: sanitizedValueInput,
            }
          : item,
      ),
    );
  }, []);

  const handleAddItem = useCallback(function () {
    setItems((currentItems) =>
      currentItems.length >= MAX_ITEMS
        ? currentItems
        : [...currentItems, createEmptyItem(currentItems.length)],
    );
  }, []);

  const handleDeleteItem = useCallback(function (index: number) {
    setItems((currentItems) =>
      currentItems.length <= MIN_ITEMS
        ? currentItems
        : currentItems.filter((_, itemIndex) => itemIndex !== index),
    );
  }, []);

  const handleGenerateButtonClick = useCallback(
    function () {
      emit("SUBMIT_PIE_CHART_DATA", {
        data: items.map((item) => ({
          label: item.label,
          value: item.value,
        })),
        chartTitle: effectiveChartTitle,
        pieChartKind: chartKind,
        legendStyle: effectiveLegendStyle,
        showPercentage,
        showIndicator,
        showIndicatorPercentage,
        indicatorLineExtend,
        pieSliceGap: sliceGap,
        donutRingWidth: chartKind === "donut" ? donutRingWidth : undefined,
        valuePrefix,
        valueSuffix,
        frameWidth: sizeControl.frameWidth,
        semiDonutSize: sizeControl.chartSize,
      });
    },
    [
      chartKind,
      items,
      effectiveChartTitle,
      effectiveLegendStyle,
      showPercentage,
      showIndicator,
      showIndicatorPercentage,
      indicatorLineExtend,
      sliceGap,
      donutRingWidth,
      valuePrefix,
      valueSuffix,
      sizeControl.frameWidth,
      sizeControl.chartSize,
    ],
  );

  const pageTitle = chartKind === "donut" ? "Donut chart" : "Pie chart";

  return (
    <div className={styles.horizontalBarPage}>
      <div className={styles.horizontalBarLeftPanel}>
        <div className={styles.horizontalBarHeader}>
          <button
            className={styles.horizontalBarBackButton}
            onClick={onBack}
            title="Back"
            type="button"
          >
            ←
          </button>
          <Text className={styles.horizontalBarTypeTitle}>{pageTitle}</Text>
        </div>
        <div
          className={`${styles.horizontalBarPreviewPanel} ${styles.horizontalBarPreviewPanelVariableWidth}`}
        >
          <PieDonutPreview
            chartKind={chartKind}
            frameWidth={sizeControl.frameWidth}
            chartSize={sizeControl.chartSize}
            chartTitle={effectiveChartTitle}
            items={items}
            legendStyle={effectiveLegendStyle}
            showIndicator={showIndicator}
            showIndicatorPercentage={showIndicatorPercentage}
            indicatorLineExtend={indicatorLineExtend}
            sliceGap={sliceGap}
            donutRingWidth={donutRingWidth}
            showPercentage={showPercentage}
            valuePrefix={valuePrefix}
            valueSuffix={valueSuffix}
          />
        </div>
      </div>
      <div className={styles.horizontalBarRightPanel}>
        <div className={styles.horizontalBarControls}>
          <div className={styles.fieldRow}>
            <Text className={styles.sectionTitle}>Type</Text>
            <div className={styles.fieldRowSegmentControl}>
              <SegmentedControl
                onValueChange={(value) =>
                  setChartKind(value as PieDonutChartKind)
                }
                options={CHART_KIND_OPTIONS}
                value={chartKind}
              />
            </div>
          </div>
          <VerticalSpace space="medium" />
          <div className={styles.divider} />
          <VerticalSpace space="medium" />
          <ChartTitleControl
            onTitleChange={setChartTitle}
            onVisibleChange={setShowChartTitle}
            title={chartTitle}
            visible={showChartTitle}
          />
          <VerticalSpace space="medium" />
          <div className={styles.divider} />
          <VerticalSpace space="medium" />
          <ChartSizeControl
            chartSizeBounds={sizeControl.chartSizeBounds}
            chartSizeInput={sizeControl.chartSizeInput}
            chartSizeRangeLabel={sizeControl.chartSizeRangeLabel}
            chartSizeSliderValue={sizeControl.chartSizeSliderValue}
            frameWidthInput={sizeControl.frameWidthInput}
            frameWidthMax={sizeControl.frameWidthMax}
            frameWidthMin={sizeControl.frameWidthMin}
            isChartSizeValid={sizeControl.isChartSizeValid}
            isFrameWidthValid={sizeControl.isFrameWidthValid}
            isRingWidthValid={
              chartKind === "donut" ? donutRingWidthInputValid : undefined
            }
            isSliceGapValid={sliceGapInputValid}
            onChartSizeNumericInput={sizeControl.handleChartSizeNumericInput}
            onChartSizeSliderInput={sizeControl.handleChartSizeSliderInput}
            onFrameWidthInput={sizeControl.handleFrameWidthInput}
            onRingWidthInput={
              chartKind === "donut"
                ? (value) => {
                    if (value === null) {
                      setDonutRingWidthInput("");
                      return;
                    }
                    const nextInput = String(value);
                    setDonutRingWidthInput(nextInput);
                    if (isValidDonutRingWidth(value, sizeControl.chartSize)) {
                      setDonutRingWidth(Math.round(value));
                    }
                  }
                : undefined
            }
            onSliceGapInput={(value) => {
              const sanitizedValue = sanitizeDecimalInput(value);
              setSliceGapInput(sanitizedValue);
              const numericValue = Number(sanitizedValue);
              if (sanitizedValue !== "" && isValidPieSliceGap(numericValue)) {
                setSliceGap(numericValue);
              }
            }}
            ringWidthInput={
              chartKind === "donut" ? donutRingWidthInput : undefined
            }
            ringWidthMax={
              chartKind === "donut" ? donutRingWidthBounds.max : undefined
            }
            ringWidthMin={
              chartKind === "donut" ? donutRingWidthBounds.min : undefined
            }
            sliceGapInput={sliceGapInput}
            sliceGapMax={pieChartConfig.sliceGapMax}
            sliceGapMin={pieChartConfig.sliceGapMin}
          />
          <VerticalSpace space="medium" />
          <div className={styles.divider} />
          <VerticalSpace space="medium" />
          <Stack space="small">
            <div className={styles.editSectionHeader}>
              <Text className={styles.sectionTitle}>Data</Text>
              <Text className={styles.fieldLabel}>
                {items.length}/{MAX_ITEMS} items
              </Text>
            </div>
            {items.map((item, index) => (
              <ChartItemInput
                key={index}
                index={index}
                item={item}
                canDelete={items.length > MIN_ITEMS}
                onDelete={handleDeleteItem}
                onLabelInput={handleLabelInput}
                onValueInput={handleValueInput}
              />
            ))}
            <Button
              secondary
              disabled={items.length >= MAX_ITEMS}
              fullWidth
              onClick={handleAddItem}
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
                Add item
              </span>
            </Button>
          </Stack>
          <VerticalSpace space="medium" />
          <div className={styles.divider} />
          <VerticalSpace space="medium" />
          <Stack space="small">
            <EditSectionHeader
              hideTitle="Hide indicator"
              onVisibilityToggle={() => setShowIndicator((current) => !current)}
              showTitle="Show indicator"
              title="Indicator"
              visible={showIndicator}
            />
            {showIndicator ? (
              <Stack space="small">
                <div className={styles.fieldRow}>
                  <Text className={styles.fieldLabel}>Line extend</Text>
                  <TextboxNumeric
                    onNumericValueInput={(value) => {
                      if (value === null) {
                        setIndicatorLineExtendInput("");
                        return;
                      }
                      const nextInput = String(value);
                      setIndicatorLineExtendInput(nextInput);
                      if (isValidIndicatorLineExtend(value)) {
                        setIndicatorLineExtend(Math.round(value));
                      }
                    }}
                    value={indicatorLineExtendInput}
                  />
                </div>
                {!indicatorLineExtendInputValid ? (
                  <div className={styles.fieldHintError}>
                    Line extend must be between{" "}
                    {pieChartConfig.indicator.lineExtendMin} and{" "}
                    {pieChartConfig.indicator.lineExtendMax}.
                  </div>
                ) : null}
                <div className={styles.fieldRow}>
                  <Text className={styles.fieldLabel}>Percentage</Text>
                  <Toggle
                    onValueChange={setShowIndicatorPercentage}
                    value={showIndicatorPercentage}
                  >
                    {" "}
                  </Toggle>
                </div>
              </Stack>
            ) : null}
          </Stack>
          <VerticalSpace space="medium" />
          <div className={styles.divider} />
          <VerticalSpace space="medium" />
          <LegendControl
            legendStyle={legendStyle}
            onLegendStyleChange={setLegendStyle}
            onShowPercentageChange={setShowPercentage}
            onValuePrefixChange={setValuePrefix}
            onValueSuffixChange={setValueSuffix}
            onVisibleChange={setShowLegend}
            showPercentage={showPercentage}
            valuePrefix={valuePrefix}
            valueSuffix={valueSuffix}
            visible={showLegend}
          />
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

export default PieDonutChartPage;
