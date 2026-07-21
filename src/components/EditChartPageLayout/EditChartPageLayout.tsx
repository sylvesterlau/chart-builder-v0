import { Text } from "@create-figma-plugin/ui";
import { h } from "preact";
import type { ComponentChildren } from "preact";
import uiStyles from "../../ui.css";
import { EditControlsPanelWidthProvider } from "./editControlsPanelWidthContext";
import ResizableEditControlsPanel from "./ResizableEditControlsPanel";

export type EditChartPreviewVariant = "horizontal" | "vertical";

interface EditChartPageHeaderProps {
  onBack: () => void;
  title: string;
}

function EditChartPageHeader(props: EditChartPageHeaderProps) {
  return (
    <div className={uiStyles.editChartHeader}>
      <button
        className={uiStyles.editChartBackButton}
        onClick={props.onBack}
        title="Back"
        type="button"
      >
        ←
      </button>
      <Text className={uiStyles.editChartTitle}>{props.title}</Text>
    </div>
  );
}

interface EditChartPageLayoutProps {
  actions: ComponentChildren;
  controls: ComponentChildren;
  onBack: () => void;
  preview: ComponentChildren;
  previewVariant: EditChartPreviewVariant;
  title: string;
}

export default function EditChartPageLayout(props: EditChartPageLayoutProps) {
  const previewClassName =
    props.previewVariant === "horizontal"
      ? `${uiStyles.editChartPreviewContent} ${uiStyles.editChartPreviewContentHorizontal}`
      : `${uiStyles.editChartPreviewContent} ${uiStyles.editChartPreviewContentVertical}`;

  return (
    <EditControlsPanelWidthProvider>
      <div className={uiStyles.editChartPage}>
        <div className={uiStyles.editChartPreviewColumn}>
          <EditChartPageHeader onBack={props.onBack} title={props.title} />
          <div className={previewClassName}>{props.preview}</div>
        </div>
        <ResizableEditControlsPanel>
          <div className={uiStyles.editChartControls}>{props.controls}</div>
          <div className={uiStyles.editChartActions}>{props.actions}</div>
        </ResizableEditControlsPanel>
      </div>
    </EditControlsPanelWidthProvider>
  );
}
