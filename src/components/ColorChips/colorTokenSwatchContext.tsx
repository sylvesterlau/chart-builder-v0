import { emit, on } from "@create-figma-plugin/utilities";
import { createContext, h } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import type { ComponentChildren } from "preact";

const ColorTokenSwatchContext = createContext<Readonly<Record<string, string>>>(
  {},
);

export function ColorTokenSwatchProvider(props: { children: ComponentChildren }) {
  const [swatches, setSwatches] = useState<Readonly<Record<string, string>>>({});

  useEffect(function subscribeColorTokenSwatches() {
    const handler = function handleColorTokenSwatchValues(
      values: Record<string, string>,
    ) {
      setSwatches(values);
    };
    on("COLOR_TOKEN_SWATCH_VALUES", handler);
    emit("REQUEST_COLOR_TOKEN_SWATCH_VALUES");
  }, []);

  return (
    <ColorTokenSwatchContext.Provider value={swatches}>
      {props.children}
    </ColorTokenSwatchContext.Provider>
  );
}

export function useColorTokenSwatches(): Readonly<Record<string, string>> {
  return useContext(ColorTokenSwatchContext);
}
