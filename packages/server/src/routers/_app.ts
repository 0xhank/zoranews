import { router } from "../trpc";
import { memecoinRouter } from "./memecoin";
import { newsRouter } from "./news";

// Main app router combines all subrouters
export const appRouter = router({
  newsRouter: newsRouter,
  memecoin: memecoinRouter,
});

// Export type definition of the API
export type AppRouter = typeof appRouter;
