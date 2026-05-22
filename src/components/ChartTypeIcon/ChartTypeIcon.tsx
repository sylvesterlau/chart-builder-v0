import { h } from "preact";
import { ds } from "../../config";
import styles from "./ChartTypeIcon.module.css";

export type ChartTypeIconVariant =
  | "pie"
  | "semiDonut"
  | "horizontalBar"
  | "verticalBar"
  | "line"
  | "designSystem";

interface ChartTypeIconProps {
  variant: ChartTypeIconVariant;
}

function paletteColor(index: number): string {
  return ds.colors.dataVis.general[index]?.value ?? "#888888";
}

function donutSlicePath(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startDeg: number,
  endDeg: number,
): string {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const x1 = cx + outerRadius * Math.cos(toRad(startDeg));
  const y1 = cy + outerRadius * Math.sin(toRad(startDeg));
  const x2 = cx + outerRadius * Math.cos(toRad(endDeg));
  const y2 = cy + outerRadius * Math.sin(toRad(endDeg));
  const x3 = cx + innerRadius * Math.cos(toRad(endDeg));
  const y3 = cy + innerRadius * Math.sin(toRad(endDeg));
  const x4 = cx + innerRadius * Math.cos(toRad(startDeg));
  const y4 = cy + innerRadius * Math.sin(toRad(startDeg));
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${x1} ${y1}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
    "Z",
  ].join(" ");
}

function PieIcon() {
  const colors = [0, 1, 2].map(paletteColor);
  const cx = 16;
  const cy = 16;
  const outerRadius = 12;
  const innerRadius = 6;
  const sliceCount = colors.length;
  const gapDeg = 8;
  const sliceSpan = (360 - sliceCount * gapDeg) / sliceCount;
  const startOffset = -90;

  return (
    <svg
      className={styles.svg}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {colors.map((color, index) => {
        const startDeg = startOffset + index * (sliceSpan + gapDeg);
        const endDeg = startDeg + sliceSpan;
        return (
          <path
            key={index}
            d={donutSlicePath(
              cx,
              cy,
              outerRadius,
              innerRadius,
              startDeg,
              endDeg,
            )}
            fill={color}
          />
        );
      })}
    </svg>
  );
}

function SemiDonutIcon() {
  const colors = [0, 1, 2].map(paletteColor);
  const cx = 16;
  const cy = 20;
  const outerRadius = 11;
  const innerRadius = 6;
  const sliceCount = colors.length;
  const gapDeg = 3;
  const arcSpan = 180;
  const sliceSpan = (arcSpan - sliceCount * gapDeg) / sliceCount;
  const startOffset = 180;

  return (
    <svg
      className={styles.svg}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {colors.map((color, index) => {
        const startDeg = startOffset + index * (sliceSpan + gapDeg);
        const endDeg = startDeg + sliceSpan;
        return (
          <path
            key={index}
            d={donutSlicePath(
              cx,
              cy,
              outerRadius,
              innerRadius,
              startDeg,
              endDeg,
            )}
            fill={color}
          />
        );
      })}
    </svg>
  );
}

function HorizontalBarIcon() {
  const colors = [0, 1, 2].map(paletteColor);
  const segments = [11, 8, 5];
  let x = 4;
  const y = 13;
  const height = 6;

  return (
    <svg
      className={styles.svg}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {segments.map((width, segmentIndex) => {
        const rect = (
          <rect
            key={segmentIndex}
            x={x}
            y={y}
            width={width}
            height={height}
            rx={
              segmentIndex === 0 || segmentIndex === segments.length - 1 ? 1 : 0
            }
            fill={colors[segmentIndex]}
          />
        );
        x += width;
        return rect;
      })}
    </svg>
  );
}

function VerticalBarIcon() {
  const colors = [0, 1, 2].map(paletteColor);
  return (
    <svg
      className={styles.svg}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="5" y="14" width="5" height="12" rx="1" fill={colors[0]} />
      <rect x="13" y="8" width="5" height="18" rx="1" fill={colors[1]} />
      <rect x="21" y="17" width="5" height="9" rx="1" fill={colors[2]} />
      <line
        x1="3"
        y1="26"
        x2="29"
        y2="26"
        stroke="var(--figma-color-border)"
        strokeWidth="1"
      />
    </svg>
  );
}

function LineIcon() {
  const stroke = paletteColor(0);
  const dot = paletteColor(1);
  return (
    <svg
      className={styles.svg}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <line
        x1="4"
        y1="26"
        x2="28"
        y2="26"
        stroke="var(--figma-color-border)"
        strokeWidth="1"
      />
      <line
        x1="4"
        y1="26"
        x2="4"
        y2="6"
        stroke="var(--figma-color-border)"
        strokeWidth="1"
      />
      <polyline
        points="4,22 10,16 16,18 22,10 28,13"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="22" cy="10" r="2.5" fill={dot} />
    </svg>
  );
}

function DesignSystemIcon() {
  const colors = [0, 1, 2, 3, 4, 5].map(paletteColor);
  return (
    <svg
      className={styles.svg}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {colors.map((color, index) => {
        const col = index % 3;
        const row = Math.floor(index / 3);
        return (
          <rect
            key={index}
            x={5 + col * 9}
            y={7 + row * 9}
            width="7"
            height="7"
            rx="1.5"
            fill={color}
          />
        );
      })}
    </svg>
  );
}

export default function ChartTypeIcon({ variant }: ChartTypeIconProps) {
  return (
    <div className={styles.root}>
      {variant === "pie" && <PieIcon />}
      {variant === "semiDonut" && <SemiDonutIcon />}
      {variant === "horizontalBar" && <HorizontalBarIcon />}
      {variant === "verticalBar" && <VerticalBarIcon />}
      {variant === "line" && <LineIcon />}
      {variant === "designSystem" && <DesignSystemIcon />}
    </div>
  );
}
