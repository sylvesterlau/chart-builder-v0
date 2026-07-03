import { emit, on } from "@create-figma-plugin/utilities";
import { h } from "preact";
import { useCallback, useEffect, useLayoutEffect, useState } from "preact/hooks";
import { usePluginWindowResize } from "./usePluginWindowResize";
import {
  clampPluginWindowSize,
  getPageResizeBounds,
  isResizablePluginPage,
  resolvePluginWindowSizeForPage,
  type PluginPageId,
  type PluginWindowSize,
} from "../utils/pluginUiSize";

interface PluginWindowResizeManagerProps {
  onUserResize: (size: PluginWindowSize) => void;
  page: PluginPageId;
}

export function PluginWindowResizeManager(props: PluginWindowResizeManagerProps) {
  const bounds = getPageResizeBounds(props.page);

  usePluginWindowResize(props.onUserResize, {
    minWidth: bounds.minWidth,
    minHeight: bounds.minHeight,
    maxWidth: bounds.maxWidth,
    maxHeight: bounds.maxHeight,
    resizeBehaviorOnDoubleClick: "minimize",
  });

  return null;
}

export function usePluginWindowSize(page: PluginPageId) {
  const [savedUserSize, setSavedUserSize] = useState<PluginWindowSize | null>(
    null,
  );
  const [sessionUserSize, setSessionUserSize] =
    useState<PluginWindowSize | null>(null);

  useEffect(function subscribePluginUiUserSize() {
    const handler = function handlePluginUiUserSize(
      size: PluginWindowSize | null,
    ) {
      setSavedUserSize(size);
    };
    on("PLUGIN_UI_USER_SIZE", handler);
    emit("REQUEST_PLUGIN_UI_USER_SIZE");
  }, []);

  useLayoutEffect(
    function applyPluginWindowSizeForPage() {
      const preferredSize = sessionUserSize ?? savedUserSize;
      const target = resolvePluginWindowSizeForPage(page, preferredSize);
      emit("RESIZE_PLUGIN_UI_WINDOW", target);
    },
    [page, savedUserSize],
  );

  const handleUserResize = useCallback(function handleUserResize(
    size: PluginWindowSize,
  ) {
    const bounds = getPageResizeBounds(page);
    const clamped = clampPluginWindowSize(size, bounds);
    setSessionUserSize(clamped);
    emit("RESIZE_PLUGIN_UI_WINDOW", { ...clamped, persist: true });
  }, [page]);

  return {
    handleUserResize,
    isWindowResizable: isResizablePluginPage(page),
  };
}
