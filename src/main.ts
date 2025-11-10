import { on, showUI } from "@create-figma-plugin/utilities";
import { chartConfig, dataVisColor, teamLibrary } from "./config";
import {
  dotToSlash,
  checkCollectionExists,
  checkVariableExists,
  bindVariableKeyToPaint,
  transformToPercents,
  TransformedChartItem,
} from "./helpers";

// types for chart data
interface ChartDataItem {
  label: string;
  value: number;
  // stored variable key (string) or null if none
  colorToken?: string | null;
}

interface ChartData {
  data: ChartDataItem[];
}

export default function () {
  // create donut slice
  async function createDonutSlice(
    startPercent: number,
    endPercent: number,
    layerName: string,
    hexColor: string = chartConfig.defaultColor,
    variableKey?: string | null
  ): Promise<EllipseNode | null> {
    if (endPercent - startPercent <= 0) {
      return null;
    }
    const slice = figma.createEllipse();
    slice.name = layerName;
    slice.resize(chartConfig.size, chartConfig.size);
    slice.arcData = {
      startingAngle: -Math.PI * (1 - startPercent / 100),
      endingAngle: -Math.PI * (1 - endPercent / 100),
      innerRadius: chartConfig.ratio,
    };

    const convertedColor = figma.util.rgb(hexColor);
    const fillColor = convertedColor;
    slice.fills = [{ type: "SOLID", color: fillColor }];

    // 如果传入 variableKey（string），使用 helpers.bindVariableKeyToPaint 统一处理导入与绑定
    if (variableKey && typeof variableKey === "string") {
      try {
        const boundPaint = await bindVariableKeyToPaint(
          variableKey,
          slice.fills[0] as SolidPaint
        );
        slice.fills = [boundPaint];
      } catch (err) {
        console.error("createDonutSlice: bindVariableKeyToPaint failed", err);
      }
    }

    return slice;
  }

  //chart data submit handler
  async function handleSubmit(chartData: ChartData) {
    //check sum > 0
    let sum: number = 0;
    chartData.data.forEach((item: ChartDataItem) => {
      sum += item.value;
    });
    if (sum <= 0) {
      figma.notify("Please enter correct value for items");
      return;
    }

    // check Theme collection by ID
    const themeColKey = teamLibrary.coreToolKit.collectionKey; // "Theme" collection key
    const libraryCollections =
      await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
    const themeColExists =
      Array.isArray(libraryCollections) &&
      !!libraryCollections.find((col: any) => col.key === themeColKey);
    if (!themeColExists) {
      figma.notify(
        "📚Hive Design Toolkit is missing. Please check Team Library."
      );
      return;
    }

    //check dataVis token exis in Theme collection
    const varsInThemeCol =
      await figma.teamLibrary.getVariablesInLibraryCollectionAsync(themeColKey);
    console.log("Variables in Theme Col:", varsInThemeCol);

    dataVisColor.forEach((colorData, index) => {
      const tokenPath = dotToSlash(colorData.key);
      const foundVar = varsInThemeCol.find((v) => {
        const name = v.name || "";
        return name === tokenPath;
      });

      if (foundVar) {
        // check if variable has key
        if (!foundVar.key) {
          console.log(`${index}: ${tokenPath} : variable has no key`);
          return;
        }
        console.log(`${index}:${tokenPath} : ${foundVar.key}`);
        // only store the variable key (simpler, lighter)
        chartData.data[index].colorToken = foundVar.key;
      } else {
        console.log(`${index}:${tokenPath} not found`);
      }
    });

    // Transform data with helper
    const transformedData: TransformedChartItem[] = transformToPercents(
      chartData.data
    );

    console.log("Transformed Data:", transformedData);

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

      const slice = await createDonutSlice(
        item.startPercent,
        item.endPercent,
        layerName,
        colorData.value,
        item.colorToken ?? null
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
    console.log("Team Lib collections:", libraryCollections);
  }

  on("SUBMIT_CHART_DATA", handleSubmit);

  on("TEST_Click", handleTest);

  // UI window size
  showUI({
    width: 360,
    height: 520,
  });
}
