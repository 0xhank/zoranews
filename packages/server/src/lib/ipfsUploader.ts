import pinataSDK from "@pinata/sdk";
import { TRPCError } from "@trpc/server";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Pinata SDK
const pinataApiKey = process.env.PINATA_API_KEY;
const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;

let pinata: pinataSDK | null = null;
if (pinataApiKey && pinataSecretApiKey) {
  pinata = new pinataSDK(pinataApiKey, pinataSecretApiKey);
} else {
  console.warn(
    "Pinata API keys not configured. IPFS upload functionality will be disabled."
  );
}

/**
 * Uploads a JSON metadata object to IPFS using Pinata.
 * @param metadata - The metadata object to upload.
 * @param name - A name for the pinned file on Pinata.
 * @returns A promise resolving to the IPFS URI (e.g., "ipfs://<hash>").
 * @throws TRPCError if Pinata is not configured or upload fails.
 */
export async function uploadMetadataToIpfs(
  metadata: Record<string, unknown>,
  name: string = "Coin Metadata"
): Promise<string> {
  if (!pinata) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Pinata API keys not configured. Cannot upload to IPFS.",
    });
  }

  try {
    console.log("Uploading metadata to IPFS:", metadata);
    const result = await pinata.pinJSONToIPFS(metadata, {
      pinataMetadata: {
        name: name,
      },
      pinataOptions: {
        cidVersion: 0, // Use CIDv0 for broader compatibility, e.g., OpenSea
      },
    });
    const ipfsUri = `ipfs://${result.IpfsHash}`;
    console.log("Metadata uploaded successfully:", ipfsUri);
    return ipfsUri;
  } catch (error) {
    console.error("Error uploading metadata to Pinata:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to upload metadata to IPFS: ${
        error instanceof Error ? error.message : String(error)
      }`,
    });
  }
}
