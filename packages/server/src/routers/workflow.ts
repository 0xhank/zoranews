import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  generateCoinMetadata,
  generateImageFromHeadline,
} from "../services/openaiService";
import { publicProcedure, router } from "../trpc";
import { executeCoinCreation } from "./coin"; // Assuming executeCoinCreation is exported from coin
import { newsRouter } from "./news";
import { privateKeyToAccount } from "viem/accounts";
import { Hex } from "viem";

// Placeholder type for news article data - adjust based on actual newsRouter output
// Assumes a procedure like 'getLatestHeadline' returns this structure
const ArticleSchema = z.object({
  headline: z.string(),
  summary: z.string().optional().nullable(), // Allow null in case summary is missing
  url: z.string().url().optional().nullable(), // Allow null
});
type Article = z.infer<typeof ArticleSchema>;

export const workflowRouter = router({
  /**
   * Scrapes news, selects an article, and creates a Zora coin based on it.
   * Takes no input parameters.
   */
  createCoinFromScratch: publicProcedure
    .mutation(async ({ ctx }) => {
      const privateKey = process.env.PRIVATE_KEY;
      if (!privateKey) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Server wallet private key not configured",
        });
      }
      console.log("Starting createCoinFromNews workflow...");

      // 1. Fetch the latest news article
      let article: Article | null = null; // Initialize article as potentially null
      try {
        // Create a caller instance for the newsRouter using the current context
        const newsCaller = newsRouter.createCaller(ctx);
        console.log("Fetching latest headline...");
        // *** Assumption: newsRouter has a 'getLatestHeadline' procedure ***
        // This procedure should handle scraping and selecting the top article.
        // It's assumed to return an object matching ArticleSchema or null/undefined if none found.
        const { articles } = await newsCaller.scrapeNow();
        console.log("Fetched articles:");
        // Validate the fetched article structure
        const parsedArticle = ArticleSchema.safeParse(articles[0]);
        if (!parsedArticle.success) {
          console.error(
            "Fetched article data is invalid or null:",
            parsedArticle.error
          );
          // If parsing fails, treat it as no article found or handle error differently
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch or parse a valid news article.",
            cause: parsedArticle.error,
          });
        }
        article = parsedArticle.data;
        console.log("Fetched article:");
      } catch (error) {
        console.error("Error fetching news:", error);
        // Catch errors specifically from the news fetching/parsing step
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch news article: ${
            error instanceof Error ? error.message : String(error)
          }`,
          cause: error,
        });
      }

      // Explicit check to ensure article is available before proceeding
      if (!article) {
        // This should technically be unreachable due to earlier checks, but added for safety
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Critical error: Article data was null after validation.",
        });
      }

      // 2. Generate Coin Data via OpenAI
      let generatedName: string;
      let generatedDescription: string;
      let generatedSymbol: string;
      let generatedImageUrl: string;
      try {
        const metadataResult = await generateCoinMetadata(
          article.summary || article.headline // Use summary or fallback to headline
        );
        generatedName = metadataResult.name;
        generatedDescription = metadataResult.description;
        generatedSymbol = metadataResult.symbol;
        console.log("Generated metadata:", {
          generatedName,
          generatedDescription,
          generatedSymbol,
        });

        // return;
        console.log("Generating image from OpenAI...");
        generatedImageUrl = await generateImageFromHeadline(article.headline);
        console.log("Generated image URL");
      } catch (error) {
        console.error("Error calling OpenAI service:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to generate coin data from OpenAI: ${
            error instanceof Error ? error.message : String(error)
          }`,
        });
      }

      // 4. Call the reusable coin creation logic

      const serverAccount = privateKeyToAccount(privateKey as Hex);

      await executeCoinCreation({
        name: generatedName,
        symbol: generatedSymbol,
        description: generatedDescription,
        image: generatedImageUrl,
        payoutRecipient: serverAccount.address,
      });
    }),
});

// Export the router type
export type WorkflowRouter = typeof workflowRouter;
