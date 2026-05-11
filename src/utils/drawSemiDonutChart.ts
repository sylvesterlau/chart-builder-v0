import {
  semiDonutChartConfig,
  dataVisAt,
  dataVisColor,
  textColor,
  typography,
} from "../config";
import { getSum, transformToPercents, TransformedChartItem } from "../helpers";
import { ChartData } from "../types";
import { applyFigmaTypographyToken } from "./applyFigmaTypography";
import { resolveFigmaFontStyle } from "./chartTypography";
import {
  createChartTitle,
  createFinalFrame,
  loadChartTitleFont,
} from "./figmaOperations";
import { createLegend, createLegendList, loadLegendFonts } from "./drawLegend";

const chartTextPrimaryHex = textColor.primary.value;

function formatValueText(value: number, prefix: string, suffix: string) {
  const formattedValue = value.toFixed(2);
  const prefixText = prefix.trim();
  const suffixText = suffix.trim();
  return `${prefixText}${formattedValue}${suffixText ? ` ${suffixText}` : ""}`;
}

async function createSemiDonutSlice(
  startPercent: number,
  endPercent: number,
  layerName: string = "slice",
  hexColor: string = dataVisColor.general[0].value,
  isFirst: Boolean = false,
): Promise<EllipseNode | null> {
  if (endPercent - startPercent <= 0) {
    return null;
  }
  const slice = figma.createEllipse();
  const gap = isFirst ? 0 : 0.5;
  slice.name = layerName;
  slice.resize(semiDonutChartConfig.size, semiDonutChartConfig.size);
  slice.arcData = {
    startingAngle: -Math.PI * (1 - (startPercent + gap) / 100),
    endingAngle: -Math.PI * (1 - endPercent / 100),
    innerRadius: semiDonutChartConfig.ratio,
  };
  slice.fills = [{ type: "SOLID", color: figma.util.rgb(hexColor) }];
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
  await figma.loadFontAsync({
    family: titleTok.fontFamily,
    style: resolveFigmaFontStyle(titleTok),
  });
  await figma.loadFontAsync({
    family: valueTok.fontFamily,
    style: resolveFigmaFontStyle(valueTok),
  });

  const titleNode = figma.createText();
  applyFigmaTypographyToken(titleNode, titleTok);
  titleNode.characters = title;
  titleNode.fills = [
    {
      type: "SOLID",
      color: figma.util.rgb(chartTextPrimaryHex),
    },
  ];

  const totalValueNode = figma.createText();
  applyFigmaTypographyToken(totalValueNode, valueTok);
  totalValueNode.characters = formatValueText(
    sumValue,
    valuePrefix,
    valueSuffix,
  );
  totalValueNode.fills = [
    {
      type: "SOLID",
      color: figma.util.rgb(chartTextPrimaryHex),
    },
  ];

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

  if (chartTitle.trim()) {
    await loadChartTitleFont();
  }
  if (shouldShowLegend) {
    await loadLegendFonts();
  }

  const legendList = shouldShowLegend ? createLegendList() : null;
  const legendTileLayout =
    chartData.legendStyle === "topAndBottom" ? "topAndBottom" : "leftAndRight";

  const chartFrame = figma.createFrame();
  chartFrame.fills = [];
  chartFrame.resize(semiDonutChartConfig.size, semiDonutChartConfig.size / 2);
  Object.assign(chartFrame, {
    name: "Chart area",
    x: figma.viewport.center.x - semiDonutChartConfig.size / 2,
    y: figma.viewport.center.y - semiDonutChartConfig.size / 2,
  });

  for (let i = 0; i < transformedData.length; i++) {
    const item = transformedData[i];
    const layerName = `${item.label} (${item.value})`;
    const isFirstSlice = i === 0;
    const fallbackColor = dataVisAt(i).value;
    if (item.value > 0) {
      const slice = await createSemiDonutSlice(
        item.startPercent,
        item.endPercent,
        layerName,
        fallbackColor,
        isFirstSlice,
      );
      if (slice) {
        slice.x = 0;
        slice.y = 0;
        chartFrame.appendChild(slice);
      }
      if (legendList) {
        const legend = createLegend(
          item.label,
          item.value,
          item.exactPercent,
          item.colorToken ?? null,
          fallbackColor,
          showPercentage,
          valuePrefix,
          valueSuffix,
          legendTileLayout,
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
    totalValFrame.y = 90;
  }

  const finalFrame = createFinalFrame();
  const titleFrame = createChartTitle(chartTitle);
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
