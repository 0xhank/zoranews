import React, { useState } from "react";
// import NewsFeed from "../components/NewsFeed"; // Commented out - Component not found
// import CoinCreator from "../components/CoinCreator"; // Commented out - Component not found
import type { NewsArticle } from "@zora-news/shared";
import ZoraCoinsDisplay from "../components/ZoraCoinsDisplay";
import ZoraProfileDisplay from "../components/ZoraProfileDisplay";
// import { useZoraCoins } from "../hooks/useZoraCoins"; // Not currently needed

const Dashboard: React.FC = () => {
  // const { allNews } = useNews(); // Keep hook import, but comment out usage if not needed
  // const { getTopCoins } = useZoraCoins(); // Not needed for this layout

  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(
    null
  );
  // const [searchTerm, setSearchTerm] = useState(''); // Not used currently

  // Fetch top coins - Commented out as ZoraCoinsDisplay might handle its own fetching now?
  // const { data: topCoinsData, isLoading: isLoadingCoins } = getTopCoins(6);

  // Handle article selection - Dummy function if NewsFeed is removed
  const handleArticleSelect = (article: NewsArticle) => {
    setSelectedArticle(article);
    console.log("Selected Article (Dummy):", article);
  };

  // Handle coin creation - Dummy function if CoinCreator is removed
  const handleGenerateCoin = (articleId: string) => {
    console.log("Generate Coin Clicked (Dummy) for ID:", articleId);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Panel: Placeholder for News Feed */}
      <div className="w-1/3 overflow-y-auto p-4 border-r">
        <h2 className="text-xl font-semibold mb-4">Trending News</h2>
        {/* <NewsFeed onArticleSelect={handleArticleSelect} /> */}
        <p className="text-gray-500">News feed component placeholder.</p>
        {/* Example button to simulate article selection */}
        <button
          onClick={() =>
            handleArticleSelect({
              id: "dummy-123",
              headline: "Example Headline for Testing",
              summary: "This is a summary.",
              url: "#",
              timestamp: new Date().toISOString(),
            })
          }
          className="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Select Example Article
        </button>
      </div>

      {/* Right Panel: Coin Creator and Display */}
      <div className="w-2/3 overflow-y-auto p-4">
        {/* Display Selected Article */}
        {selectedArticle && (
          <div className="mb-4 p-4 border rounded shadow-sm bg-white">
            <h3 className="text-lg font-semibold mb-2">
              Selected Article for Coin Creation
            </h3>
            <h4 className="font-medium">{selectedArticle.headline}</h4>
            <p className="text-sm text-gray-600 mb-2">
              {selectedArticle.summary}
            </p>
            <a
              href={selectedArticle.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline text-xs"
            >
              Read More
            </a>
            {/* Placeholder button for CoinCreator action */}
            <button
              onClick={() => handleGenerateCoin(selectedArticle.id)}
              className="ml-4 mt-2 p-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            >
              Generate Coin (Placeholder)
            </button>
          </div>
        )}

        {/* Placeholder for Coin Creator */}
        {/* <CoinCreator selectedArticleId={selectedArticle?.id} /> */}
        <div className="mb-4 p-4 border rounded shadow-sm bg-gray-50">
          Coin creator component placeholder.
        </div>

        {/* Divider */}
        <hr className="my-6" />

        {/* Profile Display */}
        <ZoraProfileDisplay />

        {/* Zora Coins Display */}
        <ZoraCoinsDisplay
        // filterIdentifier={searchTerm} // Removed prop
        />
      </div>
    </div>
  );
};

export default Dashboard;
