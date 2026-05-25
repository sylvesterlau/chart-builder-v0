import {
  Button,
  IconPlus16,
  Stack,
  Text,
  Textbox,
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
import SemiDonutChartPreview from "../components/SemiDonutChartPreview";
import {
  getSemiDonutSizeBounds,
  pluginUISize,
  sampleData,
  semiDonutChartConfig,
} from "../config";
import { LegendStyle } from "../types";
import { useRefreshDesignTokensOnMount } from "../utils/useRefreshDesignTokens";
import styles from "../ui.css";

interface SemiDonutChartPageProps {
  onBack: () => void;
}

const MIN_ITEMS = 2;
const MAX_ITEMS = 10;
const DEFAULT_ITEM_COUNT = 4;

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

function SemiDonutChartPage({ onBack }: SemiDonutChartPageProps) {
  useRefreshDesignTokensOnMount();
  const sizeControl = useChartSizeControl({
    chartSizeRangeLabel: "50%–100% of width",
    defaultChartSize: semiDonutChartConfig.size,
    defaultFrameWidth: semiDonutChartConfig.frameWidth,
    frameWidthMax: semiDonutChartConfig.frameWidthMax,
    frameWidthMin: semiDonutChartConfig.frameWidthMin,
    getChartSizeBounds: getSemiDonutSizeBounds,
  });
  const [chartTitle, setChartTitle] = useState<string>("Chart title");
  const [showChartTitle, setShowChartTitle] = useState<boolean>(false);
  const effectiveChartTitle = getEffectiveChartTitle(showChartTitle, chartTitle);
  const [items, setItems] = useState<ChartItem[]>(createSampleItems);
  const [showTotalValueInput, setShowTotalValueInput] = useState<boolean>(true);
  const effectiveShowTotalValue = showTotalValueInput;
  const [totalValueTitle, setTotalValueTitle] = useState<string>("Total value");
  const [showLegend, setShowLegend] = useState<boolean>(true);
  const [legendStyle, setLegendStyle] = useState<LegendStyle>("leftAndRight");
  const effectiveLegendStyle = getEffectiveLegendStyle(
    showLegend,
    legendStyle,
    "none",
  );
  const [valuePrefix, setValuePrefix] = useState<string>("");
  const [valueSuffix, setValueSuffix] = useState<string>("HKD");
  const [showPercentage, setShowPercentage] = useState<boolean>(true);

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
      emit("SUBMIT_SEMI_DONUT_CHART_DATA", {
        data: items.map((item) => ({
          label: item.label,
          value: item.value,
        })),
        chartTitle: effectiveChartTitle,
        legendStyle: effectiveLegendStyle,
        showPercentage,
        valuePrefix,
        valueSuffix,
        showTotalValue: effectiveShowTotalValue,
        totalValueTitle,
        frameWidth: sizeControl.frameWidth,
        semiDonutSize: sizeControl.chartSize,
      });
    },
    [
      items,
      sizeControl.frameWidth,
      sizeControl.chartSize,
      effectiveChartTitle,
      effectiveLegendStyle,
      showPercentage,
      valuePrefix,
      valueSuffix,
      effectiveShowTotalValue,
      totalValueTitle,
    ],
  );

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
          <Text className={styles.horizontalBarTypeTitle}>
            Semi-donut chart
          </Text>
        </div>
        <div
          className={`${styles.horizontalBarPreviewPanel} ${styles.horizontalBarPreviewPanelVariableWidth}`}
        >
          <SemiDonutChartPreview
            frameWidth={sizeControl.frameWidth}
            chartSize={sizeControl.chartSize}
            chartTitle={effectiveChartTitle}
            items={items}
            legendStyle={effectiveLegendStyle}
            showPercentage={showPercentage}
            valuePrefix={valuePrefix}
            valueSuffix={valueSuffix}
            showTotalValue={effectiveShowTotalValue}
            totalValueTitle={totalValueTitle}
          />
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
            onChartSizeNumericInput={sizeControl.handleChartSizeNumericInput}
            onChartSizeSliderInput={sizeControl.handleChartSizeSliderInput}
            onFrameWidthInput={sizeControl.handleFrameWidthInput}
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
              hideTitle="Hide total value"
              onVisibilityToggle={() =>
                setShowTotalValueInput((current) => !current)
              }
              showTitle="Show total value"
              title="Total value"
              visible={showTotalValueInput}
            />
            {showTotalValueInput ? (
              <div className={styles.fieldRow}>
                <Text className={styles.fieldLabel}>Tile</Text>
                <Textbox
                  onValueInput={setTotalValueTitle}
                  placeholder="Total value title"
                  value={totalValueTitle}
                />
              </div>
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

export default SemiDonutChartPage;
