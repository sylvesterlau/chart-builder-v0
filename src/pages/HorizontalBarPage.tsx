import {
  Button,
  Dropdown,
  DropdownOption,
  IconPlus16,
  Stack,
  Text,
  Textbox,
  Toggle,
  VerticalSpace,
} from "@create-figma-plugin/ui";
import { emit } from "@create-figma-plugin/utilities";
import { h } from "preact";
import { useCallback, useEffect, useState } from "preact/hooks";
import ChartItemInput, { ChartItem } from "../components/ChartItemInput";
import HorizontalBarChartPreview from "../components/HorizontalBarChartPreview";
import { pluginUI, sampleData } from "../config";
import { LegendStyle } from "../types";
import styles from "../ui.css";
interface HorizontalBarPageProps {
  onBack: () => void;
}
const MIN_ITEMS = 2;
const MAX_ITEMS = 10;
const DEFAULT_ITEM_COUNT = 3;
const LEGEND_STYLE_OPTIONS: Array<DropdownOption> = [
  { text: "None", value: "none" },
  { text: "Left and right", value: "leftAndRight" },
  { text: "Top and bottom", value: "topAndBottom" },
];
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
  const [chartTitle, setChartTitle] = useState<string>("Chart title");
  const [items, setItems] = useState<ChartItem[]>(createSampleItems);
  const [legendStyle, setLegendStyle] = useState<LegendStyle>("leftAndRight");
  const [showPercentage, setShowPercentage] = useState<boolean>(true);
  const [valuePrefix, setValuePrefix] = useState<string>("");
  const [valueSuffix, setValueSuffix] = useState<string>("HKD");
  useEffect(() => {
    emit("RESIZE_PLUGIN_UI_WINDOW", {
      width: pluginUI.horizontalBarPageSize.width,
      height: pluginUI.horizontalBarPageSize.height,
    });
    return () => {
      emit("RESIZE_PLUGIN_UI_WINDOW", {
        width: pluginUI.size.width,
        height: pluginUI.size.height,
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
        chartTitle,
        data: items.map((item) => ({
          label: item.label,
          value: item.value,
        })),
        legendStyle,
        showPercentage,
        valuePrefix,
        valueSuffix,
      };
      // send form data to main.ts
      emit("SUBMIT_HORIZONTAL_BAR_CHART_DATA", formData);
    },
    [chartTitle, items, legendStyle, showPercentage, valuePrefix, valueSuffix],
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
            chartTitle={chartTitle}
            items={items}
            legendStyle={legendStyle}
            showPercentage={showPercentage}
            valuePrefix={valuePrefix}
            valueSuffix={valueSuffix}
          />
        </div>
      </div>
      <div className={styles.horizontalBarRightPanel}>
        <div className={styles.horizontalBarControls}>
          {/* input field stack */}
          <Text className={styles.sectionTitle}>Chart title</Text>
          <VerticalSpace space="small" />
          <Textbox
            onValueInput={(value) => setChartTitle(value)}
            value={chartTitle}
            placeholder="Chart title"
          />
          <VerticalSpace space="medium" />
          <div className={styles.divider} />
          <VerticalSpace space="medium" />
          <Stack space="small">
            <div
              style={{
                alignItems: "center",
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
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
          {/* button group */}
          <Stack space="small">
            {/* Legend control  */}
            <Text className={styles.sectionTitle}>Legend</Text>
            <div className={styles.fieldRow}>
              <Text className={styles.fieldLabel}>Style</Text>
              <Dropdown
                onValueChange={(value) => setLegendStyle(value as LegendStyle)}
                options={LEGEND_STYLE_OPTIONS}
                value={legendStyle}
              />
            </div>
            <div className={styles.fieldRow}>
              <Text className={styles.fieldLabel}>Percentage</Text>
              <Toggle onValueChange={setShowPercentage} value={showPercentage}>
                {" "}
              </Toggle>
            </div>
            <div className={styles.fieldRow}>
              <Text className={styles.fieldLabel}>Value prefix</Text>
              <Textbox
                onValueInput={(value) => setValuePrefix(value)}
                value={valuePrefix}
                placeholder="Value prefix"
              />
            </div>
            <div className={styles.fieldRow}>
              <Text className={styles.fieldLabel}>Value suffix</Text>
              <Textbox
                onValueInput={(value) => setValueSuffix(value)}
                value={valueSuffix}
                placeholder="Value suffix"
              />
            </div>
            <VerticalSpace space="medium" />
          </Stack>
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
