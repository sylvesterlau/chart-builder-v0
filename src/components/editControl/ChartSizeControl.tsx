import {
  RangeSlider,
  Stack,
  Text,
  TextboxNumeric,
  VerticalSpace,
} from "@create-figma-plugin/ui";
import { h } from "preact";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import styles from "../../ui.css";

export interface ChartSizeBounds {
  min: number;
  max: number;
}

export interface ChartSizeControlConfig {
  chartSizeRangeLabel: string;
  clampChartSizeToMaxOnFrameWidthChange?: boolean;
  defaultChartSize: number;
  defaultFrameWidth: number;
  frameWidthMax: number;
  frameWidthMin: number;
  getChartSizeBounds: (frameWidth: number) => ChartSizeBounds;
}

interface ChartWidthSliderProps {
  maximum: number;
  minimum: number;
  onNumericValueInput: (value: number | null) => void;
  onSliderInput: (event: Event) => void;
  sliderValue: string;
  value: string;
}

function validateFrameWidth(
  value: number,
  frameWidthMin: number,
  frameWidthMax: number,
) {
  return (
    Number.isFinite(value) && value >= frameWidthMin && value <= frameWidthMax
  );
}

function validateChartSize(
  value: number,
  frameWidth: number,
  getChartSizeBounds: (frameWidth: number) => ChartSizeBounds,
) {
  const { min, max } = getChartSizeBounds(frameWidth);
  return Number.isFinite(value) && value >= min && value <= max;
}

function ChartWidthSlider({
  maximum,
  minimum,
  onNumericValueInput,
  onSliderInput,
  sliderValue,
  value,
}: ChartWidthSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderKey, setSliderKey] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let lastWidth = 0;
    let frameId = 0;

    const refreshSlider = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const width = container.offsetWidth;
        if (width <= 0 || width === lastWidth) {
          return;
        }
        lastWidth = width;
        setSliderKey((current) => current + 1);
      });
    };

    refreshSlider();
    const observer = new ResizeObserver(refreshSlider);
    observer.observe(container);

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [maximum, minimum]);

  return (
    <div ref={containerRef} className={styles.chartWidthControl}>
      <RangeSlider
        key={sliderKey}
        maximum={maximum}
        minimum={minimum}
        onInput={onSliderInput}
        value={sliderValue}
      />
      <VerticalSpace space="small" />
      <TextboxNumeric
        onNumericValueInput={onNumericValueInput}
        value={value}
      />
    </div>
  );
}

export function useChartSizeControl(config: ChartSizeControlConfig) {
  const {
    chartSizeRangeLabel,
    clampChartSizeToMaxOnFrameWidthChange = false,
    defaultChartSize,
    defaultFrameWidth,
    frameWidthMax,
    frameWidthMin,
    getChartSizeBounds,
  } = config;

  const [frameWidth, setFrameWidth] = useState<number>(defaultFrameWidth);
  const [frameWidthInput, setFrameWidthInput] = useState<string>(
    String(defaultFrameWidth),
  );
  const [chartSize, setChartSize] = useState<number>(defaultChartSize);
  const [chartSizeInput, setChartSizeInput] = useState<string>(
    String(defaultChartSize),
  );

  const isFrameWidthValid = validateFrameWidth(
    Number(frameWidthInput),
    frameWidthMin,
    frameWidthMax,
  );
  const chartSizeBounds = getChartSizeBounds(frameWidth);
  const isChartSizeValid = validateChartSize(
    Number(chartSizeInput),
    frameWidth,
    getChartSizeBounds,
  );
  const chartSizeSliderValue = isChartSizeValid
    ? chartSizeInput
    : String(chartSize);

  useEffect(() => {
    if (!clampChartSizeToMaxOnFrameWidthChange) {
      return;
    }

    const { max } = getChartSizeBounds(frameWidth);
    setChartSize((current) => (current <= max ? current : max));
    setChartSizeInput((current) => {
      const numeric = Number(current);
      if (Number.isFinite(numeric) && numeric > max) {
        return String(max);
      }
      return current;
    });
  }, [clampChartSizeToMaxOnFrameWidthChange, frameWidth, getChartSizeBounds]);

  const handleFrameWidthInput = useCallback(
    function (value: number | null) {
      if (value === null) {
        setFrameWidthInput("");
        return;
      }
      const nextInput = String(value);
      setFrameWidthInput(nextInput);
      if (validateFrameWidth(value, frameWidthMin, frameWidthMax)) {
        setFrameWidth(Math.round(value));
      }
    },
    [frameWidthMax, frameWidthMin],
  );

  const handleChartSizeSliderInput = useCallback(
    function (event: Event) {
      const nextInput = (event.currentTarget as HTMLInputElement).value;
      setChartSizeInput(nextInput);
      const numericValue = Number(nextInput);
      if (validateChartSize(numericValue, frameWidth, getChartSizeBounds)) {
        setChartSize(Math.round(numericValue));
      }
    },
    [frameWidth, getChartSizeBounds],
  );

  const handleChartSizeNumericInput = useCallback(
    function (value: number | null) {
      if (value === null) {
        setChartSizeInput("");
        return;
      }
      const nextInput = String(value);
      setChartSizeInput(nextInput);
      if (validateChartSize(value, frameWidth, getChartSizeBounds)) {
        setChartSize(Math.round(value));
      }
    },
    [frameWidth, getChartSizeBounds],
  );

  return {
    chartSize,
    chartSizeBounds,
    chartSizeInput,
    chartSizeRangeLabel,
    chartSizeSliderValue,
    frameWidth,
    frameWidthInput,
    frameWidthMax,
    frameWidthMin,
    handleChartSizeNumericInput,
    handleChartSizeSliderInput,
    handleFrameWidthInput,
    isChartSizeValid,
    isFrameWidthValid,
  };
}

interface ChartSizeControlProps {
  chartSizeBounds: ChartSizeBounds;
  chartSizeInput: string;
  chartSizeRangeLabel: string;
  chartSizeSliderValue: string;
  frameWidthInput: string;
  frameWidthMax: number;
  frameWidthMin: number;
  isChartSizeValid: boolean;
  isFrameWidthValid: boolean;
  onChartSizeNumericInput: (value: number | null) => void;
  onChartSizeSliderInput: (event: Event) => void;
  onFrameWidthInput: (value: number | null) => void;
}

function ChartSizeControl({
  chartSizeBounds,
  chartSizeInput,
  chartSizeRangeLabel,
  chartSizeSliderValue,
  frameWidthInput,
  frameWidthMax,
  frameWidthMin,
  isChartSizeValid,
  isFrameWidthValid,
  onChartSizeNumericInput,
  onChartSizeSliderInput,
  onFrameWidthInput,
}: ChartSizeControlProps) {
  return (
    <Stack space="small">
      <Text className={styles.sectionTitle}>Size</Text>
      <div className={styles.fieldRow}>
        <Text className={styles.fieldLabel}>Frame width</Text>
        <TextboxNumeric
          onNumericValueInput={onFrameWidthInput}
          value={frameWidthInput}
        />
      </div>
      {!isFrameWidthValid ? (
        <div className={styles.fieldHintError}>
          Width must be between {frameWidthMin} and {frameWidthMax}.
        </div>
      ) : null}
      <div className={`${styles.fieldRow} ${styles.fieldRowAlignStart}`}>
        <Text className={styles.fieldLabel}>Chart width</Text>
        <ChartWidthSlider
          maximum={chartSizeBounds.max}
          minimum={chartSizeBounds.min}
          onNumericValueInput={onChartSizeNumericInput}
          onSliderInput={onChartSizeSliderInput}
          sliderValue={chartSizeSliderValue}
          value={chartSizeInput}
        />
      </div>
      {!isChartSizeValid ? (
        <div className={styles.fieldHintError}>
          Size must be between {chartSizeBounds.min} and {chartSizeBounds.max}{" "}
          ({chartSizeRangeLabel}).
        </div>
      ) : null}
    </Stack>
  );
}

export default ChartSizeControl;
