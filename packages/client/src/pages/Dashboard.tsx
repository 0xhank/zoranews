import React from "react";

// Dummy Data
const dummyNews = [
  {
    id: 1,
    headline: "Tech Giant Announces Breakthrough in Quantum Computing",
    summary:
      "Shares surge as the company reveals a processor capable of calculations previously thought impossible.",
    source: "Tech Chronicle",
    link: "#",
  },
  {
    id: 2,
    headline: "'Doge Killer' Token Soars 300% Amidst Social Media Frenzy",
    summary:
      "The new meme coin, Shiba Inu 2.0, gains unexpected traction following influencer endorsements.",
    source: "Crypto News Today",
    link: "#",
  },
  {
    id: 3,
    headline: "Global Leaders Meet for Climate Summit",
    summary:
      "Negotiations continue on carbon reduction targets and green energy investments.",
    source: "World Affairs Post",
    link: "#",
  },
];

const dummyCoins = [
  {
    id: 1,
    name: "QuantumLeap Coin (QLC)",
    description:
      "Leveraging the latest quantum breakthroughs for unparalleled transaction speed.",
    logoUrl: "", // Placeholder for logo
    sourceNewsId: 1,
  },
  {
    id: 2,
    name: "Shiba Killer X (SKX)",
    description:
      "The ultimate meme coin, riding the wave of the latest social media hype.",
    logoUrl: "", // Placeholder for logo
    sourceNewsId: 2,
  },
  {
    id: 3,
    name: "GreenFuture Token (GFT)",
    description:
      "Investing in a sustainable future, powered by renewable energy initiatives.",
    logoUrl: "", // Placeholder for logo
    sourceNewsId: 3,
  },
];

const Dashboard: React.FC = () => {
  return (
    <div className="p-8 font-sans bg-gray-100 min-h-screen">
      <h1 className="text-center text-gray-800 mb-8 text-4xl font-bold">
        News-Driven Memecoin Dashboard
      </h1>

      {/* News Section */}
      <h2 className="text-gray-700 border-b-2 border-gray-300 pb-2 mt-10 mb-6 text-2xl font-semibold">
        Trending News Articles
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dummyNews.map((news) => (
          <div
            key={news.id}
            className="bg-white rounded-lg p-6 shadow-md transition-transform transform hover:-translate-y-1 hover:shadow-lg"
          >
            <h3 className="text-blue-700 mb-2 text-xl font-semibold">
              {news.headline}
            </h3>
            <p className="mb-4 text-gray-600 text-sm">{news.summary}</p>
            <a
              href={news.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 hover:underline font-bold text-sm"
            >
              Read More ({news.source})
            </a>
          </div>
        ))}
      </div>

      {/* Memecoin Section */}
      <h2 className="text-gray-700 border-b-2 border-gray-300 pb-2 mt-10 mb-6 text-2xl font-semibold">
        Generated Memecoins
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dummyCoins.map((coin) => (
          <div
            key={coin.id}
            className="bg-white rounded-lg p-6 shadow-md transition-transform transform hover:-translate-y-1 hover:shadow-lg text-center"
          >
            <div className="w-20 h-20 rounded-full mb-4 bg-gray-200 inline-block">
              {/* Placeholder for image */}
            </div>
            <h3 className="text-green-600 mb-2 text-xl font-semibold">
              {coin.name}
            </h3>
            <p className="mb-4 text-gray-600 text-sm">{coin.description}</p>
            <small className="block mt-4 text-gray-500 italic text-xs">
              Inspired by:{" "}
              {dummyNews.find((n) => n.id === coin.sourceNewsId)?.headline}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
