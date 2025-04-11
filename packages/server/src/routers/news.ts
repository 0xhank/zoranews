import type { NewsArticle } from "@zora-news/shared";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";

// Mock news data for demonstration
const mockNews: NewsArticle[] = [
  {
    id: "1",
    headline: "Bitcoin Surges to New All-Time High",
    summary:
      "Bitcoin has reached a new all-time high as institutional adoption increases.",
    url: "https://example.com/bitcoin-ath",
    timestamp: new Date().toISOString(),
  },
  {
    id: "2",
    headline: "New AI Model Revolutionizes Natural Language Processing",
    summary:
      "A breakthrough in AI technology promises to transform how computers understand human language.",
    url: "https://example.com/ai-breakthrough",
    timestamp: new Date().toISOString(),
  },
  {
    id: "3",
    headline: "Tech Startup Raises $100M in Series B Funding",
    summary:
      "A promising tech startup has secured significant funding to scale its operations globally.",
    url: "https://example.com/startup-funding",
    timestamp: new Date().toISOString(),
  },
];

export const newsRouter = router({
  getAll: publicProcedure.query(async () => {
    // In a real app, this would fetch from a database or external API
    return mockNews;
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const article = mockNews.find((news) => news.id === input.id);
      if (!article) {
        throw new Error("Article not found");
      }
      return article;
    }),

  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const query = input.query.toLowerCase();
      return mockNews.filter(
        (article) =>
          article.headline.toLowerCase().includes(query) ||
          article.summary.toLowerCase().includes(query)
      );
    }),
});
