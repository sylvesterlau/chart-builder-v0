import { emit, on } from "@create-figma-plugin/utilities";
import { createContext, h } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import type { ComponentChildren } from "preact";
import type { NumberTokenResolvedPayload } from "../../utils/resolveNumberTokenValues";

const EMPTY_PAYLOAD: NumberTokenResolvedPayload = { values: {}, names: {} };

const NumberTokenResolvedContext =
  createContext<NumberTokenResolvedPayload>(EMPTY_PAYLOAD);

export function NumberTokenValueProvider(props: {
  children: ComponentChildren;
}) {
  const [resolved, setResolved] =
    useState<NumberTokenResolvedPayload>(EMPTY_PAYLOAD);

  useEffect(function subscribeNumberTokenResolved() {
    const handler = function handleNumberTokenResolvedValues(
      payload: NumberTokenResolvedPayload,
    ) {
      setResolved(payload);
    };
    on("NUMBER_TOKEN_RESOLVED_VALUES", handler);
    emit("REQUEST_NUMBER_TOKEN_RESOLVED_VALUES");
  }, []);

  return (
    <NumberTokenResolvedContext.Provider value={resolved}>
      {props.children}
    </NumberTokenResolvedContext.Provider>
  );
}

export function useNumberTokenResolved(): NumberTokenResolvedPayload {
  return useContext(NumberTokenResolvedContext);
}

/** @deprecated Prefer `useNumberTokenResolved().values` */
export function useNumberTokenValues(): Readonly<Record<string, number>> {
  return useNumberTokenResolved().values;
}
