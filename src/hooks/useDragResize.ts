import { useCallback, useRef } from "preact/hooks";
import { clampRounded } from "../utils/clamp";

export type DragResizeAxis = "x" | "y";

export interface UseDragResizeOptions {
  axis: DragResizeAxis;
  invert?: boolean;
  max: number;
  min: number;
  onChange: (value: number) => void;
  value: number;
}

export interface DragResizePointerHandlers {
  onPointerCancel: (event: PointerEvent) => void;
  onPointerDown: (event: PointerEvent) => void;
  onPointerMove: (event: PointerEvent) => void;
  onPointerUp: (event: PointerEvent) => void;
}

export function useDragResize(
  options: UseDragResizeOptions,
): DragResizePointerHandlers {
  const dragStateRef = useRef<{
    startPointer: number;
    startValue: number;
  } | null>(null);

  const endDrag = useCallback(function endDrag() {
    dragStateRef.current = null;
  }, []);

  const onPointerDown = useCallback(
    function onPointerDown(event: PointerEvent) {
      dragStateRef.current = {
        startPointer: options.axis === "x" ? event.clientX : event.clientY,
        startValue: options.value,
      };
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    },
    [options.axis, options.value],
  );

  const onPointerMove = useCallback(
    function onPointerMove(event: PointerEvent) {
      if (dragStateRef.current === null) {
        return;
      }
      const currentPointer =
        options.axis === "x" ? event.clientX : event.clientY;
      const delta = options.invert
        ? dragStateRef.current.startPointer - currentPointer
        : currentPointer - dragStateRef.current.startPointer;
      options.onChange(
        clampRounded(
          dragStateRef.current.startValue + delta,
          options.min,
          options.max,
        ),
      );
    },
    [options.axis, options.invert, options.max, options.min, options.onChange],
  );

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  };
}
