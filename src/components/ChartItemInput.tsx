import {
  IconInfo16,
  IconMinusSmall24,
  Text,
  Textbox,
} from "@create-figma-plugin/ui";
import { h } from "preact";
import type { ComponentChild } from "preact";
import { dataVisAt } from "../utils/dataVisAt";
import {
  LEGEND_OTHERS_LABEL,
  getLegendAggregationLayout,
} from "../utils/legendAggregate";
import { colorTokenSwatchHex } from "../utils/colorTokenDisplay";
import { useColorTokenResolved } from "./ColorChips/colorTokenSwatchContext";
import { TokenChipTooltip } from "./TokenChipTooltip/TokenChipTooltip";
import styles from "../ui.css";

export interface ChartItem {
  label: string;
  value: number;
  valueInput: string;
}

interface ChartItemInputProps {
  index: number;
  item: ChartItem;
  canDelete: boolean;
  nestedUnderOthers?: boolean;
  onDelete: (index: number) => void;
  onLabelInput: (index: number, label: string) => void;
  onValueInput: (index: number, valueInput: string) => void;
}

function ColorSwatch({ colorIndex }: { colorIndex: number }) {
  const { values: resolvedColors } = useColorTokenResolved();
  const color = colorTokenSwatchHex(dataVisAt(colorIndex), resolvedColors);
  return (
    <div
      style={{
        backgroundColor: color,
        boxSizing: "border-box",
        flexShrink: 0,
        height: "12px",
        marginRight: "2px",
        width: "12px",
      }}
    />
  );
}

function NestedItemMarker() {
  return (
    <div
      aria-hidden="true"
      style={{
        alignItems: "center",
        boxSizing: "border-box",
        color: "var(--figma-color-text-secondary)",
        display: "flex",
        flexShrink: 0,
        fontSize: "11px",
        height: "12px",
        justifyContent: "center",
        lineHeight: 1,
        marginRight: "2px",
        width: "12px",
      }}
    >
      └
    </div>
  );
}

function ChartAggregationHeader() {
  return (
    <div className={styles.chartAggregationHeader}>
      <Text className={styles.sectionTitle}>Aggregation</Text>
      <TokenChipTooltip
        large
        placement="top"
        tokenName="Items from the 6th onward are combined into one group."
      >
        <span
          aria-label="About Aggregation"
          className={styles.chartOthersInfoIcon}
          tabIndex={0}
        >
          <IconInfo16 />
        </span>
      </TokenChipTooltip>
    </div>
  );
}

function ChartOthersLabelInput({
  colorIndex,
  label,
  onLabelInput,
}: {
  colorIndex: number;
  label: string;
  onLabelInput: (label: string) => void;
}) {
  return (
    <div className={styles.chartItemInput}>
      <ColorSwatch colorIndex={colorIndex} />
      <div className={styles.chartOthersInputField}>
        <Textbox
          onValueInput={onLabelInput}
          placeholder={LEGEND_OTHERS_LABEL}
          value={label}
        />
      </div>
      <div className={styles.chartItemDeleteButtonWrap} />
    </div>
  );
}

function ChartItemInput({
  index,
  item,
  canDelete,
  nestedUnderOthers = false,
  onDelete,
  onLabelInput,
  onValueInput,
}: ChartItemInputProps) {
  return (
    <div className={styles.chartItemInput}>
      {nestedUnderOthers ? (
        <NestedItemMarker />
      ) : (
        <ColorSwatch colorIndex={index} />
      )}
      <div className={styles.chartItemInputField}>
        <Textbox
          onValueInput={(nextLabel) => onLabelInput(index, nextLabel)}
          value={item.label}
          placeholder={`Label ${String.fromCharCode(65 + index)}`}
        />
      </div>
      <div className={styles.chartItemInputField}>
        <Textbox
          onValueInput={(valueInput) => onValueInput(index, valueInput)}
          value={item.valueInput}
          placeholder="Value"
        />
      </div>
      <div className={styles.chartItemDeleteButtonWrap}>
        {canDelete ? (
          <div
            className={styles.chartItemDeleteButton}
            onClick={() => onDelete(index)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onDelete(index);
              }
            }}
            role="button"
            tabIndex={0}
            title="Delete item"
          >
            <IconMinusSmall24 />
          </div>
        ) : null}
      </div>
    </div>
  );
}

interface ChartDataItemsListProps {
  items: ChartItem[];
  canDelete: boolean;
  othersLabel: string;
  onOthersLabelInput: (label: string) => void;
  onDelete: (index: number) => void;
  onLabelInput: (index: number, label: string) => void;
  onValueInput: (index: number, valueInput: string) => void;
}

/** Renders data rows with Others aggregation cues matching legend/chart. */
export function ChartDataItemsList({
  items,
  canDelete,
  othersLabel,
  onOthersLabelInput,
  onDelete,
  onLabelInput,
  onValueInput,
}: ChartDataItemsListProps) {
  const aggregation = getLegendAggregationLayout(items);
  const rows: ComponentChild[] = [];

  items.forEach((item, index) => {
    if (
      aggregation.active &&
      aggregation.othersInsertBeforeIndex === index &&
      aggregation.othersColorIndex !== null
    ) {
      rows.push(<ChartAggregationHeader key="aggregation-header" />);
      rows.push(
        <ChartOthersLabelInput
          key="others-label"
          colorIndex={aggregation.othersColorIndex}
          label={othersLabel}
          onLabelInput={onOthersLabelInput}
        />,
      );
    }
    rows.push(
      <ChartItemInput
        key={index}
        index={index}
        item={item}
        canDelete={canDelete}
        nestedUnderOthers={aggregation.nestedIndices.has(index)}
        onDelete={onDelete}
        onLabelInput={onLabelInput}
        onValueInput={onValueInput}
      />,
    );
  });

  return <div className={styles.chartDataItemsList}>{rows}</div>;
}

export default ChartItemInput;
