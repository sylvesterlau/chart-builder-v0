export function attachPointerDrag<TState>(
  element: HTMLElement,
  options: {
    onPointerDown: (event: PointerEvent) => TState | null;
    onPointerMove: (event: PointerEvent, state: TState) => void;
    onPointerEnd?: () => void;
  },
): () => void {
  let session: TState | null = null;

  function handlePointerDown(event: PointerEvent) {
    session = options.onPointerDown(event);
    if (session === null) {
      return;
    }
    element.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent) {
    if (session === null) {
      return;
    }
    options.onPointerMove(event, session);
  }

  function handlePointerEnd(event: PointerEvent) {
    if (session === null) {
      return;
    }
    session = null;
    element.releasePointerCapture(event.pointerId);
    options.onPointerEnd?.();
  }

  element.addEventListener("pointerdown", handlePointerDown);
  element.addEventListener("pointermove", handlePointerMove);
  element.addEventListener("pointerup", handlePointerEnd);
  element.addEventListener("pointercancel", handlePointerEnd);

  return function detachPointerDrag() {
    element.removeEventListener("pointerdown", handlePointerDown);
    element.removeEventListener("pointermove", handlePointerMove);
    element.removeEventListener("pointerup", handlePointerEnd);
    element.removeEventListener("pointercancel", handlePointerEnd);
  };
}
