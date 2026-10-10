import { Button, Container, render } from "@create-figma-plugin/ui";
import { h, Fragment } from "preact";
import { useEffect, useState } from "preact/hooks";
import HomePage from "./pages/HomePage";
import HorizontalBarPage from "./pages/HorizontalBarPage";
import LineChartPage from "./pages/LineChartPage";
import VerticalBarPage from "./pages/VerticalBarPage";
import PieDonutChartPage from "./pages/PieDonutChartPage";
import SemiDonutChartPage from "./pages/SemiDonutChartPage";
import DesignSystemConfigPage from "./pages/DesignSystemConfigPage";
import { ColorTokenSwatchProvider } from "./components/ColorChips/colorTokenSwatchContext";
import { NumberTokenValueProvider } from "./components/NumChips/numberTokenValueContext";
import { TypographyTokenValueProvider } from "./components/TypographyChips/typographyTokenValueContext";
import {
  PluginWindowResizeManager,
  usePluginWindowSize,
} from "./hooks/usePluginWindowSize";
import type { PluginPageId } from "./utils/pluginUiSize";

import { emit, on } from "@create-figma-plugin/utilities";
import type { ChartEditSession } from "./utils/chartPersistence";

export type Pages = PluginPageId;

function Plugin() {
  const [session, setSession] = useState<ChartEditSession | null>(null);
  useEffect(() => {
    const unsubscribe = on("SPIKE_CHART_OPENED", (saved: ChartEditSession) => {
      setSession(saved);
      setPage(saved.record.chartType);
    });
    emit("SPIKE_OPEN_SELECTED_CHART", true);
    return unsubscribe;
  }, []);
  const [page, setPage] = useState<Pages>("home");
  const { handleUserResize, isWindowResizable } = usePluginWindowSize(page);

  const navigateToPage = (nextPage: Pages) => {
    setSession(null);
    setPage(nextPage);
  };
  const navigateToHome = () => {
    setSession(null);
    setPage("home");
  };
  const renderPage = () => {
    switch (page) {
      case "home":
        return <Fragment><Container space="medium"><Button fullWidth secondary onClick={() => emit("SPIKE_OPEN_SELECTED_CHART", false)}>Edit selected chart · JSON spike</Button></Container><HomePage onNavigate={navigateToPage} /></Fragment>;
      case "horizontalBar":
        return <HorizontalBarPage key={session ? session.nodeId + ":" + session.record.revision : "new"} session={session} onBack={navigateToHome} />;
      case "verticalBar":
        return <VerticalBarPage onBack={navigateToHome} />;
      case "lineChart":
        return <LineChartPage key={session ? session.nodeId + ":" + session.record.revision : "new"} session={session} onBack={navigateToHome} />;
      case "pieDonutChart":
        return <PieDonutChartPage onBack={navigateToHome} />;
      case "semiDonutChart":
        return <SemiDonutChartPage onBack={navigateToHome} />;
      case "designSystemConfig":
        return <DesignSystemConfigPage onBack={navigateToHome} />;
      default:
        return <Fragment><Container space="medium"><Button fullWidth secondary onClick={() => emit("SPIKE_OPEN_SELECTED_CHART", false)}>Edit selected chart · JSON spike</Button></Container><HomePage onNavigate={navigateToPage} /></Fragment>;
    }
  };
  return (
    <ColorTokenSwatchProvider>
      <NumberTokenValueProvider>
        <TypographyTokenValueProvider>
          {isWindowResizable ? (
            <PluginWindowResizeManager
              page={page}
              onUserResize={handleUserResize}
            />
          ) : null}
          {renderPage()}
        </TypographyTokenValueProvider>
      </NumberTokenValueProvider>
    </ColorTokenSwatchProvider>
  );
}

export default render(Plugin);
