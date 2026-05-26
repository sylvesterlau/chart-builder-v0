import {
  chartBackground,
  dataVisAt,
  donutGapPxToPercent,
  donutRingWidthPxToRatio,
  getPieChartSizeBounds,
  getPieChartAreaHeight,
  pieChartConfig,
  resolveDonutRingWidth,
  resolveIndicatorLineExtend,
  resolvePieSliceGap,
  textColor,
  typography,
} from "../config";
import { formatLegendPercentageDisplay, getSum } from "../helpers";
import { ChartData } from "../types";
import {
  applyColorTokenToFills,
  applyColorTokenToStrokes,
} from "./applyColorToken";
import {
  applyTypographyTokenToText,
  loadTypographyTokenFontsBatch,
} from "./applyTypographyToken";
import { createChartTitle, loadChartTitleFont } from "./drawChartTitle";
import { applyStrokeWeight } from "./applyNumberToken";
import { createFinalFrame } from "./figmaOperations";
import {
  createLegend,
  createLegendList,
  loadLegendFonts,
} from "./drawLegend";

function resolvePieFrameWidth(frameWidth: number | undefined): number {
  const {
    frameWidth: defaultWidth,
    frameWidthMin,
    frameWidthMax,
  } = pieChartConfig;
  const value = frameWidth ?? defaultWidth;
  return Math.round(
    Math.min(frameWidthMax, Math.max(frameWidthMin, value)),
  );
}

function resolvePieChartSize(
  chartSize: number | undefined,
  frameWidth: number,
): number {
  const { chartSize: defaultSize } = pieChartConfig;
  const { min, max } = getPieChartSizeBounds(frameWidth);
  const value = chartSize ?? defaultSize;
  return Math.round(Math.min(max, Math.max(min, value)));
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

async function createPieSlice(
  startAngle: number,
  endAngle: number,
  fillToken: ReturnType<typeof dataVisAt>,
  name: string,
  pieRadius: number,
  centerX: number,
  centerY: number,
  sliceGapPx: number,
): Promise<EllipseNode> {
  const slice = figma.createEllipse();
  slice.name = name;
  slice.resize(pieRadius * 2, pieRadius * 2);
  slice.x = centerX - pieRadius;
  slice.y = centerY - pieRadius;
  slice.strokeWeight = sliceGapPx;
  slice.strokeAlign = "CENTER";
  const sweep = endAngle - startAngle;
  if (sweep >= 359.999) {
    await applyColorTokenToFills(slice, fillToken);
    await applyColorTokenToStrokes(slice, chartBackground);
    return slice;
  }
  slice.arcData = {
    startingAngle: (startAngle * Math.PI) / 180,
    endingAngle: (endAngle * Math.PI) / 180,
    innerRadius: 0,
  };
  await applyColorTokenToFills(slice, fillToken);
  await applyColorTokenToStrokes(slice, chartBackground);
  return slice;
}

async function createDonutSlice(
  startAngle: number,
  endAngle: number,
  fillToken: ReturnType<typeof dataVisAt>,
  name: string,
  pieRadius: number,
  innerRadiusRatio: number,
  centerX: number,
  centerY: number,
): Promise<EllipseNode> {
  const slice = figma.createEllipse();
  slice.name = name;
  slice.resize(pieRadius * 2, pieRadius * 2);
  slice.x = centerX - pieRadius;
  slice.y = centerY - pieRadius;
  slice.strokeWeight = 0;
  slice.arcData = {
    startingAngle: (startAngle * Math.PI) / 180,
    endingAngle: (endAngle * Math.PI) / 180,
    innerRadius: innerRadiusRatio,
  };
  await applyColorTokenToFills(slice, fillToken);
  return slice;
}

async function createIndicatorTextFrame(
  label: string,
  percentage: number,
  x: number,
  y: number,
  showIndicatorPercentage: boolean,
): Promise<FrameNode> {
  const textFrame = figma.createFrame();
  textFrame.fills = [];
  textFrame.layoutMode = "VERTICAL";
  textFrame.primaryAxisSizingMode = "AUTO";
  textFrame.counterAxisSizingMode = "AUTO";
  textFrame.counterAxisAlignItems = "CENTER";
  textFrame.itemSpacing = 0;

  const labelNode = figma.createText();
  await applyTypographyTokenToText(labelNode, typography.indicator.label);
  labelNode.characters = label;
  textFrame.appendChild(labelNode);
  await applyColorTokenToFills(labelNode, textColor.primary);

  if (showIndicatorPercentage) {
    const percentNode = figma.createText();
    await applyTypographyTokenToText(percentNode, typography.indicator.percentage);
    percentNode.characters = `${formatLegendPercentageDisplay(percentage)}%`;
    textFrame.appendChild(percentNode);
    await applyColorTokenToFills(percentNode, textColor.primary);
  }

  textFrame.x = x - textFrame.width / 2;
  textFrame.y = y - textFrame.height / 2;
  return textFrame;
}

export async function drawPieChart(chartData: ChartData) {
  const sum = getSum(chartData);
  if (sum <= 0) {
    figma.notify("Please enter correct value for items");
    return;
  }

  await figma.currentPage.loadAsync();

  const chartTitle = chartData.chartTitle ?? "";
  const pieChartKind = chartData.pieChartKind ?? "pie";
  const sliceGapPx = resolvePieSliceGap(chartData.pieSliceGap);
  const shouldShowLegend = chartData.legendStyle !== "none";
  const legendTileLayout =
    chartData.legendStyle === "topAndBottom" ? "topAndBottom" : "leftAndRight";
  const showPercentage = chartData.showPercentage !== false;
  const showIndicator = chartData.showIndicator !== false;
  const showIndicatorPercentage = chartData.showIndicatorPercentage !== false;
  const valuePrefix = chartData.valuePrefix ?? "";
  const valueSuffix = chartData.valueSuffix ?? "HKD";
  const frameWidth = resolvePieFrameWidth(chartData.frameWidth);
  const chartSize = resolvePieChartSize(
    chartData.semiDonutSize,
    frameWidth,
  );
  const innerRadiusRatio =
    pieChartKind === "donut"
      ? donutRingWidthPxToRatio(
          resolveDonutRingWidth(chartData.donutRingWidth),
          chartSize,
        )
      : 0;
  const frameHeight = getPieChartAreaHeight(
    frameWidth,
    chartSize,
    showIndicator,
    showIndicatorPercentage,
    chartData.indicatorLineExtend,
  );
  const centerX = frameWidth / 2;
  const centerY = frameHeight / 2;
  const pieRadius = chartSize / 2;
  const indicatorScale = pieRadius / pieChartConfig.radius;
  const lineExtend =
    resolveIndicatorLineExtend(chartData.indicatorLineExtend) * indicatorScale;
  const labelCenterOffset =
    pieChartConfig.indicator.labelCenterOffset * indicatorScale;
  const donutInnerRadiusPx = pieRadius * innerRadiusRatio;

  if (chartTitle.trim()) {
    await loadChartTitleFont();
  }
  if (shouldShowLegend) {
    await loadLegendFonts();
  }
  if (showIndicator) {
    const ind = typography.indicator;
    const tokens = showIndicatorPercentage
      ? [ind.label, ind.percentage]
      : [ind.label];
    await loadTypographyTokenFontsBatch(tokens);
  }

  const chartItems = chartData.data
    .map((item, index) => ({ ...item, index }))
    .filter((item) => item.value > 0);

  const chartFrame = figma.createFrame();
  chartFrame.fills = [];
  chartFrame.resize(frameWidth, frameHeight);
  Object.assign(chartFrame, {
    name: "Pie chart area",
  });

  const legendList = shouldShowLegend ? createLegendList() : null;
  const donutGapPercent =
    pieChartKind === "donut"
      ? donutGapPxToPercent(sliceGapPx, chartSize, innerRadiusRatio)
      : 0;

  let currentStartAngle = -90;
  let donutStartPercent = 0;
  for (let i = 0; i < chartItems.length; i++) {
    const item = chartItems[i];
    const sliceColor = dataVisAt(item.index);
    const exactPercent = (item.value / sum) * 100;
    const sweepAngle = (item.value / sum) * 360;
    let startAngle: number;
    let endAngle: number;
    let midAngle: number;

    if (pieChartKind === "donut") {
      const adjustedStartPercent = donutStartPercent + donutGapPercent;
      const endPercent = donutStartPercent + exactPercent;
      startAngle = -90 + adjustedStartPercent * 3.6;
      endAngle = -90 + endPercent * 3.6;
      midAngle = (startAngle + endAngle) / 2;
      donutStartPercent = endPercent;
      if (endPercent - adjustedStartPercent <= 0) {
        continue;
      }
    } else {
      startAngle = currentStartAngle;
      endAngle = startAngle + sweepAngle;
      midAngle = startAngle + sweepAngle / 2;
      currentStartAngle = endAngle;
    }

    let indicatorText: FrameNode | null = null;
    if (showIndicator) {
      const lineEndPoint = polarToCartesian(
        centerX,
        centerY,
        pieRadius + lineExtend,
        midAngle,
      );
      const lineStartPoint =
        pieChartKind === "donut"
          ? polarToCartesian(centerX, centerY, donutInnerRadiusPx, midAngle)
          : { x: centerX, y: centerY };
      const line = figma.createVector();
      line.vectorPaths = [
        {
          windingRule: "NONE",
          data: `M ${lineStartPoint.x} ${lineStartPoint.y} L ${lineEndPoint.x} ${lineEndPoint.y}`,
        },
      ];
      await applyStrokeWeight(
        line,
        pieChartConfig.indicator.leaderLineStrokeWeight,
      );
      await applyColorTokenToStrokes(line, sliceColor);
      chartFrame.appendChild(line);

      const labelCenterPoint = polarToCartesian(
        centerX,
        centerY,
        pieRadius + lineExtend + labelCenterOffset,
        midAngle,
      );
      indicatorText = await createIndicatorTextFrame(
        item.label || `Item ${item.index + 1}`,
        (item.value / sum) * 100,
        labelCenterPoint.x,
        labelCenterPoint.y,
        showIndicatorPercentage,
      );
    }

    const slice =
      pieChartKind === "donut"
        ? await createDonutSlice(
            startAngle,
            endAngle,
            sliceColor,
            `${item.label} (${item.value})`,
            pieRadius,
            innerRadiusRatio,
            centerX,
            centerY,
          )
        : await createPieSlice(
            startAngle,
            endAngle,
            sliceColor,
            `${item.label} (${item.value})`,
            pieRadius,
            centerX,
            centerY,
            sliceGapPx,
          );
    chartFrame.appendChild(slice);
    if (indicatorText) {
      chartFrame.appendChild(indicatorText);
    }

    if (legendList) {
      const legend = await createLegend(
        item.label || `Item ${item.index + 1}`,
        item.value,
        (item.value / sum) * 100,
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

  const finalFrame = await createFinalFrame(
    frameWidth,
    pieChartKind === "donut" ? "Donut chart" : "Pie chart",
  );
  const titleFrame = await createChartTitle(chartTitle, frameWidth);
  if (titleFrame) {
    finalFrame.appendChild(titleFrame);
  }
  finalFrame.appendChild(chartFrame);
  if (legendList) {
    finalFrame.appendChild(legendList);
  }

  figma.currentPage.appendChild(finalFrame);
  figma.currentPage.selection = [finalFrame];
  figma.viewport.scrollAndZoomIntoView([finalFrame]);
}
