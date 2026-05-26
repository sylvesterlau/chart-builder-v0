import { IconMinusSmall24, Textbox } from "@create-figma-plugin/ui";
import { h } from "preact";
import { dataVisAt } from "../utils/dataVisAt";
import { colorTokenSwatchHex } from "../utils/colorTokenDisplay";
import { useColorTokenResolved } from "./ColorChips/colorTokenSwatchContext";
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
  onDelete: (index: number) => void;
  onLabelInput: (index: number, label: string) => void;
  onValueInput: (index: number, valueInput: string) => void;
}

function ChartItemInput({
  index,
  item,
  canDelete,
  onDelete,
  onLabelInput,
  onValueInput,
}: ChartItemInputProps) {
  const { values: resolvedColors } = useColorTokenResolved();
  const color = colorTokenSwatchHex(dataVisAt(index), resolvedColors);
  return (
    <div className={styles.chartItemInput}>
      <div
        style={{
          backgroundColor: color,
          flexShrink: 0,
          height: "12px",
          width: "12px",
          marginRight: "2px",
        }}
      />
      <div className={styles.chartItemInputField}>
        <Textbox
          onValueInput={(label) => onLabelInput(index, label)}
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

export default ChartItemInput;
