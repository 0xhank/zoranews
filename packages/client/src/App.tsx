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
    <div className="flex flex-col min-h-screen">
      <Navigation currentPage={currentPage} onChangePage={setCurrentPage} />
      <main className="flex-grow">{renderPage()}</main>
    </div>
  );
}

export default App;
