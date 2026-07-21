import { pluginUISize } from "../config";
import { clamp } from "./clamp";

export type PluginPageId =
  | "home"
  | "horizontalBar"
  | "pieDonutChart"
  | "semiDonutChart"
  | "verticalBar"
  | "lineChart"
  | "designSystemConfig";

export type PluginWindowSize = {
  width: number;
  height: number;
};

export type PluginWindowResizeBounds = PluginWindowSize & {
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
};

export type ResizePluginUiWindowPayload = PluginWindowSize & {
  persist?: boolean;
};

export const PLUGIN_UI_USER_SIZE_STORAGE_KEY = "pluginUIUserSize";

export function isResizablePluginPage(page: PluginPageId): boolean {
  return page !== "home";
}

export function getPageResizeBounds(page: PluginPageId): PluginWindowResizeBounds {
  switch (page) {
    case "home":
      return {
        width: pluginUISize.homePage.width,
        height: pluginUISize.homePage.height,
        minWidth: pluginUISize.homePage.width,
        minHeight: pluginUISize.homePage.height,
        maxWidth: pluginUISize.homePage.width,
        maxHeight: pluginUISize.homePage.height,
      };
    case "designSystemConfig":
      return pluginUISize.designSystemPage;
    default:
      return pluginUISize.editPage;
  }
}

export function getPagePreset(page: PluginPageId): PluginWindowSize {
  const bounds = getPageResizeBounds(page);
  return { width: bounds.width, height: bounds.height };
}

export function clampPluginWindowSize(
  size: PluginWindowSize,
  bounds: PluginWindowResizeBounds,
): PluginWindowSize {
  return {
    width: clamp(size.width, bounds.minWidth, bounds.maxWidth),
    height: clamp(size.height, bounds.minHeight, bounds.maxHeight),
  };
}

export function resolvePluginWindowSizeForPage(
  page: PluginPageId,
  userSize: PluginWindowSize | null,
): PluginWindowSize {
  if (page === "home") {
    return getPagePreset(page);
  }
  const bounds = getPageResizeBounds(page);
  return clampPluginWindowSize(userSize ?? bounds, bounds);
}
