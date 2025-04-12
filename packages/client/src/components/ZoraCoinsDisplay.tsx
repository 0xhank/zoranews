import React from "react";
import { useZoraCoins } from "../hooks/useZoraCoins";

const ZoraCoinsDisplay: React.FC = () => {
  const { getProfileBalances } = useZoraCoins();
  const { data, isLoading } = getProfileBalances(
    "0xAa92E8266E9C6128e9241952aE405Dd0e3251b72"
  );

  if (!data?.success && !isLoading) {
    return (
      <div className="text-red-400 p-4 border border-red-700 rounded-md bg-gray-800">
        Error: Failed to load profile balances.
      </div>
    );
  }

  const coins =
    data?.data?.profile?.coinBalances.edges.map((edge) => edge.node) ?? [];

  return (
    <div className="font-mono text-green-400">
      <h2 className="text-blue-400 border-b border-green-800 pb-2 mb-4 text-lg font-semibold">
        ## Generated Zora Coins
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[65vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-green-700 scrollbar-track-gray-700">
        {isLoading ? (
          <div className="text-center py-8 text-yellow-500 col-span-full animate-pulse">
            Loading coins...
          </div>
        ) : coins.length > 0 ? (
          coins.map((coin) => (
            <div
              key={coin.id}
              className="bg-gray-800 rounded-md p-4 border border-green-700 shadow-md transition-colors duration-150 hover:border-green-500 hover:bg-gray-700 text-center flex flex-col"
            >
              <div className="w-16 h-16 rounded-full mb-3 bg-gray-700 mx-auto border-2 border-green-800 flex-shrink-0 overflow-hidden">
                {coin.coin?.mediaContent?.originalUri ? (
                  <img
                    src={coin.coin?.mediaContent?.originalUri}
                    alt={coin.coin?.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500 text-xs flex items-center justify-center h-full">
                    No Image
                  </span>
                )}
              </div>
              <div className="flex-grow">
                <h3 className="text-yellow-300 mb-1 text-md font-semibold truncate">
                  {coin.coin?.name} ({coin.coin?.symbol})
                </h3>
                <p className="mb-2 text-green-400 text-xs overflow-hidden text-ellipsis h-10">
                  {coin.coin?.description || "No description provided."}
                </p>
              </div>
              <small className="block mt-auto pt-2 border-t border-green-800 text-gray-500 italic text-xs">
                Minted via Zora Protocol
              </small>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 col-span-full">
            No coins available yet. Select an article and create one!
          </div>
        )}
      </div>
    </div>
  );
};

export default ZoraCoinsDisplay;
