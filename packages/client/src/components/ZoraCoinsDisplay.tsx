import React from "react";
import { useZoraCoins } from "../hooks/useZoraCoins";


const ZoraCoinsDisplay: React.FC = () => {
  const { getProfileBalances } = useZoraCoins();
  const { data, isLoading } = getProfileBalances("0xAa92E8266E9C6128e9241952aE405Dd0e3251b72");
  if (!data?.data && !data?.success) {
    return <div>Error loading profile balances</div>;
  }

  if (!data.success) {
    return <div>Error loading profile balances</div>;
  }

  const coins = data?.data?.profile?.coinBalances.edges.map((edge) => edge.node) ?? [];
  return (
    <div>
      <h2 className="text-gray-700 border-b-2 border-gray-300 pb-2 mb-6 text-2xl font-semibold">
        Generated Zora Coins
      </h2>

      <div className="grid grid-cols-1 gap-6 max-h-[700px] overflow-y-auto pb-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading coins...</div>
        ) : coins.length > 0 ? (
          coins.map((coin) => (
            <div
              key={coin.id}
              className="bg-white rounded-lg p-6 shadow-md transition-transform transform hover:-translate-y-1 hover:shadow-lg text-center"
            >
              <div className="w-20 h-20 rounded-full mb-4 bg-gray-200 mx-auto">
                {coin.coin?.mediaContent?.originalUri && (
                  <img
                    src={coin.coin?.mediaContent?.originalUri}
                    alt={coin.coin?.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                )}
              </div>
              <h3 className="text-green-600 mb-2 text-xl font-semibold">
                {coin.coin?.name} ({coin.coin?.symbol})
              </h3>
              <p className="mb-4 text-gray-600 text-sm">
                {coin.coin?.description || "No description available."}
              </p>
              <small className="block mt-4 text-gray-500 italic text-xs">
                Created with Zora Coins Protocol
              </small>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No coins available yet. Generate one from a news article!
          </div>
        )}
      </div>
    </div>
  );
};

export default ZoraCoinsDisplay;
