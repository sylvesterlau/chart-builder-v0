import { ds } from "../config";
import type { ColorToken } from "../types";

/** Cycle through `ds.colors.dataVis.general` by row index. */
export function dataVisAt(index: number): ColorToken {
  const palette = ds.colors.dataVis.general;
  return palette[index % palette.length];
}
