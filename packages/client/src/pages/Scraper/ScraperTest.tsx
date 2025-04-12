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
    return date.toLocaleString(undefined, {
      // Use locale-aware formatting
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // Get selected article details
  const selectedArticle = articles.find(
    (article) => `${article.id}-${article.timestamp}` === selectedArticleId
  );

  // Handle coin creation from news article
  const handleCreateCoinFromNews = async () => {
    if (!selectedArticle) {
      setCreationStatus({
        status: "error",
        message: "Please select an article first.",
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
      "NEWS";

    try {
      await createCoinFromNews({
        articleId: selectedArticle.id,
        symbol: symbol,
      });

      setCreationStatus({
        status: "success",
        message: `Coin creation for symbol '${symbol}' initiated successfully!`,
      });
      setSelectedArticleId(null);
    } catch (error) {
      console.error("Error creating coin from news:", error);
      setCreationStatus({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to initiate coin creation.",
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Status and Controls */}
      <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-800">
              Scraper Status
            </h2>
            <p className="text-sm text-gray-600">
              Last scraped:{" "}
              <span className="font-medium text-gray-900">
                {formatDate(lastScrapedAt)}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              Articles in cache:{" "}
              <span className="font-medium text-gray-900">{articleCount}</span>
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            <button
              onClick={() => scrapeNow()}
              disabled={isScraping}
              className={`px-4 py-2 rounded-md font-medium text-sm border transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 ${
                isScraping
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300"
                  : "bg-blue-600 text-white hover:bg-blue-700 border-blue-600 active:bg-blue-800"
              }`}
            >
              {isScraping ? "Running Scrape..." : "Scrape Now"}
            </button>
          </div>
        </div>

        {/* Search - Modern input group */}
        <div className="mt-4 flex relative">
          {/* Optional: Add a search icon */}
          {/* <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"> <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /> </svg>
          </span> */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search articles..."
            className={`flex-grow pl-4 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
              isSearching ? "rounded-r-none" : ""
            }`} // Adjust rounding if clear button is present
          />
          {isSearching && (
            <button
              onClick={clearSearch}
              className="bg-gray-200 text-gray-600 px-3 py-2 text-sm rounded-r-md hover:bg-gray-300 border border-l-0 border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500" // Adjusted offset
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
          {/* Removed terminal style $ prefix and ↵ suffix */}
        </div>
      </div>

      {/* Article List & Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
        {" "}
        {/* Added flex-grow and min-h-0 here */}
        {/* Article List Panel - Added overflow-y-auto here */}
        <div className="bg-white rounded-lg border border-gray-200 flex flex-col">
          <h2 className="text-lg font-semibold p-4 text-gray-800 border-b border-gray-200 flex-shrink-0">
            {isSearching ? "Search Results" : "Available Articles"}
            {isSearching && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({articles.length} found)
              </span>
            )}
          </h2>

          {isLoading ? (
            <div className="flex-grow flex items-center justify-center text-gray-500">
              Loading articles...
            </div>
          ) : articles.length === 0 ? (
            <div className="flex-grow flex items-center justify-center text-gray-500 p-6 text-center">
              {isSearching
                ? "No articles match your search."
                : "No articles found. Try scraping first."}
            </div>
          ) : (
            // Make this div scrollable, remove custom scrollbar styles
            <div className="overflow-y-auto flex-grow p-4 space-y-2">
              {articles.map((article) => (
                <div
                  key={`${article.id}-${article.timestamp}`}
                  className={`p-3 border rounded-md cursor-pointer transition-colors duration-150 ${
                    selectedArticleId === `${article.id}-${article.timestamp}`
                      ? "bg-blue-50 border-blue-300 ring-1 ring-blue-300" // Subtle selection
                      : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300" // Standard item
                  }`}
                  onClick={() =>
                    setSelectedArticleId(`${article.id}-${article.timestamp}`)
                  }
                >
                  {/* Improved typography */}
                  <h3 className="font-medium text-sm text-gray-800 truncate">
                    {article.headline}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">
                    {article.summary || "No summary available."}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Article Details and Coin Creation Panel - Added overflow-y-auto here */}
        <div className="bg-white rounded-lg border border-gray-200 flex flex-col">
          <h2 className="text-lg font-semibold p-4 text-gray-800 border-b border-gray-200 flex-shrink-0">
            Article Details & Actions
          </h2>

          {/* Make content scrollable */}
          <div className="overflow-y-auto flex-grow p-4">
            {selectedArticle ? (
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  {selectedArticle.headline}
                </h3>
                <p className="text-gray-700 mb-4 text-sm">
                  {selectedArticle.summary || "Summary not available."}
                </p>

                <div className="space-y-1 text-xs text-gray-500 mb-4 border-t border-gray-200 pt-3">
                  <p>
                    <span className="font-medium text-gray-600">ID:</span>{" "}
                    {selectedArticle.id}
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">
                      Published:
                    </span>{" "}
                    {formatDate(selectedArticle.timestamp)}
                  </p>
                  <a
                    href={selectedArticle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline inline-block pt-1 text-xs font-medium" // Use accent color for link
                  >
                    Read Full Article &rarr; {/* Cleaner link text */}
                  </a>
                </div>

                {/* Coin Creation Section - cleaner card */}
                <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                  <h4 className="font-medium mb-3 text-gray-800 text-sm">
                    Create Zora Coin from Article
                  </h4>

                  <div className="space-y-3">
                    <button
                      onClick={handleCreateCoinFromNews}
                      disabled={isCreatingFromNews}
                      className={`w-full px-4 py-2 rounded-md font-medium text-sm border transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 ${
                        isCreatingFromNews
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300"
                          : "bg-blue-600 text-white hover:bg-blue-700 border-blue-600 active:bg-blue-800"
                      }`}
                    >
                      {isCreatingFromNews ? "Initiating..." : "Create Coin"}
                    </button>

                    {creationStatus.status !== "idle" && (
                      <div
                        className={`mt-3 p-3 rounded-md text-sm border ${
                          creationStatus.status === "success"
                            ? "bg-green-50 border-green-200 text-green-800" // Success style
                            : "bg-red-50 border-red-200 text-red-800" // Error style
                        }`}
                      >
                        <span className="font-semibold">
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
              <div className="text-center py-8 text-gray-500 text-sm">
                Select an article from the list to view details and actions.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScraperTest;
