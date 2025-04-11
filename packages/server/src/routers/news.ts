import { z } from "zod";
import { newsScraper } from "../services/newsScraper";
import { publicProcedure, router } from "../trpc";

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
