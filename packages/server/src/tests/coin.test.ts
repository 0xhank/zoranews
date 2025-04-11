import pinataSDK from "@pinata/sdk";
import dotenv from "dotenv";
import { Hex } from "viem";
import { privateKeyToAddress } from "viem/accounts";
import { describe, expect, it } from "vitest";
import { appRouter } from "../routers/_app";

// Load environment variables
dotenv.config({ path: ".env" });

// Check for private key
if (!process.env.PRIVATE_KEY) {
  throw new Error(
    "PRIVATE_KEY environment variable is not set. Please create a .env file based on .env.example."
  );
}

// Check for Pinata keys
if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_API_KEY) {
  throw new Error(
    "PINATA_API_KEY or PINATA_SECRET_API_KEY environment variables are not set. Get them from pinata.cloud."
  );
}

const address = privateKeyToAddress(process.env.PRIVATE_KEY as Hex);
const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_API_KEY
);

describe("Coin Router", () => {
  it("should generate parameters for creating a coin after uploading metadata", async () => {
    const caller = appRouter.createCaller({});

    // Define metadata
    const metadata = {
      name: "THE REAL HARRY KINGDON",
      description: "A truly regal coin",
      image:
        "https://imgs.search.brave.com/R94AIHyXwBBi7djlHzirA1wHHTVsJ2zg45AvEiuIBPk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy81/LzU2L1ByaW5jZV9I/YXJyeV90YWxrc190/b19hbl9pbmp1cmVk/X3NvbGRpZXIuanBn",
      properties: { category: "test" },
    };

    let metadataUri = "";
    try {
      // Upload metadata to IPFS
      const pinataResponse = await pinata.pinJSONToIPFS(metadata);
      metadataUri = `ipfs://${pinataResponse.IpfsHash}`;
      console.log("Metadata uploaded to IPFS:", metadataUri);
    } catch (pinataError) {
      console.error("Error uploading metadata to Pinata:", pinataError);
      throw new Error("Failed to upload metadata to IPFS");
    }

    const input = {
      name: metadata.name,
      symbol: "HARRY",
      uri: metadataUri,
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
  }, 30000); // Increase timeout for IPFS upload
});
