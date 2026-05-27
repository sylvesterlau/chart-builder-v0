// Figma operations
import { chartBackground, chartGeneralConfig } from "../config";
import { applyColorTokenToFills } from "./applyColorToken";

// check Theme collection by ID
export async function checkThemeCol(colID: string) {
  const libraryCollections =
    await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
  const themeColExists =
    Array.isArray(libraryCollections) &&
    !!libraryCollections.find((col: { key: string }) => col.key === colID);
  if (!themeColExists) {
    figma.notify(
      "📚Hive Design Toolkit is missing. Please check Team Library.",
    );
    return;
  }
}

// Draw final frame
export async function createFinalFrame(
  frameWidth: number = chartGeneralConfig.frameWidth,
  name: string = "Chart + legend",
): Promise<FrameNode> {
  const finalFrame = figma.createFrame();
  finalFrame.resize(frameWidth, 0);
  Object.assign(finalFrame, {
    name,
    x: figma.viewport.center.x,
    y: figma.viewport.center.y,
    layoutMode: "VERTICAL",
    primaryAxisSizingMode: "AUTO", //height : hug
    counterAxisSizingMode: "FIXED", // width : hug
    counterAxisAlignItems: "CENTER",
    itemSpacing: 0,
    paddingTop: 0,
    paddingBottom: 0,
  });
  await applyColorTokenToFills(finalFrame, chartBackground);
  return finalFrame;
}
