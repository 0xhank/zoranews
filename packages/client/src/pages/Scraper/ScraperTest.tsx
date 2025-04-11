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

  const { createCoin, isCreating } = useZoraCoins();

  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    null
  );

  const [coinName, setCoinName] = useState("");
  const [coinSymbol, setCoinSymbol] = useState("");
  const [payoutAddress, setPayoutAddress] = useState("");
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
    (article: NewsArticle) => article.id === selectedArticleId
  );

  // Generate coin name and symbol from article
  const generateCoinNameSymbol = () => {
    if (!selectedArticle) return;

    // Extract keywords from the headline for the name
    const headline = selectedArticle.headline;
    const words = headline.split(" ");

    // Create a name from the first 3-4 significant words
    const significantWords = words
      .filter((word) => word.length > 3)
      .slice(0, 3)
      .map(
        (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      );

    const name = significantWords.join(" ") + " Coin";

    // Create a symbol from the first letters of significant words
    const symbol = significantWords
      .map((word) => word.charAt(0).toUpperCase())
      .join("");

    setCoinName(name);
    setCoinSymbol(symbol);
  };

  // Handle coin creation
  const handleCreateCoin = async () => {
    if (!selectedArticle || !coinName || !coinSymbol || !payoutAddress) {
      setCreationStatus({
        status: "error",
        message: "Please fill all required fields",
      });
      return;
    }

    try {
      // For demo purposes, we'll use a mock metadata URI
      // In a real app, you'd create proper metadata and upload to IPFS
      const mockMetadataUri = `https://example.com/metadata/${selectedArticleId}.json`;

      await createCoin({
        name: coinName,
        symbol: coinSymbol,
        uri: mockMetadataUri,
        payoutRecipient: payoutAddress,
      });

      setCreationStatus({
        status: "success",
        message:
          "Coin creation parameters generated successfully! Use these parameters to complete the transaction on the client side.",
      });

      // Reset form
      setCoinName("");
      setCoinSymbol("");
      setPayoutAddress("");
    } catch (error) {
      console.error("Error creating coin:", error);
      setCreationStatus({
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to create coin",
      });
    }
  };

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
                  key={`article-${article.id}-${article.timestamp}`}
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

        {/* Article Details and Coin Creation */}
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
                <h4 className="font-medium mb-4">Create Zora Coin</h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Coin Name
                    </label>
                    <input
                      type="text"
                      value={coinName}
                      onChange={(e) => setCoinName(e.target.value)}
                      placeholder="Enter coin name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Symbol
                    </label>
                    <input
                      type="text"
                      value={coinSymbol}
                      onChange={(e) => setCoinSymbol(e.target.value)}
                      placeholder="Enter coin symbol (3-4 chars)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payout Address (ETH)
                    </label>
                    <input
                      type="text"
                      value={payoutAddress}
                      onChange={(e) => setPayoutAddress(e.target.value)}
                      placeholder="0x..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={generateCoinNameSymbol}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      Auto-Generate
                    </button>

                    <button
                      onClick={handleCreateCoin}
                      disabled={isCreating}
                      className={`px-4 py-2 rounded-md text-white font-medium ${
                        isCreating
                          ? "bg-green-300 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {isCreating ? "Creating..." : "Create Coin"}
                    </button>
                  </div>

                  {creationStatus.status !== "idle" && (
                    <div
                      className={`mt-3 p-3 rounded-md ${
                        creationStatus.status === "success"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {creationStatus.message}
                    </div>
                  )}
                </div>
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
