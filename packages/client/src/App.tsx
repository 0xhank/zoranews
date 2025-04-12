import { useState } from "react";
// import "./App.css"; // Removed unused CSS import
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
    // Ensure flex container takes full height
    <div className="flex flex-col min-h-screen">
      <Navigation currentPage={currentPage} onChangePage={setCurrentPage} />
      <main className="flex-grow flex flex-col">{renderPage()}</main>
    </div>
  );
}

export default App;
