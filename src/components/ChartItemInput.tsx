import { IconButton, IconTrash24, Textbox } from "@create-figma-plugin/ui";
import { h } from "preact";
import { dataVisColor } from "../config";
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
  const color = dataVisColor[index % dataVisColor.length].value;
  return (
    <div className={styles.chartItemInput}>
      <div
        style={{
          backgroundColor: color,
          flexShrink: 0,
          height: "12px",
          width: "12px",
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
          <IconButton onClick={() => onDelete(index)} title="Delete item">
            <IconTrash24 />
          </IconButton>
        ) : null}
      </div>
    </div>
  );
}

export default ChartItemInput;
