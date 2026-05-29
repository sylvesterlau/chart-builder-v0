import {
  Dropdown,
  DropdownOption,
  Stack,
  Text,
  Textbox,
  Toggle,
  VerticalSpace,
} from "@create-figma-plugin/ui";
import { h } from "preact";
import { LegendStyle } from "../../types";
import styles from "../../ui.css";
import EditSectionHeader from "./EditSectionHeader";

const LEGEND_STYLE_OPTIONS: Array<DropdownOption> = [
  { text: "Left and right", value: "leftAndRight" },
  { text: "Top and bottom", value: "topAndBottom" },
];

export function getEffectiveLegendStyle<T extends string>(
  visible: boolean,
  style: T,
  hiddenStyle: T,
): T {
  return visible ? style : hiddenStyle;
}

interface LegendControlProps {
  legendStyle: LegendStyle;
  onLegendStyleChange: (style: LegendStyle) => void;
  onShowPercentageChange: (show: boolean) => void;
  onValuePrefixChange: (prefix: string) => void;
  onValueSuffixChange: (suffix: string) => void;
  onVisibleChange: (visible: boolean) => void;
  showPercentage: boolean;
  valuePrefix: string;
  valueSuffix: string;
  visible: boolean;
}

function LegendControl({
  legendStyle,
  onLegendStyleChange,
  onShowPercentageChange,
  onValuePrefixChange,
  onValueSuffixChange,
  onVisibleChange,
  showPercentage,
  valuePrefix,
  valueSuffix,
  visible,
}: LegendControlProps) {
  return (
    <Stack space="small">
      <EditSectionHeader
        hideTitle="Hide legend"
        onVisibilityToggle={() => onVisibleChange(!visible)}
        showTitle="Show legend"
        title="Legend"
        visible={visible}
      />
      {visible ? (
        <Stack space="small">
          <div className={styles.fieldRow}>
            <Text className={styles.fieldLabel}>Style</Text>
            <Dropdown
              onValueChange={(value) =>
                onLegendStyleChange(value as LegendStyle)
              }
              options={LEGEND_STYLE_OPTIONS}
              value={legendStyle}
            />
          </div>
          <div className={styles.fieldRow}>
            <Text className={styles.fieldLabel}>Percentage</Text>
            <Toggle onValueChange={onShowPercentageChange} value={showPercentage}>
              {" "}
            </Toggle>
          </div>
          <div className={styles.fieldRow}>
            <Text className={styles.fieldLabel}>Value prefix</Text>
            <Textbox
              onValueInput={onValuePrefixChange}
              placeholder="Value prefix"
              value={valuePrefix}
            />
          </div>
          <div className={styles.fieldRow}>
            <Text className={styles.fieldLabel}>Value suffix</Text>
            <Textbox
              onValueInput={onValueSuffixChange}
              placeholder="Value suffix"
              value={valueSuffix}
            />
          </div>
        </Stack>
      ) : null}
      <VerticalSpace space="medium" />
    </Stack>
  );
}

export default LegendControl;
