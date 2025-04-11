import { router } from "../trpc";
import { coinRouter } from "./coin";
import { newsRouter } from "./news";

// Main app router combines all subrouters
export const appRouter = router({
  newsRouter: newsRouter,
  coin: coinRouter,
});

// Export type definition of the API
export type AppRouter = typeof appRouter;
