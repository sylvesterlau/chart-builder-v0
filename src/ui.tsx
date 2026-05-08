import { render } from "@create-figma-plugin/ui";
import { h } from "preact";
import { useState } from "preact/hooks";
import HomePage from "./pages/HomePage";
import HorizontalBarPage from "./pages/HorizontalBarPage";
import UtilPage from "./pages/UtilPage";
import PieDonutChartPage from "./pages/PieDonutChartPage";
export type Pages =
  | "home"
  | "horizontalBar"
  | "pieDonutChart"
  | "util";
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
      case "pieDonutChart":
        return <PieDonutChartPage onBack={navigateToHome} />;
      case "util":
        return <UtilPage onBack={navigateToHome} />;
      default:
        return <HomePage onNavigate={navigateToPage} />;
    }
  };
  return renderPage();
}
export default render(Plugin);
