import { Stack, Textbox } from "@create-figma-plugin/ui";
import { h } from "preact";
import EditSectionHeader from "./EditSectionHeader";

export function getEffectiveChartTitle(visible: boolean, title: string) {
  return visible ? title : "";
}

interface ChartTitleControlProps {
  onTitleChange: (title: string) => void;
  onVisibleChange: (visible: boolean) => void;
  title: string;
  visible: boolean;
}

function ChartTitleControl({
  onTitleChange,
  onVisibleChange,
  title,
  visible,
}: ChartTitleControlProps) {
  return (
    <Stack space="small">
      <EditSectionHeader
        hideTitle="Hide chart title"
        onVisibilityToggle={() => onVisibleChange(!visible)}
        showTitle="Show chart title"
        title="Chart title"
        visible={visible}
      />
      {visible ? (
        <Textbox
          onValueInput={onTitleChange}
          placeholder="Chart title"
          value={title}
        />
      ) : null}
    </Stack>
  );
}

export default ChartTitleControl;
