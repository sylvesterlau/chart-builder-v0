import { on, once, showUI } from "@create-figma-plugin/utilities";

import { CloseHandler, CreateRectanglesHandler } from "./types";

export default function () {
  // create donut slice
  function createDonutSlice(startPercent: number, endPercent: number) {
    if (endPercent - startPercent <= 0) {
      return;
    }
    const nodes: Array<SceneNode> = [];

    const ellipse = figma.createEllipse();

    ellipse.x = 0;
    ellipse.y = 0; // Move to (50, 50)
    ellipse.resize(200, 200); // Set size to 200 x 100
    ellipse.fills = [
      { type: "SOLID", color: { r: 0.204, g: 0.471, b: 0.576 } },
    ]; // Set solid red fill
    // Arc from 0° to 180° clockwise
    ellipse.arcData = {
      startingAngle: -Math.PI * (1 - startPercent / 100),
      endingAngle: -Math.PI * (1 - endPercent / 100),
      innerRadius: 0.9,
    };

    figma.currentPage.appendChild(ellipse);
    nodes.push(ellipse);

    figma.currentPage.selection = nodes; // Select the created nodes
    figma.viewport.scrollAndZoomIntoView(nodes); // Adjust viewport
  }

  //chart data submit handler
  function handleSubmit(chartData: any) {
    console.log(chartData);
    var sum: number = 0;
    chartData.data.forEach((item: { label: string; value: number }) => {
      sum += item.value;
    });

    if (sum === 0) {
      figma.notify("Sum of values is 0. Cannot create chart.");
      return;
    }

    var arrayWithPercentages: number[] = [];
    chartData.data.forEach((item: { label: string; value: number }) => {
      var percentage = Math.round((item.value / sum) * 100);
      arrayWithPercentages.push(percentage);
    });

    arrayWithPercentages.forEach((item) => {
      createDonutSlice(0, item);
    });
  }
  on("SUBMIT_CHART_DATA", handleSubmit);

  // create rectangles sample
  once<CreateRectanglesHandler>("CREATE_RECTANGLES", function (count: number) {
    const nodes: Array<SceneNode> = [];
    for (let i = 0; i < count; i++) {
      const rect = figma.createRectangle();
      rect.x = i * 150;
      rect.fills = [
        {
          color: { b: 0, g: 0.5, r: 1 },
          type: "SOLID",
        },
      ];
      figma.currentPage.appendChild(rect);
      nodes.push(rect);
    }
    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
    figma.closePlugin();
  });
  // close function
  once<CloseHandler>("CLOSE", function () {
    figma.closePlugin();
  });
  // UI window size
  showUI({
    width: 360,
    height: 460,
  });
}
