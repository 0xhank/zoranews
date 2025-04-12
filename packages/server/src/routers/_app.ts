import { router } from "../trpc.js";
import { coinRouter } from "./coin.js";
import { newsRouter } from "./news.js";
import { workflowRouter } from "./workflow.js";

// Main app router combines all subrouters
export const appRouter = router({
  news: newsRouter,
  coin: coinRouter,
  workflow: workflowRouter,
});

// Export type definition of the API
export type AppRouter = typeof appRouter;
