import React from "react";
import ZoraCoinsDisplay from "../components/ZoraCoinsDisplay";
import { useNews } from "../hooks/useNews";
import { useZoraCoins } from "../hooks/useZoraCoins";

const Dashboard: React.FC = () => {
  const { allNews } = useNews();
  const { getTopCoins } = useZoraCoins();

  // Fetch top coins
  const { data: topCoinsData, isLoading: isLoadingCoins } = getTopCoins(6);

  // Handle coin creation
  const handleGenerateCoin = async (newsId: string) => {
    const newsItem = allNews.find((news) => news.id === newsId);
    if (!newsItem) return;

    // In a real app, you'd want to handle this more robustly
    // This is just a placeholder implementation
    alert(`Will generate Zora coin based on: ${newsItem.headline}`);
  };

  return (
    <div className="p-8 font-sans bg-gray-100 min-h-screen">
      <h1 className="text-center text-gray-800 mb-8 text-4xl font-bold">
        News-Driven Zora Coin Dashboard
      </h1>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* News Section - Takes 2/3 of the width on large screens */}
        <div className="lg:col-span-2">
          <h2 className="text-gray-700 border-b-2 border-gray-300 pb-2 mb-6 text-2xl font-semibold">
            Trending News Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[700px] overflow-y-auto pb-4">
            {allNews.map((news) => (
              <div
                key={news.id}
                className="bg-white rounded-lg p-6 shadow-md transition-transform transform hover:-translate-y-1 hover:shadow-lg"
              >
                <h3 className="text-blue-700 mb-2 text-xl font-semibold">
                  {news.headline}
                </h3>
                <p className="mb-4 text-gray-600 text-sm">{news.summary}</p>
                <div className="flex justify-between items-center">
                  <a
                    href={news.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 hover:underline font-bold text-sm"
                  >
                    Read More
                  </a>
                  <button
                    onClick={() => handleGenerateCoin(news.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600"
                  >
                    Generate Coin
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zora Coins Section - Takes 1/3 of the width on large screens */}
        <div className="lg:col-span-1">
          <ZoraCoinsDisplay
            coins={topCoinsData?.data?.coins}
            isLoading={isLoadingCoins}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
