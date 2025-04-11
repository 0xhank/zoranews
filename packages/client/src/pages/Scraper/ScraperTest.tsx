import type { NewsArticle } from "@zora-news/shared";
import React, { useState } from "react";
import { useNewsScraper } from "../../hooks/useNewsScraper";

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

  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    null
  );

  // Format date for display
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get selected article details
  const selectedArticle = articles.find(
    (article: NewsArticle) => article.id === selectedArticleId
  );

  return (
    <div className="p-8 font-sans bg-gray-100 min-h-screen">
      <h1 className="text-center text-gray-800 mb-4 text-4xl font-bold">
        News Scraper Testing
      </h1>

      {/* Status and Controls */}
      <div className="bg-white rounded-lg p-6 shadow-md mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Scraper Status</h2>
            <p className="text-gray-600">
              Last scraped:{" "}
              <span className="font-medium">{formatDate(lastScrapedAt)}</span>
            </p>
            <p className="text-gray-600">
              Articles in cache:{" "}
              <span className="font-medium">{articleCount}</span>
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            <button
              onClick={() => scrapeNow()}
              disabled={isScraping}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                isScraping
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isScraping ? "Scraping..." : "Scrape Now"}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4 flex">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search articles..."
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {isSearching && (
            <button
              onClick={clearSearch}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-r-md hover:bg-gray-300"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Article List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            {isSearching ? "Search Results" : "Available Articles"}
            {isSearching && (
              <span className="ml-2 text-sm">({articles.length} results)</span>
            )}
          </h2>

          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              Loading articles...
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {isSearching
                ? "No articles match your search"
                : "No articles available"}
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[60vh]">
              {articles.map((article: NewsArticle) => (
                <div
                  key={article.id}
                  className={`p-4 mb-2 border rounded-md cursor-pointer transition-colors ${
                    selectedArticleId === article.id
                      ? "bg-blue-50 border-blue-300"
                      : "hover:bg-gray-50 border-gray-200"
                  }`}
                  onClick={() => setSelectedArticleId(article.id)}
                >
                  <h3 className="font-medium text-gray-800 truncate">
                    {article.headline}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {article.summary}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Article Details */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">Article Details</h2>

          {selectedArticle ? (
            <div>
              <h3 className="text-lg font-medium text-blue-800 mb-2">
                {selectedArticle.headline}
              </h3>
              <p className="text-gray-600 mb-4">{selectedArticle.summary}</p>

              <div className="flex flex-col space-y-2 text-sm">
                <p className="text-gray-500">
                  <span className="font-medium">ID:</span> {selectedArticle.id}
                </p>
                <p className="text-gray-500">
                  <span className="font-medium">Published:</span>{" "}
                  {formatDate(selectedArticle.timestamp)}
                </p>
                <a
                  href={selectedArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-block mt-4"
                >
                  Read Full Article →
                </a>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <h4 className="font-medium mb-2">Generate Memecoin</h4>
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  onClick={() => {
                    // This will be implemented in a future step
                    alert(
                      `Will generate memecoin based on: ${selectedArticle.headline}`
                    );
                  }}
                >
                  Create Memecoin
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Select an article to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScraperTest;
