import { collectConfigColorTokenKeys } from "./colorTokenDisplay";

export type ColorTokenSwatchMap = Record<string, string>;

function variableIdToImportKey(id: string): string | null {
  const match = id.match(/VariableID:([a-f0-9]{40})/i);
  return match ? match[1] : null;
}

function rgbaToHex(color: RGBA): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

async function resolveColorVariable(variable: Variable): Promise<RGBA | null> {
  const modeId = Object.keys(variable.valuesByMode)[0];
  if (!modeId) {
    return null;
  }

  let current: Variable | null = variable;
  for (let depth = 0; depth < 12 && current; depth += 1) {
    const raw = current.valuesByMode[modeId];
    if (!raw) {
      return null;
    }
    if (typeof raw === "object" && "r" in raw && typeof raw.r === "number") {
      const rgba = raw as RGBA;
      return {
        r: rgba.r,
        g: rgba.g,
        b: rgba.b,
        a: "a" in rgba && typeof rgba.a === "number" ? rgba.a : 1,
      };
    }
    if (
      typeof raw === "object" &&
      "type" in raw &&
      (raw as VariableAlias).type === "VARIABLE_ALIAS"
    ) {
      const importKey = variableIdToImportKey((raw as VariableAlias).id);
      if (!importKey) {
        return null;
      }
      try {
        current = await figma.variables.importVariableByKeyAsync(importKey);
      } catch {
        return null;
      }
      continue;
    }
    return null;
  }
  return null;
}

/** Resolve config variable keys to hex via `importVariableByKeyAsync` (main thread only). */
export async function resolveColorTokenSwatchMap(): Promise<ColorTokenSwatchMap> {
  const keys = collectConfigColorTokenKeys();
  const map: ColorTokenSwatchMap = {};

  for (const key of keys) {
    try {
      const variable = await figma.variables.importVariableByKeyAsync(key);
      if (variable.resolvedType !== "COLOR") {
        continue;
      }
      const rgba = await resolveColorVariable(variable);
      if (rgba) {
        map[key] = rgbaToHex(rgba);
      }
    } catch {
      // Library variable unavailable — chip falls back to config value.
    }
  }

  return map;
}
