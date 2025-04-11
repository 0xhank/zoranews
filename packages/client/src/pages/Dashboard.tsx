import React from "react";
import { useMemecoin } from "../hooks/useMemecoin";
import { useNews } from "../hooks/useNews";

const Dashboard: React.FC = () => {
  const { allNews, isLoading: newsLoading } = useNews();
  const {
    allMemecoins,
    isLoading: memecoinsLoading,
    generateMemecoin,
  } = useMemecoin();
  const generateMutation = generateMemecoin();

  const handleGenerateMemecoin = (newsId: string) => {
    generateMutation.mutate({
      newsId,
      customName: `News-${newsId}-Coin`,
      customSymbol: `N${newsId}C`,
    });
  };

  if (newsLoading || memecoinsLoading) {
    return (
      <div className="p-8 font-sans bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading data...</div>
      </div>
    );
  }

  return (
    <div className="p-8 font-sans bg-gray-100 min-h-screen">
      <h1 className="text-center text-gray-800 mb-8 text-4xl font-bold">
        News-Driven Memecoin Dashboard
      </h1>

      {/* News Section */}
      <h2 className="text-gray-700 border-b-2 border-gray-300 pb-2 mt-10 mb-6 text-2xl font-semibold">
        Trending News Articles
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                onClick={() => handleGenerateMemecoin(news.id)}
                className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600"
              >
                Generate Coin
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Memecoin Section */}
      <h2 className="text-gray-700 border-b-2 border-gray-300 pb-2 mt-10 mb-6 text-2xl font-semibold">
        Generated Memecoins
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allMemecoins.map((coin) => (
          <div
            key={coin.id}
            className="bg-white rounded-lg p-6 shadow-md transition-transform transform hover:-translate-y-1 hover:shadow-lg text-center"
          >
            <div className="w-20 h-20 rounded-full mb-4 bg-gray-200 inline-block">
              {/* Placeholder for image */}
              {coin.logoUrl && (
                <img
                  src={coin.logoUrl}
                  alt={coin.name}
                  className="w-full h-full rounded-full object-cover"
                />
              )}
            </div>
            <h3 className="text-green-600 mb-2 text-xl font-semibold">
              {coin.name} ({coin.symbol})
            </h3>
            <p className="mb-4 text-gray-600 text-sm">{coin.description}</p>
            <small className="block mt-4 text-gray-500 italic text-xs">
              Inspired by: {coin.basedOn}
            </small>
          </div>
        ))}

        {/* Show newly generated memecoin if exists */}
        {generateMutation.data && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 shadow-md text-center">
            <div className="w-20 h-20 rounded-full mb-4 bg-gray-200 inline-block">
              {generateMutation.data.logoUrl && (
                <img
                  src={generateMutation.data.logoUrl}
                  alt={generateMutation.data.name}
                  className="w-full h-full rounded-full object-cover"
                />
              )}
            </div>
            <h3 className="text-green-600 mb-2 text-xl font-semibold">
              {generateMutation.data.name} ({generateMutation.data.symbol})
            </h3>
            <p className="mb-4 text-gray-600 text-sm">
              {generateMutation.data.description}
            </p>
            <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded inline-block">
              Newly Generated!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
