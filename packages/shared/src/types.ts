// Shared types that will be used across client and server
export interface NewsArticle {
  id: string;
  headline: string;
  summary: string;
  url: string;
  timestamp: string;
}

export interface MemeToken {
  id: string;
  name: string;
  symbol: string;
  description: string;
  logoUrl: string;
  basedOn: string;
  timestamp: string;
  contractAddress?: string;
}
