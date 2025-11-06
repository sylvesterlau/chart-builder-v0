import { on, once, showUI } from "@create-figma-plugin/utilities";

import { CloseHandler } from "./types";
import { chartConfig, dataVisColor } from "./config";

export default function () {
  // create donut slice
  function createDonutSlice(
    startPercent: number,
    endPercent: number,
    layerName: string,
    hexColor: string = dataVisColor[0]
  ): EllipseNode | null {
    if (endPercent - startPercent <= 0) {
      return null;
    }
    const slice = figma.createEllipse();
    slice.name = layerName;
    slice.resize(chartConfig.size, chartConfig.size);
    // 颜色
    const defaultColor = figma.util.rgb("#DB0011");
    const convertedColor = figma.util.rgb(hexColor);
    const fillColor = convertedColor || defaultColor;
    slice.fills = [{ type: "SOLID", color: fillColor }];
    slice.arcData = {
      startingAngle: -Math.PI * (1 - startPercent / 100),
      endingAngle: -Math.PI * (1 - endPercent / 100),
      innerRadius: chartConfig.ratio,
    };
    return slice;
  }

  // Interface for transformed chart data
  interface TransformedChartItem {
    label: string;
    value: number;
    startPercent: number;
    endPercent: number;
  }

  //chart data submit handler
  function handleSubmit(chartData: any) {
    var sum: number = 0;
    chartData.data.forEach((item: { label: string; value: number }) => {
      sum += item.value;
    });

    if (sum === 0) {
      figma.notify("Sum of values is 0. Cannot create chart.");
      return;
    }

    // Transform data with start and end percentages
    let startPercent = 0;
    const transformedData: TransformedChartItem[] = chartData.data.map(
      (item: { label: string; value: number }) => {
        const endPercent = Math.round((item.value / sum) * 100);
        const result: TransformedChartItem = {
          label: item.label,
          value: item.value,
          startPercent: startPercent,
          endPercent: startPercent + endPercent,
        };
        startPercent = result.endPercent;
        console.log(result);
        return result;
      }
    );

    // 创建 frame 并将所有 slice 放入其中
    const frame = figma.createFrame();
    frame.name = chartConfig.name;
    frame.resize(chartConfig.size, chartConfig.size / 2);
    frame.x = figma.viewport.center.x - chartConfig.size / 2;
    frame.y = figma.viewport.center.y - chartConfig.size / 2;

    const slices: EllipseNode[] = [];
    transformedData.forEach((item: TransformedChartItem, index: number) => {
      const layerName = `${item.label} (${item.value})`;
      const color = dataVisColor[index % dataVisColor.length];
      const slice = createDonutSlice(
        item.startPercent,
        item.endPercent,
        layerName,
        color
      );
      if (slice) {
        // 居中于 frame
        slice.x = 0;
        slice.y = 0;
        frame.appendChild(slice);
        slices.push(slice);
      }
    });
    figma.currentPage.appendChild(frame);
    figma.currentPage.selection = [frame];
    figma.viewport.scrollAndZoomIntoView([frame]);
  }

  // close function
  once<CloseHandler>("CLOSE", function () {
    figma.closePlugin();
  });

  on("SUBMIT_CHART_DATA", handleSubmit);

  // UI window size
  showUI({
    width: 360,
    height: 460,
  });
}
