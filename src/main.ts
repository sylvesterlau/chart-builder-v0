import { on, showUI } from "@create-figma-plugin/utilities";
import { chartConfig, dataVisColor, teamLibrary } from "./config";
import {
  dotToSlash,
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
  //create lengend component
  async function createLegend(
    label: string,
    value: string,
    variableKey?: string | null
  ) {
    const compKey = teamLibrary.dataVis.legend.compKey;
    let importedComponent = await figma.importComponentByKeyAsync(compKey);
    let legend = importedComponent.createInstance();
    //set properties
    legend.setProperties({ "Label text#9473:3": label });
    legend.setProperties({ "Value text#1734:2": value });
    //find rect node
    const indicatorLayerName = ".Legend indicator"; //Layer name for indicator
    const shapeLayerName = "Shape";
    const indicatorNode = legend.findOne(
      (node) => node.name === indicatorLayerName
    );
    var shapeNode;
    if (indicatorNode && indicatorNode.type === "INSTANCE") {
      shapeNode = indicatorNode.findOne((node) => node.name === shapeLayerName);
      if (shapeNode && "fills" in shapeNode) {
        //found Shape in .Legend indicator
        const newFills = JSON.parse(JSON.stringify(shapeNode.fills));
        if (variableKey && typeof variableKey === "string") {
          try {
            const boundPaint = await bindVariableKeyToPaint(
              variableKey,
              newFills[0] as SolidPaint
            );
            shapeNode.fills = [boundPaint];
          } catch (err) {
            console.error(
              "createDonutSlice: bindVariableKeyToPaint failed",
              err
            );
          }
        }
      }
    }
    return legend;
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
        // console.log(`${index}:${tokenPath} : ${foundVar.key}`);
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
    // console.log("Transformed Data:", transformedData);
    // create chart frame to hold slices
    const chartFrame = figma.createFrame();
    chartFrame.name = chartConfig.name;
    chartFrame.resize(chartConfig.size, chartConfig.size / 2);
    chartFrame.x = figma.viewport.center.x - chartConfig.size / 2;
    chartFrame.y = figma.viewport.center.y - chartConfig.size / 2;
    //create legend frame
    const legendList = figma.createFrame();
    legendList.name = "Legends";
    legendList.x = chartFrame.x;
    legendList.y = chartFrame.y + 159;
    legendList.layoutMode = "VERTICAL";
    legendList.primaryAxisSizingMode = "AUTO"; //height = hug
    legendList.counterAxisSizingMode = "AUTO"; // width = hug
    // use indexed for loop (compatible with older TS targets)
    for (let i = 0; i < transformedData.length; i++) {
      const item = transformedData[i];
      const layerName = `${item.label} (${item.value})`;
      const colorData = dataVisColor[i % dataVisColor.length];
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
        chartFrame.appendChild(slice);
      }
      //create legend
      const legend = await createLegend(
        item.label,
        item.value.toString(),
        item.colorToken ?? null
      );
      if (legend) {
        legendList.appendChild(legend);
      }
    }
    //create final frame
    const finalFrame = figma.createFrame();
    finalFrame.name = "Semi-donut chart + legend";
    finalFrame.x = figma.viewport.center.x;
    finalFrame.y = figma.viewport.center.y;
    finalFrame.layoutMode = "VERTICAL";
    finalFrame.primaryAxisSizingMode = "AUTO"; //height = hug
    finalFrame.counterAxisSizingMode = "AUTO"; // width = hug
    finalFrame.counterAxisAlignItems = "CENTER";
    finalFrame.appendChild(chartFrame);
    finalFrame.appendChild(legendList);
    figma.currentPage.appendChild(finalFrame);
    figma.currentPage.selection = [finalFrame];
    figma.viewport.scrollAndZoomIntoView([finalFrame]);
  }
  // check library key
  async function handleInspectLibKey() {
    const libraryCollections =
      await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
    console.log("Team Lib collections:", libraryCollections);
  }
  //check component key
  async function handleInspectCompKey() {
    //read node info
    const selection = figma.currentPage.selection[0];
    if (selection && selection.type === "INSTANCE") {
      const comp = await selection.getMainComponentAsync();
      const instanceProps = selection.componentProperties;
      console.log("Comp: ", comp);
      console.log("instance props: ", instanceProps);
    } else {
      console.log("Node info:", selection);
    }
  }
  on("SUBMIT_CHART_DATA", handleSubmit);
  on("INSPECT_LIBRARY", handleInspectLibKey);
  on("INSPECT_COMP", handleInspectCompKey);
  on("CREATE_INSTANCE", () => {
    console.log(createLegend("Name", "123"));
  });
  // UI window size
  showUI({
    width: 360,
    height: 520,
  });
}
