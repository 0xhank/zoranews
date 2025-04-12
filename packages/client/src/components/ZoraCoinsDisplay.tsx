import React from "react";
import { useZoraCoins } from "../hooks/useZoraCoins";

const ZoraCoinsDisplay: React.FC = () => {
  const { getProfileBalances } = useZoraCoins();
  const { data, isLoading, error } = getProfileBalances(
    "0xAa92E8266E9C6128e9241952aE405Dd0e3251b72"
  );

  if (error) {
    return (
      <div className="text-red-700 p-4 border border-red-300 rounded-lg bg-red-50">
        <p className="font-medium">Error loading coins:</p>
        <p className="text-sm">
          {error.message || "Failed to fetch profile balances."}
        </p>
      </div>
    );
  }

  const coins = data?.success
    ? data.data?.profile?.coinBalances.edges.map((edge) => edge.node) ?? []
    : [];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500 col-span-full">
            Loading coins...
          </div>
        ) : coins.length > 0 ? (
          coins.map((coin) => (
            <div
              key={coin.id}
              className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-150 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full mb-3 bg-gray-100 border border-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                {coin.coin?.mediaContent?.originalUri ? (
                  <img
                    src={coin.coin?.mediaContent?.originalUri}
                    alt={coin.coin?.name ?? "Coin image"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-gray-400 text-xs">Image</span>
                )}
              </div>
              <div className="flex-grow w-full">
                <h3
                  className="text-gray-800 mb-1 text-sm font-medium truncate"
                  title={`${coin.coin?.name} (${coin.coin?.symbol})`}
                >
                  {coin.coin?.name} ({coin.coin?.symbol})
                </h3>
                <p
                  className="mb-2 text-gray-600 text-xs overflow-hidden"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {coin.coin?.description || "No description provided."}
                </p>
              </div>
              <small className="block mt-auto pt-2 text-gray-400 text-xs w-full">
                Zora Protocol Coin
              </small>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500 col-span-full">
            No coins found for this profile.
          </div>
        )}
      </div>
    </div>
  );
};

export default ZoraCoinsDisplay;
