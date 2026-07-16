import { h } from "preact";
import type { ComponentChildren } from "preact";
import { useDragResize } from "../../hooks/useDragResize";
import uiStyles from "../../ui.css";
import { editControlsPanelWidth } from "../../config";
import { useEditControlsPanelWidth } from "./editControlsPanelWidthContext";

interface ResizableEditControlsPanelProps {
  children: ComponentChildren;
}

export default function ResizableEditControlsPanel(
  props: ResizableEditControlsPanelProps,
) {
  const { setWidth, width } = useEditControlsPanelWidth();
  const dragHandlers = useDragResize({
    axis: "x",
    invert: true,
    max: editControlsPanelWidth.maxWidth,
    min: editControlsPanelWidth.minWidth,
    onChange: function handlePanelWidthChange(nextWidth: number) {
      setWidth(nextWidth, { persist: true });
    },
    value: width,
  });

  return (
    <div
      className={uiStyles.editChartControlsPanel}
      style={{ flex: `0 0 ${width}px`, width: `${width}px` }}
    >
      <div
        className={uiStyles.editControlsResizeHandle}
        title="Drag to resize panel"
        {...dragHandlers}
      />
      {props.children}
    </div>
  );
}
