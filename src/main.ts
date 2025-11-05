import {
  on,
  once,
  showUI,
  convertHexColorToRgbColor,
} from "@create-figma-plugin/utilities";

import { CloseHandler, CreateRectanglesHandler } from "./types";

//config donut slice style
const chartName = "Semi-donut Chart",
  donutSize = 318,
  donutRatio = 0.88,
  colorSequence = ["#347893", "#E76E84", "#518827", "#EC7046", "#509EBC"];

export default function () {
  // create donut slice
  function createDonutSlice(
    startPercent: number,
    endPercent: number,
    layerName: string,
    hexColor: string = colorSequence[0]
  ): EllipseNode | null {
    if (endPercent - startPercent <= 0) {
      return null;
    }
    const slice = figma.createEllipse();
    slice.name = layerName;
    slice.resize(donutSize, donutSize);
    // 颜色
    const defaultColor = { r: 0.204, g: 0.471, b: 0.576 };
    const cleanHexColor = hexColor.replace("#", "");
    const convertedColor = cleanHexColor
      ? convertHexColorToRgbColor(cleanHexColor)
      : null;
    const fillColor = convertedColor || defaultColor;
    slice.fills = [{ type: "SOLID", color: fillColor }];
    slice.arcData = {
      startingAngle: -Math.PI * (1 - startPercent / 100),
      endingAngle: -Math.PI * (1 - endPercent / 100),
      innerRadius: donutRatio,
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
    frame.name = chartName;
    frame.resize(donutSize, donutSize / 2);
    frame.x = figma.viewport.center.x - donutSize / 2;
    frame.y = figma.viewport.center.y - donutSize / 2;

    const slices: EllipseNode[] = [];
    transformedData.forEach((item: TransformedChartItem, index: number) => {
      const layerName = `${item.label} (${item.value})`;
      const color = colorSequence[index % colorSequence.length];
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
