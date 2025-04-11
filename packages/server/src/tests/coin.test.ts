import dotenv from "dotenv";
import { Address, Hex } from "viem";
import { privateKeyToAddress } from "viem/accounts";
import { beforeAll, describe, expect, it } from "vitest";
import { uploadMetadataToIpfs } from "../lib/ipfsUploader";
import { appRouter } from "../routers/_app";

// Load environment variables
dotenv.config({ path: ".env" });

let address: Address;
let caller: ReturnType<typeof appRouter.createCaller>;

// Setup: Check keys and initialize caller/address once
beforeAll(() => {
  if (!process.env.PRIVATE_KEY) {
    throw new Error(
      "PRIVATE_KEY environment variable is not set. Please create a .env file based on .env.example."
    );
  }
  // Check for other necessary keys for the new test
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY environment variable is not set. Needed for createCoinFromNews test."
    );
  }
  if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_API_KEY) {
    throw new Error(
      "Pinata API keys not set. Needed for createCoinFromNews test."
    );
  }

  address = privateKeyToAddress(process.env.PRIVATE_KEY as Hex);
  caller = appRouter.createCaller({});
});

describe("Coin Router", () => {
  it("should generate parameters for creating a coin after uploading metadata", async () => {
    const caller = appRouter.createCaller({});

    // Define metadata
    const metadata = {
      name: "THE REAL HARRY KINGDON TEST",
      description: "A truly regal test coin",
      image:
        "https://imgs.search.brave.com/R94AIHyXwBBi7djlHzirA1wHHTVsJ2zg45AvEiuIBPk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy81/LzU2L1ByaW5jZV9I/YXJyeV90YWxrc190/b19hbl9pbmp1cmVk/X3NvbGRpZXIuanBn",
    };

    let metadataUri = "";
    try {
      // Use the library function to upload metadata
      metadataUri = await uploadMetadataToIpfs(
        metadata,
        `Test Coin - ${metadata.name}`
      );
      console.log("Metadata uploaded via lib function:", metadataUri);
    } catch (uploadError) {
      console.error("Error uploading metadata via lib:", uploadError);
      // Rethrow or handle as needed for the test
      throw new Error("Failed to upload metadata using library function");
    }

    const input = {
      name: metadata.name,
      symbol: "HARRY",
      description: metadata.description,
      image: metadata.image,
      properties: {},
      payoutRecipient: address,
      initialPurchaseWei: "0",
    };

    try {
      const result = await caller.coin.createCoin(input);
      const contractCallParams = result.contractCallParams;

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe(
        "Coin creation parameters generated successfully"
      );
      expect(contractCallParams).toBeDefined();
      expect(contractCallParams.receipt).toBeDefined();
      expect(contractCallParams.hash).toBeDefined();
      expect(contractCallParams.address).toBeDefined();
    } catch (error) {
      console.error("Error creating coin:", error);
      throw error;
    }
  }, 60000); // Increase timeout for double IPFS upload + SDK call

  it("should generate parameters for creating a coin manually after uploading metadata", async () => {
    // Test for the original createCoin (manual metadata)
    const metadata = {
      name: "THE REAL HARRY KINGDON MANUAL TEST", // Distinguish test name
      description: "A truly regal manual test coin",
      image:
        "https://imgs.search.brave.com/R94AIHyXwBBi7djlHzirA1wHHTVsJ2zg45AvEiuIBPk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy81/LzU2L1ByaW5jZV9I/YXJyeV90YWxrc190/b19hbl9pbmp1cmVk/X3NvbGRpZXIuanBn",
      properties: { },
    };

    // NOTE: This test still implicitly calls uploadMetadataToIpfs twice
    // once here, and once inside the createCoin route. Consider optimizing if needed.
    let metadataUri = "";
    try {
      metadataUri = await uploadMetadataToIpfs(
        metadata,
        `Test Manual Coin - ${metadata.name}`
      );
      console.log(
        "Manual test metadata uploaded via lib function:",
        metadataUri
      );
    } catch (uploadError) {
      console.error("Error uploading manual metadata via lib:", uploadError);
      throw new Error(
        "Failed to upload manual metadata using library function"
      );
    }

    const input = {
      name: metadata.name,
      symbol: "MANUAL", // Test symbol
      description: metadata.description,
      image: metadata.image,
      properties: metadata.properties,
      payoutRecipient: address,
      initialPurchaseWei: "0",
    };

    try {
      const result = await caller.coin.createCoin(input);
      const contractCallParams = result.contractCallParams;

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe(
        "Coin creation parameters generated successfully"
      );
      expect(contractCallParams).toBeDefined();
      expect(contractCallParams.receipt).toBeDefined();
      expect(contractCallParams.hash).toBeDefined();
      expect(contractCallParams.address).toBeDefined();
      console.log("Manual coin created address:", contractCallParams.address);
    } catch (error) {
      console.error("Error creating manual coin:", error);
      throw error;
    }
  }, 60000); // Keep timeout for double IPFS upload + SDK call

  it("should create a coin from a news article using OpenAI", async () => {
    console.log("\n--- Test: createCoinFromNews --- START ---");
    // 1. Ensure news articles are available
    let articleId = "";
    let articleHeadline = "";
    try {
      console.log("[1/4] Scraping news articles...");
      await caller.newsRouter.scrapeNow(); // Correct path: newsRouter
      const articles = await caller.newsRouter.getAll(); // Correct path: newsRouter
      if (articles.length === 0) {
        throw new Error("No news articles found after scraping.");
      }
      articleId = articles[0].id;
      articleHeadline = articles[0].headline; // Store headline for logging
      console.log(
        `[1/4] News scraped. Using article ID: ${articleId} - "${articleHeadline}"`
      );
    } catch (error) {
      console.error("Failed to get news articles for test:", error);
      throw new Error("Prerequisite: Failed to fetch news articles.");
    }

    // 2. Define input for createCoinFromNews
    const input = {
      articleId: articleId,
      symbol: "NEWS", // Test symbol
      payoutRecipient: address,
      initialPurchaseWei: "0",
      // platformReferrer can be added if needed
    };
    console.log("[2/4] Prepared input for createCoinFromNews:", input);

    // 3. Call the mutation
    try {
      console.log("[3/4] Calling coin.createCoinFromNews mutation...");
      const result = await caller.coin.createCoinFromNews(input);
      console.log("[3/4] Received result from createCoinFromNews:", result);
      const contractCallParams = result.contractCallParams;

      // 4. Assertions
      console.log("[4/4] Performing assertions...");
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe(
        "Coin creation parameters generated successfully"
      );
      expect(contractCallParams).toBeDefined();
      expect(contractCallParams.receipt).toBeDefined(); // Check receipt structure
      expect(contractCallParams.hash).toBeDefined(); // Check transaction hash
      expect(contractCallParams.address).toBeDefined(); // Check new coin address
      console.log("[4/4] Assertions passed.");
      console.log("    News coin created address:", contractCallParams.address);
      console.log(
        "    News coin metadata URI:",
        contractCallParams.deployment?.uri
      );
    } catch (error) {
      console.error("Error during createCoinFromNews mutation call:", error);
      throw error;
    }
    console.log("--- Test: createCoinFromNews --- END ---");
  }, 120000); // Very generous timeout: Scrape + OpenAI (x2) + IPFS + SDK
});
