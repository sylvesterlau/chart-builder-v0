import {
  semiDonutChartConfig,
  dataVisAt,
  getSemiDonutSizeBounds,
  textColor,
  typography,
} from "../config";
import { getSum, transformToPercents, TransformedChartItem } from "../helpers";
import { ChartData } from "../types";
import type { ColorToken } from "../types";
import { applyColorTokenToFills } from "./applyColorToken";
import {
  applyTypographyTokenToText,
  loadTypographyTokenFontsBatch,
} from "./applyTypographyToken";
import { createChartTitle, loadChartTitleFont } from "./drawChartTitle";
import { createFinalFrame } from "./figmaOperations";
import { createLegend, createLegendList, loadLegendFonts } from "./drawLegend";

function resolveSemiDonutFrameWidth(frameWidth: number | undefined): number {
  const {
    frameWidth: defaultWidth,
    frameWidthMin,
    frameWidthMax,
  } = semiDonutChartConfig;
  const value = frameWidth ?? defaultWidth;
  return Math.round(
    Math.min(frameWidthMax, Math.max(frameWidthMin, value)),
  );
}

function resolveSemiDonutSize(
  semiDonutSize: number | undefined,
  frameWidth: number,
): number {
  const { size: defaultSize } = semiDonutChartConfig;
  const { min, max } = getSemiDonutSizeBounds(frameWidth);
  const value = semiDonutSize ?? defaultSize;
  return Math.round(Math.min(max, Math.max(min, value)));
}

function formatValueText(value: number, prefix: string, suffix: string) {
  const formattedValue = value.toFixed(2);
  const prefixText = prefix.trim();
  const suffixText = suffix.trim();
  return `${prefixText}${formattedValue}${suffixText ? ` ${suffixText}` : ""}`;
}

async function createSemiDonutSlice(
  startPercent: number,
  endPercent: number,
  layerName: string,
  fillToken: ColorToken,
  chartSize: number,
  isFirst: Boolean = false,
): Promise<EllipseNode | null> {
  if (endPercent - startPercent <= 0) {
    return null;
  }
  const slice = figma.createEllipse();
  const gap = isFirst ? 0 : 0.5;
  slice.name = layerName;
  slice.resize(chartSize, chartSize);
  slice.arcData = {
    startingAngle: -Math.PI * (1 - (startPercent + gap) / 100),
    endingAngle: -Math.PI * (1 - endPercent / 100),
    innerRadius: semiDonutChartConfig.ratio,
  };
  await applyColorTokenToFills(slice, fillToken);
  return slice;
}

async function createTotalValueFrame(
  sumValue: number,
  title: string,
  valuePrefix: string = "",
  valueSuffix: string = "HKD",
): Promise<FrameNode> {
  const titleTok = typography.totalValue.title;
  const valueTok = typography.totalValue.value;
  await loadTypographyTokenFontsBatch([titleTok, valueTok]);

  const titleNode = figma.createText();
  await applyTypographyTokenToText(titleNode, titleTok);
  titleNode.characters = title;

  const totalValueNode = figma.createText();
  await applyTypographyTokenToText(totalValueNode, valueTok);
  totalValueNode.characters = formatValueText(
    sumValue,
    valuePrefix,
    valueSuffix,
  );

  const totalValFrame = figma.createFrame();
  totalValFrame.fills = [];
  totalValFrame.appendChild(titleNode);
  totalValFrame.appendChild(totalValueNode);
  Object.assign(totalValFrame, {
    name: "Total value frame",
    layoutMode: "VERTICAL",
    primaryAxisSizingMode: "AUTO",
    counterAxisSizingMode: "AUTO",
    counterAxisAlignItems: "CENTER",
    itemSpacing: 2,
  });

  await applyColorTokenToFills(titleNode, textColor.primary);
  await applyColorTokenToFills(totalValueNode, textColor.primary);

  return totalValFrame;
}

export async function drawSemiDonutChart(chartData: ChartData) {
  const sum: number = getSum(chartData);
  if (sum <= 0) {
    figma.notify("Please enter correct value for items");
    return;
  }

  await figma.currentPage.loadAsync();
  const transformedData: TransformedChartItem[] = transformToPercents(
    chartData.data,
  );
  const shouldShowLegend = chartData.legendStyle !== "none";
  const showPercentage = chartData.showPercentage !== false;
  const chartTitle = chartData.chartTitle ?? "";
  const valuePrefix = chartData.valuePrefix ?? "";
  const valueSuffix = chartData.valueSuffix ?? "HKD";
  const showTotalValue = chartData.showTotalValue !== false;
  const totalValueTitle = (
    chartData.totalValueTitle ?? "Total Asset Value"
  ).trim();
  const frameWidth = resolveSemiDonutFrameWidth(chartData.frameWidth);
  const chartSize = resolveSemiDonutSize(chartData.semiDonutSize, frameWidth);
  const totalValueY = Math.round(chartSize * (90 / 318));

  if (chartTitle.trim()) {
    await loadChartTitleFont();
  }
  if (shouldShowLegend) {
    await loadLegendFonts();
  }

  const legendList = shouldShowLegend ? createLegendList("Legend List") : null;
  const legendTileLayout =
    chartData.legendStyle === "topAndBottom" ? "topAndBottom" : "leftAndRight";

  const chartFrame = figma.createFrame();
  chartFrame.fills = [];
  chartFrame.resize(chartSize, chartSize / 2);
  Object.assign(chartFrame, {
    name: "Chart area",
    x: figma.viewport.center.x - chartSize / 2,
    y: figma.viewport.center.y - chartSize / 2,
  });

  for (let i = 0; i < transformedData.length; i++) {
    const item = transformedData[i];
    const layerName = `${item.label} (${item.value})`;
    const isFirstSlice = i === 0;
    const sliceColor = dataVisAt(i);
    if (item.value > 0) {
      const slice = await createSemiDonutSlice(
        item.startPercent,
        item.endPercent,
        layerName,
        sliceColor,
        chartSize,
        isFirstSlice,
      );
      if (slice) {
        slice.x = 0;
        slice.y = 0;
        chartFrame.appendChild(slice);
      }
      if (legendList) {
        const legend = await createLegend(
          item.label,
          item.value,
          item.exactPercent,
          sliceColor,
          showPercentage,
          valuePrefix,
          valueSuffix,
          legendTileLayout,
          frameWidth,
        );
        if (legend) {
          legendList.appendChild(legend);
        }
      }
    }
  }

  const totalValFrame = showTotalValue
    ? await createTotalValueFrame(
        sum,
        totalValueTitle || "Total Asset Value",
        valuePrefix,
        valueSuffix,
      )
    : null;

  const chartValueFrame = figma.createFrame();
  chartValueFrame.fills = [];
  Object.assign(chartValueFrame, {
    name: "Chart + total value",
    layoutMode: "VERTICAL",
    primaryAxisSizingMode: "AUTO",
    counterAxisSizingMode: "AUTO",
    counterAxisAlignItems: "CENTER",
  });
  chartValueFrame.appendChild(chartFrame);
  if (totalValFrame) {
    chartValueFrame.appendChild(totalValFrame);
    totalValFrame.layoutPositioning = "ABSOLUTE";
    totalValFrame.x = (chartFrame.width - totalValFrame.width) / 2;
    totalValFrame.y = totalValueY;
  }

  const finalFrame = await createFinalFrame(frameWidth, "Semi-donut Chart");
  const titleFrame = await createChartTitle(chartTitle, frameWidth);
  if (titleFrame) {
    finalFrame.appendChild(titleFrame);
  }
  finalFrame.appendChild(chartValueFrame);
  if (legendList) {
    finalFrame.appendChild(legendList);
  }

  figma.currentPage.appendChild(finalFrame);
  figma.currentPage.selection = [finalFrame];
  figma.viewport.scrollAndZoomIntoView([finalFrame]);
}
