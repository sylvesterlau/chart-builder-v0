import type { NumberToken } from "../types";

export type LayoutNumberField =
  | "paddingLeft"
  | "paddingRight"
  | "paddingTop"
  | "paddingBottom"
  | "itemSpacing";

type LayoutBindableNode = FrameNode | ComponentNode | InstanceNode;

/** Non-empty variable import key, or null when binding should be skipped. */
export function numberTokenVariableKey(token: NumberToken): string | null {
  const key = token.key?.trim();
  return key ? key : null;
}

/** Fallback numeric value from config. */
export function numberTokenValue(token: NumberToken): number {
  return token.value;
}

async function importFloatVariable(key: string): Promise<Variable | null> {
  try {
    const variable = await figma.variables.importVariableByKeyAsync(key);
    if (variable.resolvedType === "FLOAT") {
      return variable;
    }
  } catch {
    // Missing library variable — keep literal fallback.
  }
  return null;
}

async function applyNumberTokenToField(
  node: LayoutBindableNode,
  field: LayoutNumberField,
  token: NumberToken,
): Promise<void> {
  node[field] = token.value;
  const key = numberTokenVariableKey(token);
  if (!key) {
    return;
  }
  const variable = await importFloatVariable(key);
  if (!variable) {
    return;
  }
  try {
    node.setBoundVariable(field, variable);
  } catch (err) {
    console.error("applyNumberTokenToField: setBoundVariable failed", field, err);
  }
}

/** Bind horizontal padding (left + right) on a layout frame. */
export async function applyHorizontalPadding(
  node: LayoutBindableNode,
  token: NumberToken,
): Promise<void> {
  await applyNumberTokenToField(node, "paddingLeft", token);
  await applyNumberTokenToField(node, "paddingRight", token);
}

/** Bind vertical padding (top + bottom) on a layout frame. */
export async function applyVerticalPadding(
  node: LayoutBindableNode,
  token: NumberToken,
): Promise<void> {
  await applyNumberTokenToField(node, "paddingTop", token);
  await applyNumberTokenToField(node, "paddingBottom", token);
}

/** Bind auto-layout item spacing on a layout frame. */
export async function applyItemSpacing(
  node: LayoutBindableNode,
  token: NumberToken,
): Promise<void> {
  await applyNumberTokenToField(node, "itemSpacing", token);
}

export async function applyChartTitlePadding(
  node: LayoutBindableNode,
  padding: { horizontal: NumberToken; vertical: NumberToken },
): Promise<void> {
  await applyHorizontalPadding(node, padding.horizontal);
  await applyVerticalPadding(node, padding.vertical);
}

export async function applyLegendSpacing(
  node: LayoutBindableNode,
  spacing: {
    horizontalPadding: NumberToken;
    verticalPadding: NumberToken;
    gap: NumberToken;
  },
): Promise<void> {
  await applyHorizontalPadding(node, spacing.horizontalPadding);
  await applyVerticalPadding(node, spacing.verticalPadding);
  await applyItemSpacing(node, spacing.gap);
}
