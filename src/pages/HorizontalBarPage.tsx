import {
  Button,
  IconPlus16,
  Stack,
  Text,
  VerticalSpace,
} from "@create-figma-plugin/ui";
import { emit } from "@create-figma-plugin/utilities";
import { h } from "preact";
import { useCallback, useEffect, useState } from "preact/hooks";
import ChartItemInput, { ChartItem } from "../components/ChartItemInput";
import ChartTitleControl, {
  getEffectiveChartTitle,
} from "../components/editControl/ChartTitleControl";
import LegendControl, {
  getEffectiveLegendStyle,
} from "../components/editControl/LegendControl";
import HorizontalBarChartPreview from "../components/HorizontalBarChartPreview";
import { pluginUISize, sampleData } from "../config";
import { LegendStyle } from "../types";
import { useRefreshDesignTokensOnMount } from "../utils/useRefreshDesignTokens";
import styles from "../ui.css";
interface HorizontalBarPageProps {
  onBack: () => void;
}
const MIN_ITEMS = 2;
const MAX_ITEMS = 10;
const DEFAULT_ITEM_COUNT = 3;

function createEmptyItem(index: number): ChartItem {
  return { label: `Item ${index + 1}`, value: 0, valueInput: "0" };
}
function createSampleItems(): ChartItem[] {
  return sampleData.spending.data.slice(0, DEFAULT_ITEM_COUNT).map((item) => ({
    label: item.label,
    value: item.value,
    valueInput: String(item.value),
  }));
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
function HorizontalBarPage({ onBack }: HorizontalBarPageProps) {
  useRefreshDesignTokensOnMount();
  const [chartTitle, setChartTitle] = useState<string>("Chart title");
  const [showChartTitle, setShowChartTitle] = useState<boolean>(false);
  const effectiveChartTitle = getEffectiveChartTitle(showChartTitle, chartTitle);
  const [items, setItems] = useState<ChartItem[]>(createSampleItems);
  const [showLegend, setShowLegend] = useState<boolean>(true);
  const [legendStyle, setLegendStyle] = useState<LegendStyle>("leftAndRight");
  const effectiveLegendStyle = getEffectiveLegendStyle(
    showLegend,
    legendStyle,
    "none",
  );
  const [showPercentage, setShowPercentage] = useState<boolean>(true);
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
      const formData = {
        chartTitle: effectiveChartTitle,
        data: items.map((item) => ({
          label: item.label,
          value: item.value,
        })),
        legendStyle: effectiveLegendStyle,
        showPercentage,
        valuePrefix,
        valueSuffix,
      };
      // send form data to main.ts
      emit("SUBMIT_HORIZONTAL_BAR_CHART_DATA", formData);
    },
    [
      effectiveChartTitle,
      items,
      effectiveLegendStyle,
      showPercentage,
      valuePrefix,
      valueSuffix,
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
            Horizontal bar chart
          </Text>
        </div>
        <div className={styles.horizontalBarPreviewPanel}>
          <HorizontalBarChartPreview
            chartTitle={effectiveChartTitle}
            items={items}
            legendStyle={effectiveLegendStyle}
            showPercentage={showPercentage}
            valuePrefix={valuePrefix}
            valueSuffix={valueSuffix}
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
export default HorizontalBarPage;
