// Figma operations
import { chartConfig, semanticToken, teamLibrary } from "../config";
import { bindVariableKeyToPaint, dotToSlash, splitNumber } from "../helpers";
// check Theme collection by ID
export async function checkThemeCol(colID: string) {
  const libraryCollections =
    await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
  const themeColExists =
    Array.isArray(libraryCollections) &&
    !!libraryCollections.find((col: any) => col.key === colID);
  if (!themeColExists) {
    figma.notify(
      "📚Hive Design Toolkit is missing. Please check Team Library.",
    );
    return;
  }
}
// Draw semi donut slice
export async function createSemiDonutSlice(
  startPercent: number,
  endPercent: number,
  layerName: string = "slice",
  hexColor: string = chartConfig.defaultColor,
  isFirst: Boolean = false,
  variableKey?: string | null,
): Promise<EllipseNode | null> {
  if (endPercent - startPercent <= 0) {
    return null;
  }
  const slice = figma.createEllipse();
  // if it's not the first slice, add 2px gap between slices
  let gap = isFirst ? 0 : 0.5;
  slice.name = layerName;
  slice.resize(chartConfig.size, chartConfig.size);
  slice.arcData = {
    startingAngle: -Math.PI * (1 - (startPercent + gap) / 100),
    endingAngle: -Math.PI * (1 - endPercent / 100),
    innerRadius: chartConfig.ratio,
  };
  const convertedColor = figma.util.rgb(hexColor);
  const fillColor = convertedColor;
  slice.fills = [{ type: "SOLID", color: fillColor }];
  // if variableKey（string), use bindVariableKeyToPaint
  if (variableKey && typeof variableKey === "string") {
    try {
      const boundPaint = await bindVariableKeyToPaint(
        variableKey,
        slice.fills[0] as SolidPaint,
      );
      slice.fills = [boundPaint];
    } catch (err) {
      console.error("createDonutSlice: bindVariableKeyToPaint failed", err);
    }
  }
  return slice;
}
// Draw horizontal bar
export async function createHorBar(
  startPercent: number,
  endPercent: number,
  exactPercent: number,
  layerName: string = "bar",
  hexColor: string = chartConfig.defaultColor,
  isFirst: Boolean = false,
  variableKey?: string | null,
): Promise<RectangleNode | null> {
  if (endPercent - startPercent <= 0) {
    return null;
  }
  const bar = figma.createRectangle();
  const barWidth = (exactPercent * 358) / 100 - 2;
  bar.resize(barWidth, 12);
  Object.assign(bar, {
    x: startPercent,
    name: layerName,
  });
  const convertedColor = figma.util.rgb(hexColor);
  const fillColor = convertedColor;
  bar.fills = [{ type: "SOLID", color: fillColor }];
  // if variableKey（string), use bindVariableKeyToPaint
  if (variableKey && typeof variableKey === "string") {
    try {
      const boundPaint = await bindVariableKeyToPaint(
        variableKey,
        bar.fills[0] as SolidPaint,
      );
      bar.fills = [boundPaint];
    } catch (err) {
      console.error("createHorizontalBar: bindVariableKeyToPaint failed", err);
    }
  }
  return bar;
}
//Create lengend component
export async function createLegend(
  label: string,
  value: number,
  percentage?: number | null,
  variableKey?: string | null,
): Promise<InstanceNode | null> {
  const compKey = teamLibrary.dataVis.legendBD.compKey;
  const importedComponent = await figma.importComponentByKeyAsync(compKey);
  const legend = importedComponent.createInstance();
  if (percentage) {
    let fixedPercent = percentage.toFixed(2);
    label = label + ` (${fixedPercent}%)`;
  }
  // set properties
  legend.setProperties({
    "Label text#9473:3": label,
    "Action#10519:0": false,
  });
  legend.layoutAlign = "STRETCH"; // width fill container
  //find "Shape" node with parent .Legend indicator
  const shapeNode = legend.findOne(
    (node) =>
      node.name === "Shape" && node.parent?.name === ".Legend indicator",
  );
  // if no shape or no fills, or no variableKey, return directly
  if (!shapeNode || !("fills" in shapeNode) || !variableKey) {
    return legend;
  }
  try {
    const basePaint = (shapeNode.fills as Paint[])[0] as SolidPaint;
    const boundPaint = await bindVariableKeyToPaint(variableKey, basePaint);
    shapeNode.fills = [boundPaint];
  } catch (err) {
    console.error("createLegend: bindVariableKeyToPaint failed", err);
  }
  // Set balance display value
  const bdInstance = legend.findOne((node) => node.name === "Balance display");
  if (bdInstance && bdInstance.type === "INSTANCE") {
    const { integer, decimal } = splitNumber(value);
    bdInstance.setProperties({
      "Balance integer#1942:28": integer,
      "Balance decimal#1942:40": `.${decimal}`,
    });
  }
  return legend;
}
// Create legend list
export function createLegendList() {
  const legendList = figma.createFrame();
  legendList.fills = [];
  Object.assign(legendList, {
    name: "Legends",
    layoutMode: "VERTICAL",
    primaryAxisSizingMode: "AUTO", // height = hug
    layoutAlign: "STRETCH", // width fill container
  });
  return legendList;
}
//Create total value frame
export async function createTotalValueFrame(
  sumValue: number,
  title: string,
): Promise<FrameNode | null> {
  // Create total value frame
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  const titleNode = figma.createText();
  titleNode.characters = title;
  titleNode.fills = [
    {
      type: "SOLID",
      color: figma.util.rgb(dotToSlash(chartConfig.defaultColor)),
    },
  ];
  //bind text color token
  try {
    const boundPaint = await bindVariableKeyToPaint(
      semanticToken.textPrimayColor.key,
      titleNode.fills[0] as SolidPaint,
    );
    titleNode.fills = [boundPaint];
  } catch (err) {
    console.error("balance display: bindVariableKeyToPaint failed", err);
  }
  //test text style
  try {
    titleNode.setTextStyleIdAsync(semanticToken.textQuoteStyle.key);
  } catch (err) {
    console.log("Err:", err);
  }
  //Create Balance display
  const compKey = teamLibrary.dataVis.balanceDisplay.compKey;
  const importedComponent = await figma.importComponentByKeyAsync(compKey);
  const balanceDisplay = importedComponent.createInstance();
  const { integer, decimal } = splitNumber(sumValue);
  balanceDisplay.setProperties({
    "Balance integer#1942:28": integer,
    "Balance decimal#1942:40": `.${decimal}`,
    "Code text#1942:32": "HKD",
  });
  const totalValFrame = figma.createFrame();
  totalValFrame.fills = [];
  totalValFrame.appendChild(titleNode);
  totalValFrame.appendChild(balanceDisplay);
  Object.assign(totalValFrame, {
    name: "Total value frame",
    layoutMode: "VERTICAL",
    primaryAxisSizingMode: "AUTO",
    counterAxisSizingMode: "AUTO",
    counterAxisAlignItems: "CENTER",
  });
  return totalValFrame;
}
// Draw final frame
export async function createFinalFrame() {
  const finalFrame = figma.createFrame();
  finalFrame.resize(390, 0);
  Object.assign(finalFrame, {
    name: "Chart + legend",
    x: figma.viewport.center.x,
    y: figma.viewport.center.y,
    layoutMode: "VERTICAL",
    primaryAxisSizingMode: "AUTO", //height : hug
    counterAxisSizingMode: "FIXED", // width : hug
    counterAxisAlignItems: "CENTER",
  });
  // bind gap token
  const gapVar = await figma.variables.importVariableByKeyAsync(
      semanticToken.gapNormal.key,
    ),
    paddingVar = await figma.variables.importVariableByKeyAsync(
      semanticToken.paddingNormal.key,
    );
  finalFrame.setBoundVariable("itemSpacing", gapVar);
  finalFrame.setBoundVariable("paddingTop", paddingVar);
  finalFrame.setBoundVariable("paddingBottom", paddingVar);
  //bind bg fill token
  const basePaint = (finalFrame.fills as Paint[])[0] as SolidPaint;
  const boundPaint = await bindVariableKeyToPaint(
    semanticToken.bgContainerStaticStandard.key,
    basePaint,
  );
  finalFrame.fills = [boundPaint];
  return finalFrame;
}
