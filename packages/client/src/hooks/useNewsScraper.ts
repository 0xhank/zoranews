import { useState } from "react";
import { trpc } from "../utils/trpc";

export const useNewsScraper = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Get all news articles
  const allNewsQuery = trpc.news.getAll.useQuery();

  // Get scraping status
  const scrapingStatusQuery = trpc.news.getScrapingStatus.useQuery(
    undefined,
    {
      // Refresh every 30 seconds
      refetchInterval: 30000,
    }
  );

  // Trigger manual scraping
  const scrapeNowMutation = trpc.news.scrapeNow.useMutation({
    onSuccess: (result) => {
      // Refresh the news and status after scraping
      allNewsQuery.refetch();
      scrapingStatusQuery.refetch();
      console.log("Scrape result", result);
    },
  });

  // Search articles
      const searchQuery = trpc.news.search.useQuery(
    { query: searchTerm },
    {
      enabled: isSearching && searchTerm.length > 0,
      // Don't refetch on window focus for search results
      refetchOnWindowFocus: false,
    }
  );

  // Handle search
  const handleSearch = (query: string) => {
    setSearchTerm(query);
    setIsSearching(query.length > 0);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
    setIsSearching(false);
  };

  return {
    articles: isSearching ? searchQuery.data || [] : allNewsQuery.data || [],
    isLoading: allNewsQuery.isLoading || (isSearching && searchQuery.isLoading),
    isError: allNewsQuery.isError || (isSearching && searchQuery.isError),
    error: allNewsQuery.error || (isSearching ? searchQuery.error : null),
    lastScrapedAt: scrapingStatusQuery.data?.lastScraped,
    articleCount: scrapingStatusQuery.data?.articleCount || 0,
    isScraping: scrapeNowMutation.isPending,
    scrapeNow: () => scrapeNowMutation.mutate(),
    searchTerm,
    handleSearch,
    clearSearch,
    isSearching,
  };
};
