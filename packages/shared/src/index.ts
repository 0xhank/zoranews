export * from "./types";

export interface NewsArticle {
  id: string;
  url: string;
  headline: string;
  summary: string;
  timestamp: string;
  source: string;
}

export interface ZoraCoin {
  address: string;
  name: string;
  symbol: string;
  totalSupply: string;
  metadata: {
    name: string;
    description?: string;
    image?: string;
    animation_url?: string;
    content?: {
      mime: string;
      uri: string;
    };
    properties?: Record<string, any>;
  };
  pricing?: {
    usdPrice?: string;
    ethPrice?: string;
    priceChange24h?: string;
    volumeChange24h?: string;
  };
  creator: string;
  createdAt: string;
}

export interface Memecoin {
  id: string;
  name: string;
  symbol: string;
  description: string;
  articleId: string;
  tokenContract?: string;
  createdAt: string;
  imageUrl?: string;
}
