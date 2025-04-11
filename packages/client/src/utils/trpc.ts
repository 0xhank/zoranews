import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { type AppRouter } from "@zora-news/server/src/routers/_app";

// API url for the tRPC server
const apiUrl = "http://localhost:3069/trpc";

// Create tRPC client
export const trpc = createTRPCReact<AppRouter>();

// Create tRPC client config
export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: apiUrl,
    }),
  ],
});

// Types for easier imports
export type { AppRouter } from "@zora-news/server/src/routers/_app";
