import { emit } from "@create-figma-plugin/utilities";
import { useEffect } from "preact/hooks";

/** Ask main thread to re-resolve design tokens (mode-aware). */
export function requestDesignTokenRefresh() {
  emit("REQUEST_COLOR_TOKEN_SWATCH_VALUES");
  emit("REQUEST_NUMBER_TOKEN_RESOLVED_VALUES");
  emit("REQUEST_TYPOGRAPHY_TOKEN_RESOLVED_VALUES");
}

/** Refresh tokens when a chart edit page mounts (picks up current variable mode). */
export function useRefreshDesignTokensOnMount() {
  useEffect(function refreshDesignTokensOnMount() {
    requestDesignTokenRefresh();
  }, []);
}
