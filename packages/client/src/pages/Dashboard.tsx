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
    <div className="flex flex-col h-full bg-black text-green-400 font-mono p-4">
      {/* Header */}
      <header className="mb-4 border-b border-green-800 pb-2">
        <h1 className="text-2xl font-bold">[ Zora News Terminal ]</h1>
        {/* Could add user info or connection status here */}
        {/* <ProfileDisplay /> */}
      </header>

      {/* Tab Navigation */}
      <nav className="flex mb-4">
        <button
          onClick={() => setActiveTab("scraper")}
          className={`px-4 py-2 mr-2 ${
            activeTab === "scraper"
              ? "bg-green-700 text-black"
              : "bg-gray-800 text-green-400 hover:bg-green-900"
          } border border-green-800 rounded-t-md focus:outline-none`}
        >
          ~/news-scraper
        </button>
        <button
          onClick={() => setActiveTab("zora")}
          className={`px-4 py-2 ${
            activeTab === "zora"
              ? "bg-green-700 text-black"
              : "bg-gray-800 text-green-400 hover:bg-green-900"
          } border border-green-800 rounded-t-md focus:outline-none`}
        >
          ~/zora-coins
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow overflow-y-auto border border-green-800 rounded-b-md rounded-tr-md p-4 bg-gray-900 shadow-inner shadow-green-900/30">
        {activeTab === "scraper" && <ScraperTest />}
        {activeTab === "zora" && <ZoraCoinsDisplay />}
      </main>
    </div>
  );
};

export default Dashboard;
