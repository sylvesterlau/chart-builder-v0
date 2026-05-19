import { dotToSlash } from "../helpers";

export function variableIdToImportKey(id: string): string | null {
  const match = id.match(/VariableID:([a-f0-9]{40})/i);
  return match ? match[1] : null;
}

export function figmaVariableDisplayName(variable: Variable): string {
  const raw = variable.name?.trim() ?? "";
  return raw ? dotToSlash(raw) : "";
}

/** Active mode: selection ancestors → current page → collection default. */
export function resolveActiveModeIdForCollection(
  collection: VariableCollection,
): string {
  const collectionId = collection.id;
  const selection = figma.currentPage.selection[0];

  if (selection) {
    let node: BaseNode | null = selection;
    while (node && "type" in node) {
      const scene = node as SceneNode;
      if (
        "explicitVariableModes" in scene &&
        scene.explicitVariableModes[collectionId]
      ) {
        return scene.explicitVariableModes[collectionId];
      }
      node = node.parent;
    }
  }

  const pageMode = figma.currentPage.explicitVariableModes[collectionId];
  if (pageMode) {
    return pageMode;
  }

  return collection.defaultModeId;
}

export async function getVariableByIdOrImport(
  id: string,
): Promise<Variable | null> {
  try {
    return await figma.variables.getVariableByIdAsync(id);
  } catch {
    const importKey = variableIdToImportKey(id);
    if (!importKey) {
      return null;
    }
    try {
      return await figma.variables.importVariableByKeyAsync(importKey);
    } catch {
      return null;
    }
  }
}

async function getCollectionForVariable(
  variable: Variable,
): Promise<VariableCollection | null> {
  try {
    return await figma.variables.getVariableCollectionByIdAsync(
      variable.variableCollectionId,
    );
  } catch {
    return null;
  }
}

export async function resolveModeIdForVariable(
  variable: Variable,
): Promise<string | null> {
  const collection = await getCollectionForVariable(variable);
  if (!collection) {
    return Object.keys(variable.valuesByMode)[0] ?? null;
  }
  return resolveActiveModeIdForCollection(collection);
}

function isVariableAlias(raw: unknown): raw is VariableAlias {
  return (
    typeof raw === "object" &&
    raw !== null &&
    "type" in raw &&
    (raw as VariableAlias).type === "VARIABLE_ALIAS"
  );
}

/** Resolve a COLOR variable for the active mode (follows aliases). */
export async function resolveColorVariableValue(
  variable: Variable,
): Promise<RGBA | null> {
  let current: Variable | null = variable;

  for (let depth = 0; depth < 12 && current; depth += 1) {
    const modeId = await resolveModeIdForVariable(current);
    if (!modeId) {
      return null;
    }

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

    if (isVariableAlias(raw)) {
      current = await getVariableByIdOrImport(raw.id);
      if (!current || current.resolvedType !== "COLOR") {
        return null;
      }
      continue;
    }

    return null;
  }

  return null;
}

/** Resolve a FLOAT variable for the active mode (follows aliases). */
export async function resolveFloatVariableValue(
  variable: Variable,
): Promise<number | null> {
  let current: Variable | null = variable;

  for (let depth = 0; depth < 12 && current; depth += 1) {
    const modeId = await resolveModeIdForVariable(current);
    if (!modeId) {
      return null;
    }

    const raw = current.valuesByMode[modeId];
    if (raw === undefined || raw === null) {
      return null;
    }

    if (typeof raw === "number") {
      return raw;
    }

    if (isVariableAlias(raw)) {
      current = await getVariableByIdOrImport(raw.id);
      if (!current || current.resolvedType !== "FLOAT") {
        return null;
      }
      continue;
    }

    return null;
  }

  return null;
}

/** Resolve a STRING variable for the active mode (follows aliases). */
export async function resolveStringVariableValue(
  variable: Variable,
): Promise<string | null> {
  let current: Variable | null = variable;

  for (let depth = 0; depth < 12 && current; depth += 1) {
    const modeId = await resolveModeIdForVariable(current);
    if (!modeId) {
      return null;
    }

    const raw = current.valuesByMode[modeId];
    if (typeof raw !== "string") {
      if (isVariableAlias(raw)) {
        current = await getVariableByIdOrImport(raw.id);
        if (!current || current.resolvedType !== "STRING") {
          return null;
        }
        continue;
      }
      return null;
    }

    const value = raw.trim();
    return value || null;
  }

  return null;
}
