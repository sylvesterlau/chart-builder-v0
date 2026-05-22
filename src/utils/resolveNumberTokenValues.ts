import { collectConfigNumberTokenKeys } from "./numberTokenDisplay";
import {
  figmaVariableDisplayName,
  resolveFloatVariableValue,
} from "./resolveVariableValues";

export type NumberTokenValueMap = Record<string, number>;
export type NumberTokenNameMap = Record<string, string>;

export interface NumberTokenResolvedPayload {
  values: NumberTokenValueMap;
  names: NumberTokenNameMap;
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
      const value = await resolveFloatVariableValue(variable);
      if (value !== null) {
        values[key] = value;
      }
    } catch {
      // Library variable unavailable — UI falls back to config value.
    }
  }

  return { values, names };
}
