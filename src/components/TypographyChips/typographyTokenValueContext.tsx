import { emit, on } from "@create-figma-plugin/utilities";
import { createContext, h } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import type { ComponentChildren } from "preact";
import type { TypographyTokenResolvedPayload } from "../../utils/resolveTypographyTokenValues";

const EMPTY_PAYLOAD: TypographyTokenResolvedPayload = { values: {}, names: {} };

const TypographyTokenResolvedContext =
  createContext<TypographyTokenResolvedPayload>(EMPTY_PAYLOAD);

export function TypographyTokenValueProvider(props: {
  children: ComponentChildren;
}) {
  const [resolved, setResolved] =
    useState<TypographyTokenResolvedPayload>(EMPTY_PAYLOAD);

  useEffect(function subscribeTypographyTokenResolved() {
    const handler = function handleTypographyTokenResolvedValues(
      payload: TypographyTokenResolvedPayload,
    ) {
      setResolved(payload);
    };
    on("TYPOGRAPHY_TOKEN_RESOLVED_VALUES", handler);
    emit("REQUEST_TYPOGRAPHY_TOKEN_RESOLVED_VALUES");
  }, []);

  return (
    <TypographyTokenResolvedContext.Provider value={resolved}>
      {props.children}
    </TypographyTokenResolvedContext.Provider>
  );
}

export function useTypographyTokenResolved(): TypographyTokenResolvedPayload {
  return useContext(TypographyTokenResolvedContext);
}
