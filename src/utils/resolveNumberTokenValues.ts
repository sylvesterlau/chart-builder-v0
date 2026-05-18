import { dotToSlash } from "../helpers";
import { collectConfigNumberTokenKeys } from "./numberTokenDisplay";

export type NumberTokenValueMap = Record<string, number>;
export type NumberTokenNameMap = Record<string, string>;

export interface NumberTokenResolvedPayload {
  values: NumberTokenValueMap;
  names: NumberTokenNameMap;
}

function variableIdToImportKey(id: string): string | null {
  const match = id.match(/VariableID:([a-f0-9]{40})/i);
  return match ? match[1] : null;
}

function figmaVariableDisplayName(variable: Variable): string {
  const raw = variable.name?.trim() ?? "";
  return raw ? dotToSlash(raw) : "";
}

async function resolveFloatVariable(variable: Variable): Promise<number | null> {
  const modeId = Object.keys(variable.valuesByMode)[0];
  if (!modeId) {
    return null;
  }

  let current: Variable | null = variable;
  for (let depth = 0; depth < 12 && current; depth += 1) {
    const raw = current.valuesByMode[modeId];
    if (raw === undefined || raw === null) {
      return null;
    }
    if (typeof raw === "number") {
      return raw;
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
        if (current.resolvedType !== "FLOAT") {
          return null;
        }
      } catch {
        return null;
      }
      continue;
    }
    return null;
  }
  return null;
}

/** Resolve config number tokens via library import (main thread only). */
export async function resolveNumberTokenPayload(): Promise<NumberTokenResolvedPayload> {
  const keys = collectConfigNumberTokenKeys();
  const values: NumberTokenValueMap = {};
  const names: NumberTokenNameMap = {};

  for (const key of keys) {
    try {
      const variable = await figma.variables.importVariableByKeyAsync(key);
      if (variable.resolvedType !== "FLOAT") {
        continue;
      }
      const displayName = figmaVariableDisplayName(variable);
      if (displayName) {
        names[key] = displayName;
      }
      const value = await resolveFloatVariable(variable);
      if (value !== null) {
        values[key] = value;
      }
    } catch {
      // Library variable unavailable — UI falls back to config value.
    }
  }

  return { values, names };
}
