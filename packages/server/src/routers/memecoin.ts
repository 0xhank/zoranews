import type { MemeToken } from "@zora-news/shared";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";

// Mock data for demonstration
const mockMemecoins: MemeToken[] = [
  {
    id: "1",
    name: "Bitcoin Surge Token",
    symbol: "SURGE",
    description: "A memecoin celebrating Bitcoin's latest all-time high.",
    logoUrl: "https://example.com/surge-logo.png",
    basedOn: "Bitcoin Surges to New All-Time High",
    timestamp: new Date().toISOString(),
  },
  {
    id: "2",
    name: "AI Revolution Coin",
    symbol: "AIREV",
    description:
      "The token for AI enthusiasts following the latest breakthroughs.",
    logoUrl: "https://example.com/airev-logo.png",
    basedOn: "New AI Model Revolutionizes Natural Language Processing",
    timestamp: new Date().toISOString(),
  },
];

export const memecoinRouter = router({
  getAll: publicProcedure.query(async () => {
    return mockMemecoins;
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const coin = mockMemecoins.find((coin) => coin.id === input.id);
      if (!coin) {
        throw new Error("Memecoin not found");
      }
      return coin;
    }),

  generateFromNews: publicProcedure
    .input(
      z.object({
        newsId: z.string(),
        customName: z.string().optional(),
        customSymbol: z.string().max(8).optional(),
      })
    )
    .mutation(async ({ input }) => {
      // In a real app, this would:
      // 1. Get the news article by ID
      // 2. Use AI to generate a memecoin concept
      // 3. Create a logo using DALL-E or similar
      // 4. Return the generated memecoin

      const id = `generated-${Date.now()}`;

      return {
        id,
        name: input.customName || "Generated Memecoin",
        symbol: input.customSymbol || "MEME",
        description: "This memecoin was generated based on trending news.",
        logoUrl: "https://example.com/generated-logo.png",
        basedOn: `News article with ID: ${input.newsId}`,
        timestamp: new Date().toISOString(),
      };
    }),
});
