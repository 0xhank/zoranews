import { useState } from "react";
import { trpc } from "../utils/trpc";

export const useZoraCoins = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Mutations
  const createCoinMutation = trpc.coin.createCoin.useMutation();

  // Queries
  const getCoinDetailsQuery = trpc.coin.getCoinDetails.useQuery;
  const getCoinCommentsQuery = trpc.coin.getCoinComments.useQuery;
  const getProfileQuery = trpc.coin.getProfile.useQuery;
  const getProfileBalancesQuery = trpc.coin.getProfileBalances.useQuery;
  const searchCoinsQuery = trpc.coin.searchCoins.useQuery;
  const topCoinsQuery = trpc.coin.getTopCoins.useQuery;
  const recentCoinsQuery = trpc.coin.getRecentCoins.useQuery;

  /**
   * Create a new coin
   */
  const createCoin = async (coinData: {
    name: string;
    symbol: string;
    uri: string;
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
   * Search for coins
   */
  const searchCoins = (query: string, limit = 10, offset = 0) => {
    setIsSearching(Boolean(query));
    setSearchTerm(query);

    return searchCoinsQuery(
      { query, limit, offset },
      {
        enabled: Boolean(query),
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

  /**
   * Get recent coins
   */
  const getRecentCoins = (limit = 10) => {
    return recentCoinsQuery(
      { limit },
      {
        staleTime: 1000 * 60 * 5, // 5 minutes
      }
    );
  };

  return {
    // State
    isCreating,
    isSearching,
    searchTerm,

    // Mutations
    createCoin,

    // Queries
    getCoinDetails,
    getCoinComments,
    getProfile,
    getProfileBalances,
    searchCoins,
    getTopCoins,
    getRecentCoins,
  };
};
