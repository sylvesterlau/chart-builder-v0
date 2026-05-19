import { collectConfigColorTokenKeys } from "./colorTokenDisplay";
import {
  figmaVariableDisplayName,
  resolveColorVariableValue,
} from "./resolveVariableValues";

export type ColorTokenSwatchMap = Record<string, string>;
export type ColorTokenNameMap = Record<string, string>;

export interface ColorTokenResolvedPayload {
  values: ColorTokenSwatchMap;
  names: ColorTokenNameMap;
}

function rgbaToHex(color: RGBA): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/** Resolve config color tokens via library import (main thread only). */
export async function resolveColorTokenPayload(): Promise<ColorTokenResolvedPayload> {
  const keys = collectConfigColorTokenKeys();
  const values: ColorTokenSwatchMap = {};
  const names: ColorTokenNameMap = {};

  for (const key of keys) {
    try {
      const variable = await figma.variables.importVariableByKeyAsync(key);
      if (variable.resolvedType !== "COLOR") {
        continue;
      }
      const displayName = figmaVariableDisplayName(variable);
      if (displayName) {
        names[key] = displayName;
      }
      const rgba = await resolveColorVariableValue(variable);
      if (rgba) {
        values[key] = rgbaToHex(rgba);
      }
    } catch {
      // Library variable unavailable — chip falls back to config value.
    }
  }

  return { values, names };
}
