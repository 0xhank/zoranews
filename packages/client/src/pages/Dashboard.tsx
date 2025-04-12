import React, { useState } from "react";
// import NewsFeed from "../components/NewsFeed"; // Commented out - Component not found
// import CoinCreator from "../components/CoinCreator"; // Commented out - Component not found
import ZoraCoinsDisplay from "../components/ZoraCoinsDisplay";
import ScraperTest from "./Scraper";
// import { useZoraCoins } from "../hooks/useZoraCoins"; // Not currently needed

const Dashboard: React.FC = () => {
  // const { allNews } = useNews(); // Keep hook import, but comment out usage if not needed
  // const { getTopCoins } = useZoraCoins(); // Not needed for this layout

  // const [searchTerm, setSearchTerm] = useState(''); // Not used currently

  // Fetch top coins - Commented out as ZoraCoinsDisplay might handle its own fetching now?
  // const { data: topCoinsData, isLoading: isLoadingCoins } = getTopCoins(6);

  const [activeTab, setActiveTab] = useState<"scraper" | "zora">("scraper");

  return (
    <div className="flex flex-col flex-grow bg-gray-50 p-6">
      {/* Header - Simplified with bottom border */}
      <header className="mb-6 border-b border-gray-200 pb-4">
        <h1 className="text-xl font-semibold text-gray-900">
          Zora News Dashboard
        </h1>
        {/* Optional: Add description or subtitle */}
        {/* <p className="text-sm text-gray-500">Monitor news and manage coins</p> */}
      </header>

      {/* Tab Navigation - Modern style */}
      <nav className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("scraper")}
          className={`px-4 py-2 -mb-px border-b-2 text-sm font-medium transition-colors duration-150 focus:outline-none ${
            activeTab === "scraper"
              ? "border-blue-500 text-blue-600" // Active tab style
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" // Inactive tab style
          }`}
        >
          News Scraper
        </button>
        <button
          onClick={() => setActiveTab("zora")}
          className={`px-4 py-2 -mb-px ml-4 border-b-2 text-sm font-medium transition-colors duration-150 focus:outline-none ${
            activeTab === "zora"
              ? "border-blue-500 text-blue-600" // Active tab style
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" // Inactive tab style
          }`}
        >
          Zora Coins
        </button>
      </nav>

      {/* Main Content Area - Simplified background and padding, let content handle specifics */}
      {/* Removed explicit border and shadow, added flex-grow to allow content like ScraperTest to manage its own height */}
      <main className="flex-grow overflow-y-auto">
        {activeTab === "scraper" && <ScraperTest />}
        {activeTab === "zora" && <ZoraCoinsDisplay />}
      </main>
    </div>
  );
};

export default Dashboard;
