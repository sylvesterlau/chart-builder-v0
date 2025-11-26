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

  return (
    <Container space="medium">
      {currentPage === "home" && <HomePage onNavigate={navigateToPage} />}
      {currentPage === "checkCollection" && (
        <CheckCollectionPage onBack={navigateToHome} />
      )}
      {currentPage === "checkNode" && <CheckNodePage onBack={navigateToHome} />}
      {currentPage === "checkToken" && (
        <CheckTokenPage onBack={navigateToHome} />
      )}
    </Container>
  );
}
export default render(Plugin);
