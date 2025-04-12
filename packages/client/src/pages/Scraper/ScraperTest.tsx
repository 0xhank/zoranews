import type { NewsArticle } from "@zora-news/shared";
import React, { useState } from "react";
import { useNewsScraper } from "../../hooks/useNewsScraper";
import { useZoraCoins } from "../../hooks/useZoraCoins";

const ScraperTest: React.FC = () => {
  const {
    articles,
    isLoading,
    isScraping,
    scrapeNow,
    lastScrapedAt,
    articleCount,
    searchTerm,
    handleSearch,
    clearSearch,
    isSearching,
  } = useNewsScraper();

  const { createCoinFromNews, isCreatingFromNews } = useZoraCoins();

  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    null
  );

  const [creationStatus, setCreationStatus] = useState<{
    status: "idle" | "success" | "error";
    message: string;
  }>({
    status: "idle",
    message: "",
  });

  // Format date for display
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get selected article details
  const selectedArticle = articles.find(
    (article: NewsArticle) =>
      `${article.id}-${article.timestamp}` === selectedArticleId
  );

  // Handle coin creation from news article
  const handleCreateCoinFromNews = async () => {
    if (!selectedArticle) {
      setCreationStatus({
        status: "error",
        message: "Please select an article.",
      });
      return;
    }

    // Generate symbol from headline
    const headline = selectedArticle.headline;
    const words = headline.split(" ");
    const significantWords = words
      .filter((word) => word.length > 3)
      .slice(0, 3);
    const symbol =
      significantWords.map((word) => word.charAt(0).toUpperCase()).join("") ||
      "NEWS"; // Fallback symbol

    try {
      await createCoinFromNews({
        articleId: selectedArticle.id,
        symbol: symbol, // Provide the generated symbol
      });

      setCreationStatus({
        status: "success",
        message:
          "Coin creation initiated successfully based on the selected article!",
      });

      // Reset form
      setSelectedArticleId(null); // Optionally clear selection
    } catch (error) {
      console.error("Error creating coin from news:", error);
      setCreationStatus({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to create coin from news",
      });
    }
  };

  return (
    <div className="font-mono text-green-400 bg-gray-900 p-6 rounded-md border border-green-800 shadow-inner shadow-green-900/20 flex flex-col h-full">
      <h1 className="text-center text-xl font-bold mb-6 border-b border-green-800 pb-3 text-yellow-400 flex-shrink-0">
        &gt; News Scraper Interface
      </h1>

      {/* Make this div scrollable */}
      <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-green-700 scrollbar-track-gray-800 pr-2 -mr-2">
        {/* Status and Controls */}
        <div className="bg-gray-800 rounded-md p-4 mb-6 border border-green-700 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold mb-2 text-blue-400">
                ## Scraper Status
              </h2>
              <p className="text-green-500">
                Last scraped:{" "}
                <span className="font-medium text-yellow-300">
                  {formatDate(lastScrapedAt)}
                </span>
              </p>
              <p className="text-green-500">
                Articles in cache:{" "}
                <span className="font-medium text-yellow-300">
                  {articleCount}
                </span>
              </p>
            </div>

            <div className="mt-4 md:mt-0">
              <button
                onClick={() => scrapeNow()}
                disabled={isScraping}
                className={`px-4 py-2 rounded-md font-medium border border-green-600 transition-colors duration-150 ${
                  isScraping
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-green-700 text-black hover:bg-green-600 active:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                }`}
              >
                {isScraping ? "Running scrape..." : "[ Scrape Now ]"}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4 flex">
            <span className="px-2 py-2 bg-gray-700 border border-r-0 border-green-700 rounded-l-md text-yellow-400">
              $
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="grep articles..."
              className="flex-grow px-4 py-2 border border-green-700 bg-gray-800 text-green-400 focus:outline-none focus:ring-1 focus:ring-yellow-500 placeholder-gray-500"
            />
            {isSearching && (
              <button
                onClick={clearSearch}
                className="bg-red-700 text-black px-4 py-2 rounded-r-md hover:bg-red-600 border border-l-0 border-red-600"
              >
                Clear
              </button>
            )}
            {!isSearching && (
              <span className="px-2 py-2 bg-gray-700 border border-l-0 border-green-700 rounded-r-md text-yellow-400">
                ↵
              </span>
            )}
          </div>
        </div>

        {/* Article List & Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Article List Panel */}
          <div className="bg-gray-800 rounded-md p-4 border border-green-700 shadow-md">
            <h2 className="text-lg font-semibold mb-4 text-blue-400 border-b border-green-800 pb-2">
              ## {isSearching ? "Search Results" : "Available Articles"}
              {isSearching && (
                <span className="ml-2 text-sm text-yellow-400">
                  ({articles.length} results)
                </span>
              )}
            </h2>

            {isLoading ? (
              <div className="text-center py-8 text-yellow-500 animate-pulse">
                Loading articles...
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {isSearching
                  ? "No articles match grep pattern"
                  : "No articles found in cache"}
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[55vh] pr-2 scrollbar-thin scrollbar-thumb-green-700 scrollbar-track-gray-700">
                {articles.map((article: NewsArticle) => (
                  <div
                    key={`${article.id}-${article.timestamp}`}
                    className={`p-3 mb-2 border rounded-md cursor-pointer transition-colors duration-150 ${
                      selectedArticleId === `${article.id}-${article.timestamp}`
                        ? "bg-green-900 border-green-500 ring-1 ring-green-400"
                        : "hover:bg-gray-700 border-green-800 hover:border-green-600"
                    }`}
                    onClick={() =>
                      setSelectedArticleId(`${article.id}-${article.timestamp}`)
                    }
                  >
                    <h3 className="font-medium text-green-300 truncate">
                      {article.headline}
                    </h3>
                    <p className="text-sm text-gray-400 truncate">
                      {article.summary || "No summary available."}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Article Details and Coin Creation Panel */}
          <div className="bg-gray-800 rounded-md p-4 border border-green-700 shadow-md">
            <h2 className="text-lg font-semibold mb-4 text-blue-400 border-b border-green-800 pb-2">
              ## Article Details
            </h2>

            {selectedArticle ? (
              <div>
                <h3 className="text-md font-semibold text-yellow-300 mb-2">
                  {selectedArticle.headline}
                </h3>
                <p className="text-green-400 mb-4 text-sm">
                  {selectedArticle.summary || "Summary not available."}
                </p>

                <div className="flex flex-col space-y-1 text-xs mb-4 border-t border-b border-green-800 py-3">
                  <p className="text-gray-400">
                    <span className="font-medium text-cyan-400">ID:</span>{" "}
                    {selectedArticle.id}
                  </p>
                  <p className="text-gray-400">
                    <span className="font-medium text-cyan-400">
                      Published:
                    </span>{" "}
                    {formatDate(selectedArticle.timestamp)}
                  </p>
                  <a
                    href={selectedArticle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline inline-block mt-2 hover:text-blue-400"
                  >
                    cat full_article.txt →
                  </a>
                </div>

                <div className="mt-4 p-3 bg-gray-900 rounded-md border border-green-800">
                  <h4 className="font-medium mb-3 text-yellow-400">
                    ### Create Zora Coin
                  </h4>

                  <div className="space-y-3">
                    <div className="flex space-x-3">
                      <button
                        onClick={handleCreateCoinFromNews}
                        disabled={isCreatingFromNews}
                        className={`px-4 py-2 rounded-md font-medium border border-green-600 transition-colors duration-150 text-sm ${
                          isCreatingFromNews
                            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                            : "bg-green-700 text-black hover:bg-green-600 active:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                        }`}
                      >
                        {isCreatingFromNews
                          ? "Executing..."
                          : "[ Create Coin ]"}
                      </button>
                    </div>

                    {creationStatus.status !== "idle" && (
                      <div
                        className={`mt-3 p-2 rounded-md text-sm border ${
                          creationStatus.status === "success"
                            ? "bg-green-900 border-green-700 text-green-300"
                            : "bg-red-900 border-red-700 text-red-300"
                        }`}
                      >
                        <span className="font-bold">
                          {creationStatus.status === "success"
                            ? "Success:"
                            : "Error:"}{" "}
                        </span>
                        {creationStatus.message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Select an article to view details...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScraperTest;
