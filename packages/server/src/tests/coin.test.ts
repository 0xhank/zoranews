import dotenv from "dotenv";
import { Hex } from "viem";
import { privateKeyToAddress } from "viem/accounts";
import { describe, expect, it } from "vitest";
import { uploadMetadataToIpfs } from "../lib/ipfsUploader";
import { appRouter } from "../routers/_app";

// Load environment variables
dotenv.config({ path: ".env" });

// Check for private key
if (!process.env.PRIVATE_KEY) {
  throw new Error(
    "PRIVATE_KEY environment variable is not set. Please create a .env file based on .env.example."
  );
}

const address = privateKeyToAddress(process.env.PRIVATE_KEY as Hex);

describe("Coin Router", () => {
  it("should generate parameters for creating a coin after uploading metadata", async () => {
    const caller = appRouter.createCaller({});

    // Define metadata
    const metadata = {
      name: "THE REAL HARRY KINGDON TEST",
      description: "A truly regal test coin",
      image:
        "https://imgs.search.brave.com/R94AIHyXwBBi7djlHzirA1wHHTVsJ2zg45AvEiuIBPk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy81/LzU2L1ByaW5jZV9I/YXJyeV90YWxrc190/b19hbl9pbmp1cmVk/X3NvbGRpZXIuanBn",
      properties: { category: "test", testId: `test-${Date.now()}` },
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
    } catch (error) {
      console.error("Error creating coin:", error);
      throw error;
    }
  }, 60000); // Increase timeout for double IPFS upload + SDK call
});
