import { Container, render } from "@create-figma-plugin/ui";
import { h } from "preact";
import { useState } from "preact/hooks";
import HomePage from "./pages/HomePage";
import CheckCollectionPage from "./pages/CheckCollectionPage";
import CheckNodePage from "./pages/CheckNodePage";
import CheckTokenPage from "./pages/CheckTokenPage";

type Page = "home" | "checkCollection" | "checkNode" | "checkToken";

function Plugin() {
  const [currentPage, setCurrentPage] = useState<Page>("home");

  const navigateToPage = (page: Page) => {
    setCurrentPage(page);
  };

  const navigateToHome = () => {
    setCurrentPage("home");
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage onNavigate={navigateToPage} />;
      case "checkCollection":
        return <CheckCollectionPage onBack={navigateToHome} />;
      case "checkNode":
        return <CheckNodePage onBack={navigateToHome} />;
      case "checkToken":
        return <CheckTokenPage onBack={navigateToHome} />;
      default:
        return <HomePage onNavigate={navigateToPage} />; // 默认渲染 HomePage
    }
  };

  return <Container space="medium">{renderPage()}</Container>;
}
export default render(Plugin);
