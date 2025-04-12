import { TRPCError } from "@trpc/server";
import {
  createCoin,
  CreateCoinArgs,
  getCoin,
  getCoinComments,
  getProfile,
  getProfileBalances,
  getCoinsTopVolume24h as getTopCoins,
} from "@zoralabs/coins-sdk";
import {
  Address,
  createPublicClient,
  createWalletClient,
  Hex,
  http,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { z } from "zod";

import { uploadMetadataToIpfs } from "../lib/ipfsUploader";
import { newsScraper } from "../services/newsScraper";
import {
  generateCoinMetadata,
  generateImageFromHeadline,
} from "../services/openaiService";
import { publicProcedure, router } from "../trpc";

// --- Define Schemas --- //

const baseCoinSchema = {
  payoutRecipient: z
    .string()
    .refine((val) => /^0x[a-fA-F0-9]{40}$/.test(val), {
      message: "Invalid Ethereum address format",
    })
    .optional(),

  initialPurchaseWei: z.string().optional(),
};

// Schema for creating a coin manually
const createCoinManualSchema = z.object({
  name: z.string().min(1, "Name is required"),
  symbol: z.string().min(1, "Symbol is required"),
  description: z.string().min(1, "Description is required"),
  image: z.string().url("Image must be a valid URL"),
  ...baseCoinSchema, // Inherit symbol, recipient, etc.
});

// Schema for creating a coin from news
const createCoinFromNewsSchema = z.object({
  articleId: z.string().min(1, "Article ID is required"),
  ...baseCoinSchema, // Inherit symbol, optional recipient, etc.
});

// Schema for fetching coin details/comments
const coinAddressSchema = z.object({
  address: z.string().refine((val) => /^0x[a-fA-F0-9]{40}$/.test(val), {
    message: "Invalid Ethereum address format",
  }),
});

// Schema for profile-related fetches
const profileSchema = z.object({
  identifier: z.string().min(1, "Identifier is required"),
  count: z.number().min(1).max(100).optional(),
  after: z.string().optional(),
});

// --- Constants --- //

const RPC_URL = process.env.BASE_RPC_URL || "https://mainnet.base.org";

// --- Reusable Coin Creation Logic --- //
// Takes the manually defined schema as input
export async function executeCoinCreation(
  input: z.infer<typeof createCoinManualSchema>
) {
  try {
    // Construct metadata object from input
    const metadataToUpload = {
      name: input.name,
      symbol: input.symbol,
      description: input.description,
      image: input.image,
      properties: { category: "news" }, // Default to empty object if undefined
    };

    // Upload metadata to IPFS using the library function
    const metadataUri = await uploadMetadataToIpfs(
      metadataToUpload,
      `CoinMetadata - ${input.name}`
    );

    // Create coin call params using the generated URI
    const coinParams: CreateCoinArgs = {
      name: input.name,
      symbol: input.symbol,
      uri: metadataUri,
      payoutRecipient: input.payoutRecipient as Address,
      platformReferrer: input.payoutRecipient as Address,
      initialPurchaseWei: 0n,
    };

    // Set up viem clients
    const publicClient = createPublicClient({
      chain: base,
      transport: http(RPC_URL),
    });

    // Validate private key exists
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Server wallet private key not configured",
      });
    }

    // Create account from private key
    const account = privateKeyToAccount(privateKey as Hex);

    const walletClient = createWalletClient({
      account,
      chain: base,
      transport: http(RPC_URL),
    });

    await createCoin(
      coinParams,
      walletClient,
      publicClient
    );

    // Convert BigInts in the result to strings

    return {
      success: true,
      message: "Coin creation parameters generated successfully",
    };
  } catch (error) {
    console.error("Error during coin creation execution:", error);
    // Rethrow specific TRPC errors or wrap others
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to create coin: ${
        error instanceof Error ? error.message : String(error)
      }`,
    });
  }
}
// --- End Reusable Coin Creation Logic --- //

// --- Main Coin Router --- //

export const coinRouter = router({
  // Create a new coin manually (uses the reusable logic)
  createCoin: publicProcedure
    .input(createCoinManualSchema) // Use the manual schema
    .mutation(async ({ input }) => {
      // Directly call the reusable logic
      return await executeCoinCreation(input);
    }),

  // Create a new coin based on a news article
  createCoinFromNews: publicProcedure
    .input(createCoinFromNewsSchema) // Use the updated news schema
    .mutation(async ({ input }) => {
      // Determine the final payout recipient
      let finalPayoutRecipient: Address;
      const privateKey = process.env.PRIVATE_KEY;
      if (!privateKey) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Server wallet private key not configured",
        });
      }
      const serverAccount = privateKeyToAccount(privateKey as Hex);

      if (input.payoutRecipient) {
        // If client provided an address, use it
        finalPayoutRecipient = input.payoutRecipient as Address;
      } else {
        // Otherwise, default to the server's address
        finalPayoutRecipient = serverAccount.address;
      }

      // 1. Fetch News Article
      const article = newsScraper.getArticleById(input.articleId);
      if (!article) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `News article with ID ${input.articleId} not found.`,
        });
      }

      // 2. Generate Coin Data via OpenAI
      let generatedName: string;
      let generatedDescription: string;
      let generatedSymbol: string;
      let generatedImageUrl: string;
      try {
        console.log("Generating metadata from OpenAI...");
        const metadataResult = await generateCoinMetadata(
          article.summary || article.headline // Use summary or fallback to headline
        );
        generatedName = metadataResult.name;
        generatedDescription = metadataResult.description;
        generatedSymbol = metadataResult.symbol;
        console.log("Generated metadata");

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

      // Construct the input object conforming to createCoinManualSchema
      const creationInput: z.infer<typeof createCoinManualSchema> = {
        name: generatedName, // Use generated name
        symbol: generatedSymbol, // Use generated symbol
        description: generatedDescription, // Use generated description
        image: generatedImageUrl, // Use generated image URL
        payoutRecipient: finalPayoutRecipient, // Use the determined recipient
        initialPurchaseWei: input.initialPurchaseWei, // Pass through
      };

      // 4. Call the reusable coin creation logic
      return await executeCoinCreation(creationInput);
    }),

  // Get coin details
  getCoinDetails: publicProcedure
    .input(coinAddressSchema)
    .query(async ({ input }) => {
      try {
        const response = await getCoin({
          address: input.address as Address,
          chain: base.id,
        });

        return {
          success: true,
          data: response.data,
        };
      } catch (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Failed to fetch coin details: ${
            error instanceof Error ? error.message : String(error)
          }`,
        });
      }
    }),

  // Get coin comments
  getCoinComments: publicProcedure
    .input(
      z.object({
        address: z.string().min(1, "Address is required"),
        count: z.number().min(1).max(100).optional(),
        after: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await getCoinComments({
          address: input.address as Address,
          chain: base.id,
          count: input.count || 20,
          after: input.after,
        });

        return {
          success: true,
          data: response.data,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch coin comments: ${
            error instanceof Error ? error.message : String(error)
          }`,
        });
      }
    }),

  // Get profile
  getProfile: publicProcedure
    .input(
      z.object({
        identifier: z.string().min(1, "Identifier is required"),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await getProfile({
          identifier: input.identifier,
        });

        return {
          success: true,
          data: response.data,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch profile: ${
            error instanceof Error ? error.message : String(error)
          }`,
        });
      }
    }),

  // Get profile balances
  getProfileBalances: publicProcedure
    .input(profileSchema)
    .query(async ({ input }) => {
      try {
        const response = await getProfileBalances({
          identifier: input.identifier,
          count: input.count || 20,
          after: input.after,
        });

        return {
          success: true,
          data: response.data,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch profile balances: ${
            error instanceof Error ? error.message : String(error)
          }`,
        });
      }
    }),

  // Get top coins
  getTopCoins: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(100).optional() }))
    .query(async ({ input }) => {
      try {
        const response = await getTopCoins({}); // Assuming this fetches the data
        const data = response?.data; // Safely access data

        // Check if data and the expected structure exist
        if (
          !data ||
          !data.exploreList ||
          !Array.isArray(data.exploreList.edges)
        ) {
          console.warn(
            "Top coins data is not in the expected format or is empty."
          );
          return { success: true, data: [] }; // Return empty array if data is missing/malformed
        }

        // Type the edges for sorting
        type CoinEdge = (typeof data.exploreList.edges)[0];

        // Sort, limit, and return the data
        const sortedEdges = data.exploreList.edges.sort(
          (a: CoinEdge, b: CoinEdge) => {
            // Safely access volume24h, converting to numbers, defaulting to 0 if null/undefined
            const volumeA = Number(a?.node?.volume24h ?? 0);
            const volumeB = Number(b?.node?.volume24h ?? 0);
            return volumeB - volumeA;
          }
        );

        return {
          success: true,
          data: sortedEdges.slice(0, input.limit || 10), // Limit after sorting
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch top coins: ${
            error instanceof Error ? error.message : String(error)
          }`,
        });
      }
    }),
});
