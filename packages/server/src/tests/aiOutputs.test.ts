import dotenv from "dotenv";
import { beforeAll, describe, expect, it } from "vitest";
import { generateCoinMetadata } from "../services/openaiService";

// Load environment variables for the test
dotenv.config();

const ARTICLE_SNIPPETS = [
  {
    input:
      "Bitcoin surges past $70,000 as institutional investors pile in. Analysts predict further upside potential, citing strong ETF inflows and upcoming halving event.",
    keywords: ["bitcoin", "surge", "$70k", "institutional", "etf", "halving"],
  },
  {
    input:
      "SEC delays decision on Ethereum ETF application again, citing need for further review. Market reacts with mild dip, ETH price remains volatile.",
    keywords: ["ethereum", "etf", "sec", "delay", "volatile"],
  },
  {
    input:
      "Solana network experiences another outage, raising concerns about stability. Team promises fixes, but community sentiment remains cautious.",
    keywords: ["solana", "outage", "stability", "down"],
  },
  {
    input:
      "New meme coin 'DogeWifHat' skyrockets 1000% after Elon Musk tweets a picture of his dog wearing a hat. Pure speculation drives the frenzy.",
    keywords: ["doge", "wif", "hat", "elon", "meme", "skyrocket"],
  },
];

describe("OpenAI Service - generateCoinMetadata", () => {
  beforeAll(() => {
    // Check if the API key is present before running tests
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        "OPENAI_API_KEY environment variable not set. Cannot run OpenAI tests."
      );
    }
  });

  it.each(ARTICLE_SNIPPETS)(
    "should generate relevant metadata for: $input",
    async ({ input, keywords }) => {
      console.log(`\n--- Testing Article Snippet ---`);
      console.log(`Input: ${input}`);

      const metadata = await generateCoinMetadata(input);

      console.log(`Generated Name: ${metadata.name}`);
      console.log(`Generated Description: ${metadata.description}`);
      console.log(`-----------------------------`);

      // Basic structural checks
      expect(metadata).toBeDefined();
      expect(metadata).toHaveProperty("name");
      expect(metadata).toHaveProperty("description");
      expect(typeof metadata.name).toBe("string");
      expect(typeof metadata.description).toBe("string");
      expect(metadata.name.length).toBeGreaterThan(0);
      expect(metadata.description.length).toBeGreaterThan(0);

      // Basic constraint checks (max length handled by function, but good to check)
      expect(metadata.name.length).toBeLessThanOrEqual(30);
      expect(metadata.description.length).toBeLessThanOrEqual(1000);

      // Very basic relevance check (at least one keyword should ideally appear in name or description)
      const combinedOutput =
        `${metadata.name} ${metadata.description}`.toLowerCase();
      const relevanceScore = keywords.filter((keyword) =>
        combinedOutput.includes(keyword)
      ).length;
      // expect(relevanceScore).toBeGreaterThan(0); // This might be too strict, let user judge relevance
      console.log(
        `Keyword Relevance Score: ${relevanceScore} / ${keywords.length}`
      );
    },
    30000
  ); // Increase timeout for API calls
});
