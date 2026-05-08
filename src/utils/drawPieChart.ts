import {
  dataVisColor,
  pieChartConfig,
  pieChartRadiusLarge,
} from "../config";
import { formatLegendPercentageDisplay, getSum } from "../helpers";
import { ChartData } from "../types";
import {
  createChartTitle,
  createFinalFrame,
  createLegend,
  createLegendList,
  loadChartTitleFont,
  loadLegendFonts,
} from "./figmaOperations";

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

function createPieSlice(
  startAngle: number,
  endAngle: number,
  hexColor: string,
  name: string,
  pieRadius: number,
  innerRadiusRatio: number,
): EllipseNode {
  const slice = figma.createEllipse();
  slice.name = name;
  slice.resize(pieRadius * 2, pieRadius * 2);
  slice.x = PIE_CENTER_X - pieRadius;
  slice.y = PIE_CENTER_Y - pieRadius;
  slice.fills = [{ type: "SOLID", color: figma.util.rgb(hexColor) }];
  slice.strokes = [{ type: "SOLID", color: figma.util.rgb("#ffffff") }];
  slice.strokeWeight = 1.5;
  slice.strokeAlign = "CENTER";
  const sweep = endAngle - startAngle;
  if (sweep >= 359.999) {
    if (innerRadiusRatio <= 0) {
      return slice;
    }
    slice.arcData = {
      startingAngle: 0,
      endingAngle: 2 * Math.PI,
      innerRadius: innerRadiusRatio,
    };
    return slice;
  }
  slice.arcData = {
    startingAngle: (startAngle * Math.PI) / 180,
    endingAngle: (endAngle * Math.PI) / 180,
    innerRadius: innerRadiusRatio,
  };
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
  labelNode.characters = label;
  labelNode.fontName = { family: "Inter", style: "Regular" };
  labelNode.fontSize = 12;
  labelNode.fills = [{ type: "SOLID", color: figma.util.rgb("#333333") }];
  textFrame.appendChild(labelNode);

  if (showIndicatorPercentage) {
    const percentNode = figma.createText();
    percentNode.characters = `${formatLegendPercentageDisplay(percentage)}%`;
    percentNode.fontName = { family: "Inter", style: "Semi Bold" };
    percentNode.fontSize = 12;
    percentNode.fills = [{ type: "SOLID", color: figma.util.rgb("#333333") }];
    textFrame.appendChild(percentNode);
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
  const pieRadius = showIndicator ? pieChartConfig.radius : pieChartRadiusLarge;
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
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    if (showIndicatorPercentage) {
      await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
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
    const color = dataVisColor[item.index % dataVisColor.length].value;
    const sweepAngle = (item.value / sum) * 360;
    const endAngle = currentStartAngle + sweepAngle;
    const midAngle = currentStartAngle + sweepAngle / 2;

    let indicatorText: FrameNode | null = null;
    if (showIndicator) {
      const lineEndPoint = polarToCartesian(
        PIE_CENTER_X,
        PIE_CENTER_Y,
        pieRadius + pieChartConfig.indicatorLineExtend,
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
      line.strokes = [{ type: "SOLID", color: figma.util.rgb(color) }];
      line.strokeWeight = 1.5;
      chartFrame.appendChild(line);

      const labelCenterPoint = polarToCartesian(
        PIE_CENTER_X,
        PIE_CENTER_Y,
        pieRadius +
          pieChartConfig.indicatorLineExtend +
          pieChartConfig.indicatorLabelCenterOffset,
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

    const slice = createPieSlice(
      currentStartAngle,
      endAngle,
      color,
      `${item.label} (${item.value})`,
      pieRadius,
      innerRadiusRatio,
    );
    chartFrame.appendChild(slice);
    if (indicatorText) {
      chartFrame.appendChild(indicatorText);
    }

    if (legendList) {
      const legend = createLegend(
        item.label || `Item ${item.index + 1}`,
        item.value,
        (item.value / sum) * 100,
        item.colorToken ?? null,
        color,
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

  const finalFrame = createFinalFrame();
  const titleFrame = createChartTitle(chartTitle);
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
