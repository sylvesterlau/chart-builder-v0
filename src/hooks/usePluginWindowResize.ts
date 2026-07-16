import { useCallback, useEffect, useLayoutEffect, useRef } from "preact/hooks";
import { attachPointerDrag } from "../utils/attachPointerDrag";
import { clampRounded } from "../utils/clamp";
import type { PluginWindowSize } from "../utils/pluginUiSize";

type ResizeBehaviorOnDoubleClick = "minimize" | "maximize";
type ResizeDirection = "both" | "horizontal" | "vertical";

const mapResizeDirectionToStyles: Record<
  ResizeDirection,
  { cursor: string; height: string; width: string }
> = {
  both: {
    cursor: "nwse-resize",
    height: "12px",
    width: "12px",
  },
  horizontal: {
    cursor: "ew-resize",
    height: "100%",
    width: "8px",
  },
  vertical: {
    cursor: "ns-resize",
    height: "8px",
    width: "100%",
  },
};

function readWindowSize(): PluginWindowSize {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

export function usePluginWindowResize(
  onWindowResize: (size: PluginWindowSize) => void,
  options: {
    maxHeight: number;
    maxWidth: number;
    minHeight: number;
    minWidth: number;
    resizeBehaviorOnDoubleClick?: ResizeBehaviorOnDoubleClick;
    resizeDirection?: ResizeDirection;
  },
): void {
  const {
    maxHeight,
    maxWidth,
    minHeight,
    minWidth,
    resizeBehaviorOnDoubleClick = null,
    resizeDirection = "both",
  } = options;

  const initialSizeRef = useRef(readWindowSize());
  const windowSizeRef = useRef(readWindowSize());

  useLayoutEffect(function syncWindowSizeRef() {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(function () {
      raf2 = requestAnimationFrame(function () {
        const currentSize = readWindowSize();
        windowSizeRef.current = currentSize;
        initialSizeRef.current = currentSize;
      });
    });
    return function cancelSyncWindowSizeRef() {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [minHeight, minWidth]);

  const setWindowSize = useCallback(
    function setWindowSize(size: Partial<PluginWindowSize>) {
      if (typeof size.width === "undefined" && typeof size.height === "undefined") {
        return;
      }
      if (typeof size.width !== "undefined") {
        windowSizeRef.current.width = clampRounded(
          size.width,
          minWidth,
          maxWidth,
        );
      }
      if (typeof size.height !== "undefined") {
        windowSizeRef.current.height = clampRounded(
          size.height,
          minHeight,
          maxHeight,
        );
      }
      onWindowResize({ ...windowSizeRef.current });
    },
    [maxHeight, maxWidth, minHeight, minWidth, onWindowResize],
  );

  const toggleWindowSize = useCallback(
    function toggleWindowSize(direction: ResizeDirection) {
      const initialSize = initialSizeRef.current;
      if (direction === "horizontal") {
        windowSizeRef.current.width =
          windowSizeRef.current.width === initialSize.width
            ? resizeBehaviorOnDoubleClick === "minimize"
              ? minWidth
              : maxWidth
            : initialSize.width;
        onWindowResize({ ...windowSizeRef.current });
        return;
      }
      if (direction === "vertical") {
        windowSizeRef.current.height =
          windowSizeRef.current.height === initialSize.height
            ? resizeBehaviorOnDoubleClick === "minimize"
              ? minHeight
              : maxHeight
            : initialSize.height;
        onWindowResize({ ...windowSizeRef.current });
        return;
      }
      const isInitialSize =
        windowSizeRef.current.width === initialSize.width &&
        windowSizeRef.current.height === initialSize.height;
      if (isInitialSize) {
        windowSizeRef.current.width =
          resizeBehaviorOnDoubleClick === "minimize" ? minWidth : maxWidth;
        windowSizeRef.current.height =
          resizeBehaviorOnDoubleClick === "minimize" ? minHeight : maxHeight;
      } else {
        windowSizeRef.current.width = initialSize.width;
        windowSizeRef.current.height = initialSize.height;
      }
      onWindowResize({ ...windowSizeRef.current });
    },
    [
      maxHeight,
      maxWidth,
      minHeight,
      minWidth,
      onWindowResize,
      resizeBehaviorOnDoubleClick,
    ],
  );

  useEffect(
    function mountResizeHandles() {
      const removeResizeHandleElements: Array<() => void> = [];
      const handleOptions = {
        resizeDirection,
        setWindowSize,
        toggleWindowSize:
          resizeBehaviorOnDoubleClick === null ? null : toggleWindowSize,
      };

      if (resizeDirection === "both") {
        removeResizeHandleElements.push(
          createResizeHandleElement({
            ...handleOptions,
            resizeDirection: "horizontal",
          }),
        );
        removeResizeHandleElements.push(
          createResizeHandleElement({
            ...handleOptions,
            resizeDirection: "vertical",
          }),
        );
      }
      removeResizeHandleElements.push(createResizeHandleElement(handleOptions));

      return function cleanupResizeHandles() {
        for (const removeResizeHandleElement of removeResizeHandleElements) {
          removeResizeHandleElement();
        }
      };
    },
    [
      maxHeight,
      maxWidth,
      minHeight,
      minWidth,
      resizeBehaviorOnDoubleClick,
      resizeDirection,
      setWindowSize,
      toggleWindowSize,
    ],
  );
}

function createResizeHandleElement(options: {
  resizeDirection: ResizeDirection;
  setWindowSize: (size: Partial<PluginWindowSize>) => void;
  toggleWindowSize: ((direction: ResizeDirection) => void) | null;
}): () => void {
  const { resizeDirection, setWindowSize, toggleWindowSize } = options;
  const resizeHandleElement = document.createElement("div");
  document.body.append(resizeHandleElement);
  const { cursor, height, width } = mapResizeDirectionToStyles[resizeDirection];
  resizeHandleElement.style.cssText = `cursor: ${cursor}; position: fixed; z-index: var(--z-index-2); bottom: 0; right: 0; width: ${width}; height: ${height};`;

  const detachPointerDrag = attachPointerDrag(resizeHandleElement, {
    onPointerDown: function onPointerDown(event) {
      return {
        offsetX: event.offsetX,
        offsetY: event.offsetY,
      };
    },
    onPointerMove: function onPointerMove(event, state) {
      const nextWidth =
        resizeDirection === "both" || resizeDirection === "horizontal"
          ? Math.round(
              event.clientX +
                (resizeHandleElement.offsetWidth - state.offsetX),
            )
          : undefined;
      const nextHeight =
        resizeDirection === "both" || resizeDirection === "vertical"
          ? Math.round(
              event.clientY +
                (resizeHandleElement.offsetHeight - state.offsetY),
            )
          : undefined;
      setWindowSize({ height: nextHeight, width: nextWidth });
    },
  });

  if (toggleWindowSize !== null) {
    const handleDoubleClick = function handleDoubleClick() {
      toggleWindowSize(resizeDirection);
    };
    resizeHandleElement.addEventListener("dblclick", handleDoubleClick);
  }

  return function removeResizeHandleElement() {
    detachPointerDrag();
    resizeHandleElement.remove();
  };
}
