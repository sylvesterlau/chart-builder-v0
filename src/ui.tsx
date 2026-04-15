import { render } from "@create-figma-plugin/ui";
import { h } from "preact";
import { useState } from "preact/hooks";
import HomePage from "./pages/HomePage";
import SemiDonutPage from "./pages/SemiDonutPage";
import HorizontalBarPage from "./pages/HorizontalBarPage";
export type Pages = "home" | "semiDonut" | "horizontalBar";
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
      default:
        return <HomePage onNavigate={navigateToPage} />;
    }
  };
  return renderPage();
}
export default render(Plugin);
