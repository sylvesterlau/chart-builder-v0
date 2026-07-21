import { editControlsPanelWidth } from "../config";
import { clampRounded } from "./clamp";

export const EDIT_CONTROLS_PANEL_WIDTH_STORAGE_KEY = "editControlsPanelWidth";

export type SetEditControlsPanelWidthPayload = {
  persist?: boolean;
  width: number;
};

export function clampEditControlsPanelWidth(width: number): number {
  return clampRounded(
    width,
    editControlsPanelWidth.minWidth,
    editControlsPanelWidth.maxWidth,
  );
}
