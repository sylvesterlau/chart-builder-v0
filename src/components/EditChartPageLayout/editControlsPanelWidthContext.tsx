import { emit, on } from "@create-figma-plugin/utilities";
import { editControlsPanelWidth } from "../../config";
import { createContext, h } from "preact";
import { useCallback, useContext, useEffect, useState } from "preact/hooks";
import type { ComponentChildren } from "preact";
import { clampEditControlsPanelWidth } from "../../utils/editControlsPanelSize";

interface SetWidthOptions {
  persist?: boolean;
}

interface EditControlsPanelWidthContextValue {
  setWidth: (width: number, options?: SetWidthOptions) => void;
  width: number;
}

const EditControlsPanelWidthContext =
  createContext<EditControlsPanelWidthContextValue>({
    width: editControlsPanelWidth.width,
    setWidth: function () {
      /* default no-op */
    },
  });

export function EditControlsPanelWidthProvider(props: {
  children: ComponentChildren;
}) {
  const [width, setWidthState] = useState<number>(
    editControlsPanelWidth.width,
  );

  useEffect(function subscribeEditControlsPanelWidth() {
    const handler = function handleEditControlsPanelWidth(
      savedWidth: number | null,
    ) {
      if (savedWidth === null) {
        return;
      }
      setWidthState(clampEditControlsPanelWidth(savedWidth));
    };
    on("EDIT_CONTROLS_PANEL_WIDTH", handler);
    emit("REQUEST_EDIT_CONTROLS_PANEL_WIDTH");
  }, []);

  const setWidth = useCallback(function setWidth(
    nextWidth: number,
    options?: SetWidthOptions,
  ) {
    const clamped = clampEditControlsPanelWidth(nextWidth);
    setWidthState(clamped);
    if (options?.persist) {
      emit("SET_EDIT_CONTROLS_PANEL_WIDTH", {
        width: clamped,
        persist: true,
      });
    }
  }, []);

  return (
    <EditControlsPanelWidthContext.Provider value={{ width, setWidth }}>
      {props.children}
    </EditControlsPanelWidthContext.Provider>
  );
}

export function useEditControlsPanelWidth(): EditControlsPanelWidthContextValue {
  return useContext(EditControlsPanelWidthContext);
}
