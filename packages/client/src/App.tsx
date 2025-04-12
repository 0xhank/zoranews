import { useState } from "react";
import "./App.css";
import Navigation from "./components/Navigation";
import Dashboard from "./pages/Dashboard";
import ScraperTest from "./pages/Scraper";

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "scraper":
        return <ScraperTest />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <Navigation currentPage={currentPage} onChangePage={setCurrentPage} />
      <main className="h-full">{renderPage()}</main>
    </div>
  );
}

export default App;
