// Figma operations
import { chartBackground } from "../config";

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

// Draw final frame
export function createFinalFrame() {
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
    itemSpacing: 0,
    paddingTop: 16,
    paddingBottom: 16,
  });
  finalFrame.fills = [
    {
      type: "SOLID",
      color: figma.util.rgb(chartBackground.value),
    },
  ];
  return finalFrame;
}
