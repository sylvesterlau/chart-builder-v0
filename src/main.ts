import { on, showUI } from "@create-figma-plugin/utilities";
import { chartConfig, dataVisColor, teamLibrary } from "./config";
import { dotToSlash, bindVariableKeyToPaint } from "./helpers";
// types for chart data
interface ChartDataItem {
  label: string;
  value: number;
  colorToken?: string | null;
}
interface ChartData {
  data: ChartDataItem[];
}
export default function () {
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
      console.log("Comp key: ", comp?.key);
      console.log("instance props: ", instanceProps);
    } else {
      console.log("Node info:", selection);
    }
  }

  // token lookup handler
  async function handleTokenLookup(tokenPath: string) {
    try {
      const themeColKey = teamLibrary.coreToolKit.collectionKey;
      const varsInThemeCol =
        await figma.teamLibrary.getVariablesInLibraryCollectionAsync(
          themeColKey
        );

      // Convert token path to slash format for matching
      const searchPath = dotToSlash(tokenPath);

      const foundVar = varsInThemeCol.find((v) => {
        const name = v.name || "";
        return name === searchPath;
      });

      if (foundVar && foundVar.key) {
        figma.notify(`Token found: ${foundVar.key}`);
        console.log(`Token "${tokenPath}" -> Key: ${foundVar.key}`);
      } else {
        figma.notify(`Token "${tokenPath}" not found in theme collection`);
        console.log(
          `Available tokens:`,
          varsInThemeCol.map((v) => v.name)
        );
      }
    } catch (err) {
      console.error("Token lookup failed:", err);
      figma.notify("Token lookup failed. Check console for details.");
    }
  }

  on("INSPECT_LIBRARY", handleInspectLibKey);
  on("INSPECT_COMP", handleInspectCompKey);
  on("LOOKUP_TOKEN", handleTokenLookup);
  // UI window size
  showUI({
    width: 360,
    height: 520,
  });
}
