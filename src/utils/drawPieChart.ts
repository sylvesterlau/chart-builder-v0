import {
  chartBackground,
  dataVisAt,
  pieChartConfig,
  textColor,
  typography,
} from "../config";
import { formatLegendPercentageDisplay, getSum } from "../helpers";
import { ChartData } from "../types";
import {
  applyColorTokenToFills,
  applyColorTokenToStrokes,
} from "./applyColorToken";
import { applyFigmaTypographyToken } from "./applyFigmaTypography";
import { resolveFigmaFontStyle } from "./chartTypography";
import { createChartTitle, loadChartTitleFont } from "./drawChartTitle";
import { applyStrokeWeight } from "./applyNumberToken";
import { createFinalFrame } from "./figmaOperations";
import {
  createLegend,
  createLegendList,
  loadLegendFonts,
} from "./drawLegend";

const PIE_CENTER_X = pieChartConfig.frameWidth / 2;
const PIE_CENTER_Y = pieChartConfig.frameHeight / 2;

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
  innerRadiusRatio: number,
): Promise<EllipseNode> {
  const slice = figma.createEllipse();
  slice.name = name;
  slice.resize(pieRadius * 2, pieRadius * 2);
  slice.x = PIE_CENTER_X - pieRadius;
  slice.y = PIE_CENTER_Y - pieRadius;
  await applyStrokeWeight(slice, pieChartConfig.indicator.sliceStrokeWeight);
  slice.strokeAlign = "CENTER";
  const sweep = endAngle - startAngle;
  if (sweep >= 359.999) {
    if (innerRadiusRatio <= 0) {
      await applyColorTokenToFills(slice, fillToken);
      await applyColorTokenToStrokes(slice, chartBackground);
      return slice;
    }
    slice.arcData = {
      startingAngle: 0,
      endingAngle: 2 * Math.PI,
      innerRadius: innerRadiusRatio,
    };
    await applyColorTokenToFills(slice, fillToken);
    await applyColorTokenToStrokes(slice, chartBackground);
    return slice;
  }
  slice.arcData = {
    startingAngle: (startAngle * Math.PI) / 180,
    endingAngle: (endAngle * Math.PI) / 180,
    innerRadius: innerRadiusRatio,
  };
  await applyColorTokenToFills(slice, fillToken);
  await applyColorTokenToStrokes(slice, chartBackground);
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
  applyFigmaTypographyToken(labelNode, typography.indicator.label);
  labelNode.characters = label;
  textFrame.appendChild(labelNode);
  await applyColorTokenToFills(labelNode, textColor.primary);

  if (showIndicatorPercentage) {
    const percentNode = figma.createText();
    applyFigmaTypographyToken(percentNode, typography.indicator.percentage);
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
  const innerRadiusRatio =
    pieChartKind === "donut" ? pieChartConfig.donutInnerRadiusRatio : 0;
  const shouldShowLegend = chartData.legendStyle !== "none";
  const legendTileLayout =
    chartData.legendStyle === "topAndBottom" ? "topAndBottom" : "leftAndRight";
  const showPercentage = chartData.showPercentage !== false;
  const showIndicator = chartData.showIndicator !== false;
  const showIndicatorPercentage = chartData.showIndicatorPercentage !== false;
  const pieRadius = showIndicator
    ? pieChartConfig.radius
    : pieChartConfig.radiusLarge;
  const donutInnerRadiusPx = pieRadius * innerRadiusRatio;
  const valuePrefix = chartData.valuePrefix ?? "";
  const valueSuffix = chartData.valueSuffix ?? "HKD";

  if (chartTitle.trim()) {
    await loadChartTitleFont();
  }
  if (shouldShowLegend) {
    await loadLegendFonts();
  }
  if (showIndicator) {
    const ind = typography.indicator;
    await figma.loadFontAsync({
      family: ind.label.fontFamily,
      style: resolveFigmaFontStyle(ind.label),
    });
    if (showIndicatorPercentage) {
      await figma.loadFontAsync({
        family: ind.percentage.fontFamily,
        style: resolveFigmaFontStyle(ind.percentage),
      });
    }
  }

  const chartItems = chartData.data
    .map((item, index) => ({ ...item, index }))
    .filter((item) => item.value > 0);

  const chartFrame = figma.createFrame();
  chartFrame.fills = [];
  chartFrame.resize(pieChartConfig.frameWidth, pieChartConfig.frameHeight);
  Object.assign(chartFrame, {
    name: "Pie chart area",
  });

  const legendList = shouldShowLegend ? createLegendList() : null;

  let currentStartAngle = -90;
  for (let i = 0; i < chartItems.length; i++) {
    const item = chartItems[i];
    const sliceColor = dataVisAt(item.index);
    const sweepAngle = (item.value / sum) * 360;
    const endAngle = currentStartAngle + sweepAngle;
    const midAngle = currentStartAngle + sweepAngle / 2;

    let indicatorText: FrameNode | null = null;
    if (showIndicator) {
      const lineEndPoint = polarToCartesian(
        PIE_CENTER_X,
        PIE_CENTER_Y,
        pieRadius + pieChartConfig.indicator.lineExtend,
        midAngle,
      );
      const lineStartPoint =
        pieChartKind === "donut"
          ? polarToCartesian(
              PIE_CENTER_X,
              PIE_CENTER_Y,
              donutInnerRadiusPx,
              midAngle,
            )
          : { x: PIE_CENTER_X, y: PIE_CENTER_Y };
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
        PIE_CENTER_X,
        PIE_CENTER_Y,
        pieRadius +
          pieChartConfig.indicator.lineExtend +
          pieChartConfig.indicator.labelCenterOffset,
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

    const slice = await createPieSlice(
      currentStartAngle,
      endAngle,
      sliceColor,
      `${item.label} (${item.value})`,
      pieRadius,
      innerRadiusRatio,
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
      );
      if (legend) {
        legendList.appendChild(legend);
      }
    }

    currentStartAngle = endAngle;
  }

  const finalFrame = await createFinalFrame();
  const titleFrame = await createChartTitle(chartTitle);
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
