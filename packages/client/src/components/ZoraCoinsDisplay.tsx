import React from "react";

// Define ZoraCoin interface locally to fix the import error
interface ZoraCoin {
  address: string;
  name: string;
  symbol: string;
  metadata: {
    name: string;
    description?: string;
    image?: string;
  };
}

interface ZoraCoinsDisplayProps {
  coins?: ZoraCoin[];
  isLoading?: boolean;
}

const ZoraCoinsDisplay: React.FC<ZoraCoinsDisplayProps> = ({
  coins = [],
  isLoading = false,
}) => {
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
              key={coin.address}
              className="bg-white rounded-lg p-6 shadow-md transition-transform transform hover:-translate-y-1 hover:shadow-lg text-center"
            >
              <div className="w-20 h-20 rounded-full mb-4 bg-gray-200 mx-auto">
                {coin.metadata.image && (
                  <img
                    src={coin.metadata.image}
                    alt={coin.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                )}
              </div>
              <h3 className="text-green-600 mb-2 text-xl font-semibold">
                {coin.name} ({coin.symbol})
              </h3>
              <p className="mb-4 text-gray-600 text-sm">
                {coin.metadata.description || "No description available."}
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
