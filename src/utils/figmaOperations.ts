// Figma operations
import {
  chartBackground,
  chartGeneralConfig,
  textResizingConfig,
} from "../config";
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
  name: string = "Chart",
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

// Fix text resizing at 100% for the frame and its inheriting children.
export async function apply100PercentTextResizing(
  frame: FrameNode,
): Promise<void> {
  try {
    const collection = await figma.variables.getVariableCollectionByIdAsync(
      textResizingConfig.collectionId,
    );
    if (!collection) {
      throw new Error("Text Resizing collection is unavailable");
    }
    if (
      !collection.modes.some(
        (mode) => mode.modeId === textResizingConfig.mode100PercentId,
      )
    ) {
      throw new Error("Text Resizing 100% mode is unavailable");
    }
    frame.setExplicitVariableModeForCollection(
      collection,
      textResizingConfig.mode100PercentId,
    );
  } catch (error) {
    console.warn(`Could not set ${frame.name} to 100% text resizing:`, error);
  }
}
