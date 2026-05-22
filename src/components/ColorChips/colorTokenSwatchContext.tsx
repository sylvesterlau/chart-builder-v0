import { emit, on } from "@create-figma-plugin/utilities";
import { createContext, h } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import type { ComponentChildren } from "preact";
import type { ColorTokenResolvedPayload } from "../../utils/resolveColorTokenSwatches";

const EMPTY_PAYLOAD: ColorTokenResolvedPayload = { values: {}, names: {} };

const ColorTokenResolvedContext =
  createContext<ColorTokenResolvedPayload>(EMPTY_PAYLOAD);

export function ColorTokenSwatchProvider(props: {
  children: ComponentChildren;
}) {
  const [resolved, setResolved] =
    useState<ColorTokenResolvedPayload>(EMPTY_PAYLOAD);

  useEffect(function subscribeColorTokenResolved() {
    const handler = function handleColorTokenResolvedValues(
      payload: ColorTokenResolvedPayload,
    ) {
      setResolved(payload);
    };
    on("COLOR_TOKEN_SWATCH_VALUES", handler);
    emit("REQUEST_COLOR_TOKEN_SWATCH_VALUES");
  }, []);

  return (
    <ColorTokenResolvedContext.Provider value={resolved}>
      {props.children}
    </ColorTokenResolvedContext.Provider>
  );
}

export function useColorTokenResolved(): ColorTokenResolvedPayload {
  return useContext(ColorTokenResolvedContext);
}

/** @deprecated Prefer `useColorTokenResolved().values` */
export function useColorTokenSwatches(): Readonly<Record<string, string>> {
  return useColorTokenResolved().values;
}
