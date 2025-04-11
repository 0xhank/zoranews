import { useState } from "react";
import { trpc } from "../utils/trpc";

export const useZoraCoins = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingFromNews, setIsCreatingFromNews] = useState(false);
  const createCoinMutation = trpc.coin.createCoin.useMutation();
  const createCoinFromNewsMutation = trpc.coin.createCoinFromNews.useMutation();

  // Queries
  const getCoinDetailsQuery = trpc.coin.getCoinDetails.useQuery;
  const getCoinCommentsQuery = trpc.coin.getCoinComments.useQuery;
  const getProfileQuery = trpc.coin.getProfile.useQuery;
  const getProfileBalancesQuery = trpc.coin.getProfileBalances.useQuery;
  const topCoinsQuery = trpc.coin.getTopCoins.useQuery;

  /**
   * Create a new coin manually
   */
  const createCoin = async (coinData: {
    name: string;
    symbol: string;
    description: string;
    image: string;
    properties?: Record<string, unknown>;
    payoutRecipient: string;
    platformReferrer?: string;
    initialPurchaseWei?: string;
  }) => {
    setIsCreating(true);
    try {
      const result = await createCoinMutation.mutateAsync(coinData);
      return result;
    } catch (error) {
      console.error("Failed to create coin:", error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Create a new coin from a news article ID
   */
  const createCoinFromNews = async (newsData: {
    articleId: string;
    symbol: string;
    payoutRecipient: string;
    platformReferrer?: string;
    initialPurchaseWei?: string;
  }) => {
    setIsCreatingFromNews(true);
    try {
      const result = await createCoinFromNewsMutation.mutateAsync(newsData);
      return result;
    } catch (error) {
      console.error("Failed to create coin from news:", error);
      throw error;
    } finally {
      setIsCreatingFromNews(false);
    }
  };

  /**
   * Get details of a specific coin
   */
  const getCoinDetails = (address: string) => {
    return getCoinDetailsQuery(
      { address },
      {
        enabled: Boolean(address),
        staleTime: 1000 * 60 * 5, // 5 minutes
      }
    );
  };

  /**
   * Get comments for a specific coin
   */
  const getCoinComments = (address: string, count = 20, after?: string) => {
    return getCoinCommentsQuery(
      { address, count, after },
      {
        enabled: Boolean(address),
        staleTime: 1000 * 60 * 5, // 5 minutes
      }
    );
  };

  /**
   * Get profile information
   */
  const getProfile = (identifier: string) => {
    return getProfileQuery(
      { identifier },
      {
        enabled: Boolean(identifier),
        staleTime: 1000 * 60 * 5, // 5 minutes
      }
    );
  };

  /**
   * Get coins owned by a profile
   */
  const getProfileBalances = (
    identifier: string,
    count = 20,
    after?: string
  ) => {
    return getProfileBalancesQuery(
      { identifier, count, after },
      {
        enabled: Boolean(identifier),
        staleTime: 1000 * 60 * 5, // 5 minutes
      }
    );
  };

  /**
   * Get top coins
   */
  const getTopCoins = (limit = 10) => {
    return topCoinsQuery(
      { limit },
      {
        staleTime: 1000 * 60 * 5, // 5 minutes
      }
    );
  };

  return {
    // State
    isCreating,
    isCreatingFromNews,

    // Mutations
    createCoin,
    createCoinFromNews,

    // Queries
    getCoinDetails,
    getCoinComments,
    getProfile,
    getProfileBalances,
    getTopCoins,
  };
};
