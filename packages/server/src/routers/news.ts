import type { NewsArticle } from "@zora-news/shared";
import { z } from "zod";
import { newsScraper } from "../services/newsScraper";
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
    // Return cached articles if available, otherwise scrape new ones
    const articles = newsScraper.getArticles();
    if (articles.length === 0) {
      // Initial scrape if no articles are available
      return await newsScraper.scrapeAll();
    }
    return articles;
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const article = newsScraper.getArticleById(input.id);
      if (!article) {
        throw new Error("Article not found");
      }
      return article;
    }),

  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      return newsScraper.searchArticles(input.query);
    }),

  scrapeNow: publicProcedure.mutation(async () => {
    const articles = await newsScraper.scrapeAll();
    return {
      count: articles.length,
      timestamp: new Date().toISOString(),
    };
  }),

  getScrapingStatus: publicProcedure.query(() => {
    const lastScraped = newsScraper.getLastScraped();
    return {
      lastScraped: lastScraped ? lastScraped.toISOString() : null,
      articleCount: newsScraper.getArticles().length,
    };
  }),
});
