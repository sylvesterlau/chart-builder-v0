import { render } from "@create-figma-plugin/ui";
import { h } from "preact";
import { useState } from "preact/hooks";
import HomePage from "./pages/HomePage";
import SemiDonutPage from "./pages/SemiDonutPage";
import HorizontalBarPage from "./pages/HorizontalBarPage";
import VerticalBarPage from "./pages/VerticalBarPage";
import UtilPage from "./pages/UtilPage";
export type Pages =
  | "home"
  | "semiDonut"
  | "horizontalBar"
  | "verticalBar"
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
      case "semiDonut":
        return <SemiDonutPage onBack={navigateToHome} />;
      case "horizontalBar":
        return <HorizontalBarPage onBack={navigateToHome} />;
      case "verticalBar":
        return <VerticalBarPage onBack={navigateToHome} />;
      case "util":
        return <UtilPage onBack={navigateToHome} />;
      default:
        return <HomePage onNavigate={navigateToPage} />;
    }
  };
  return renderPage();
}
export default render(Plugin);
