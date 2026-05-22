import { render } from "@create-figma-plugin/ui";
import { h } from "preact";
import { useState } from "preact/hooks";
import HomePage from "./pages/HomePage";
import HorizontalBarPage from "./pages/HorizontalBarPage";
import LineChartPage from "./pages/LineChartPage";
import VerticalBarPage from "./pages/VerticalBarPage";
import PieDonutChartPage from "./pages/PieDonutChartPage";
import DesignSystemConfigPage from "./pages/DesignSystemConfigPage";
import { ColorTokenSwatchProvider } from "./components/ColorChips/colorTokenSwatchContext";
import { NumberTokenValueProvider } from "./components/NumChips/numberTokenValueContext";
import { TypographyTokenValueProvider } from "./components/TypographyChips/typographyTokenValueContext";

export type Pages =
  | "home"
  | "horizontalBar"
  | "pieDonutChart"
  | "verticalBar"
  | "lineChart"
  | "designSystemConfig";

function Plugin() {
  const [page, setPage] = useState<Pages>("home");
  const navigateToPage = (page: Pages) => {
    setPage(page);
  };
  const navigateToHome = () => {
    setPage("home");
  };
  const renderPage = () => {
    switch (page) {
      case "home":
        return <HomePage onNavigate={navigateToPage} />;
      case "horizontalBar":
        return <HorizontalBarPage onBack={navigateToHome} />;
      case "verticalBar":
        return <VerticalBarPage onBack={navigateToHome} />;
      case "lineChart":
        return <LineChartPage onBack={navigateToHome} />;
      case "pieDonutChart":
        return <PieDonutChartPage onBack={navigateToHome} />;
      case "designSystemConfig":
        return <DesignSystemConfigPage onBack={navigateToHome} />;
      default:
        return <HomePage onNavigate={navigateToPage} />;
    }
  };
  return (
    <ColorTokenSwatchProvider>
      <NumberTokenValueProvider>
        <TypographyTokenValueProvider>
          {renderPage()}
        </TypographyTokenValueProvider>
      </NumberTokenValueProvider>
    </ColorTokenSwatchProvider>
  );
}

export default render(Plugin);
