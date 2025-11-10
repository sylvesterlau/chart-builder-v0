import { on, showUI } from "@create-figma-plugin/utilities";
import { chartConfig, dataVisColor } from "./config";
import {
  dotToSlash,
  checkCollectionExists,
  checkVariableExists,
  transformToPercents,
  TransformedChartItem,
} from "./helpers";

export default function () {
  // create donut slice
  function createDonutSlice(
    startPercent: number,
    endPercent: number,
    layerName: string,
    hexColor: string = dataVisColor[0].value,
    variable?: Variable | null
  ): EllipseNode | null {
    if (endPercent - startPercent <= 0) {
      return null;
    }
    const slice = figma.createEllipse();
    slice.name = layerName;
    slice.resize(chartConfig.size, chartConfig.size);

    const defaultColor = figma.util.rgb("#DB0011");
    const convertedColor = figma.util.rgb(hexColor);
    const fillColor = convertedColor || defaultColor;
    slice.fills = [{ type: "SOLID", color: fillColor }];

    // 如果传入 variable，尝试把变量绑定到 fill（使用 immutable paints API）
    if (variable) {
      try {
        // 克隆 fills 数组（immutable）
        let fillsCopy: Paint[];
        if (typeof (globalThis as any).structuredClone === "function") {
          fillsCopy = (globalThis as any).structuredClone(slice.fills);
        } else {
          fillsCopy = JSON.parse(JSON.stringify(slice.fills));
        }

        // @ts-ignore - typings may not include this helper
        const boundPaint = figma.variables.setBoundVariableForPaint(
          fillsCopy[0] as any,
          "color",
          variable as any
        );

        fillsCopy[0] = boundPaint;
        slice.fills = fillsCopy;
      } catch (err) {
        console.error("Failed to bind variable to slice fill:", err);
        // 回退为使用变量当前值（非绑定）
        try {
          const modeId = Object.keys(variable.valuesByMode)[0];
          const val = variable.valuesByMode[modeId] as any;
          if (val && typeof val === "object" && "r" in val) {
            slice.fills = [
              { type: "SOLID", color: { r: val.r, g: val.g, b: val.b } },
            ];
          }
        } catch (e) {
          console.error("Fallback painting for slice failed:", e);
        }
      }
    }
    slice.arcData = {
      startingAngle: -Math.PI * (1 - startPercent / 100),
      endingAngle: -Math.PI * (1 - endPercent / 100),
      innerRadius: chartConfig.ratio,
    };
    return slice;
  }

  //chart data submit handler
  async function handleSubmit(chartData: any) {
    var sum: number = 0;
    chartData.data.forEach((item: { label: string; value: number }) => {
      sum += item.value;
    });

    if (sum === 0) {
      figma.notify("Sum of values is 0. Cannot create chart.");
      return;
    }

    // Transform data with helper
    const transformedData: TransformedChartItem[] = transformToPercents(
      chartData.data
    );

    // create frame to hold slices
    const frame = figma.createFrame();
    frame.name = chartConfig.name;
    frame.resize(chartConfig.size, chartConfig.size / 2);
    frame.x = figma.viewport.center.x - chartConfig.size / 2;
    frame.y = figma.viewport.center.y - chartConfig.size / 2;

    const slices: EllipseNode[] = [];
    // use indexed for loop (compatible with older TS targets)
    for (let i = 0; i < transformedData.length; i++) {
      const index = i;
      const item = transformedData[index];
      const layerName = `${item.label} (${item.value})`;
      const colorData = dataVisColor[index % dataVisColor.length];

      // try to find corresponding variable by token path
      let variable: Variable | null = null;
      try {
        if (colorData && colorData.key) {
          const tokenPath = dotToSlash(colorData.key);
          const varRes = await checkVariableExists(tokenPath, "Theme", true);
          if (varRes.exists && varRes.variable) {
            variable = varRes.variable;
          }
        }
      } catch (err) {
        console.error("Variable lookup failed for", colorData, err);
      }

      const slice = createDonutSlice(
        item.startPercent,
        item.endPercent,
        layerName,
        colorData.value,
        variable
      );
      if (slice) {
        // 居中于 frame
        slice.x = 0;
        slice.y = 0;
        frame.appendChild(slice);
        slices.push(slice);
      }
    }
    figma.currentPage.appendChild(frame);
    figma.currentPage.selection = [frame];
    figma.viewport.scrollAndZoomIntoView([frame]);
  }

  // test handler
  async function handleTest() {
    const libraryCollections =
      await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
    console.log("Library Collections:", libraryCollections);
  }

  on("SUBMIT_CHART_DATA", handleSubmit);

  on("TEST_Click", handleTest);

  // UI window size
  showUI({
    width: 360,
    height: 480,
  });
}
