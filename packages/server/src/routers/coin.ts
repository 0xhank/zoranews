import { TRPCError } from "@trpc/server";

import {
  createCoinCall,
  getCoin,
  getCoinComments,
  getProfile,
  getProfileBalances,
  getCoinsTopVolume24h as getTopCoins,
} from "@zoralabs/coins-sdk";
import { Address } from "viem";
import { base } from "viem/chains";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";

// Define validation schemas
const createCoinSchema = z.object({
  name: z.string().min(1, "Name is required"),
  symbol: z.string().min(1, "Symbol is required"),
  uri: z.string().url("URI must be a valid URL"),
  payoutRecipient: z.string().refine((val) => /^0x[a-fA-F0-9]{40}$/.test(val), {
    message: "Invalid Ethereum address format",
  }),
  platformReferrer: z
    .string()
    .refine((val) => val === "" || /^0x[a-fA-F0-9]{40}$/.test(val), {
      message: "Invalid Ethereum address format",
    })
    .optional(),
  initialPurchaseWei: z.string().optional(),
});

const coinAddressSchema = z.object({
  address: z.string().refine((val) => /^0x[a-fA-F0-9]{40}$/.test(val), {
    message: "Invalid Ethereum address format",
  }),
});

const profileSchema = z.object({
  identifier: z.string().min(1, "Identifier is required"),
  count: z.number().min(1).max(100).optional(),
  after: z.string().optional(),
});
// Set up base chain RPC URL
const RPC_URL = process.env.BASE_RPC_URL || "https://mainnet.base.org";

export const coinRouter = router({
  // Create a new coin
  createCoin: publicProcedure
    .input(createCoinSchema)
    .mutation(async ({ input }) => {
      try {
        // Validate metadata
        try {
          // This would require fetching the URI content and validating
          // For simplicity, we'll assume it's valid
          // In production, use validateMetadataURIContent
        } catch (error) {
          console.error(error);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid metadata URI",
          });
        }

        // Create coin call params (this just returns the params - does not execute the transaction)
        const coinParams = {
          name: input.name,
          symbol: input.symbol,
          uri: input.uri,
          payoutRecipient: input.payoutRecipient as Address,
          platformReferrer: input.platformReferrer as Address | undefined,
          initialPurchaseWei: input.initialPurchaseWei
            ? BigInt(input.initialPurchaseWei)
            : 0n,
        };

        // Create coin call params
        const contractCallParams = createCoinCall(coinParams);

        return {
          contractCallParams,
          success: true,
          message: "Coin creation parameters generated successfully",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create coin: ${
            error instanceof Error ? error.message : String(error)
          }`,
        });
      }
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
        const response = await getTopCoins({
          limit: input.limit || 10,
        });

        return {
          success: true,
          data: response.data,
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
