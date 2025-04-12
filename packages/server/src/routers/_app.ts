import { router } from "../trpc";
import { coinRouter } from "./coin";
import { newsRouter } from "./news";
import { workflowRouter } from "./workflow";

// Main app router combines all subrouters
export const appRouter = router({
  news: newsRouter,
  coin: coinRouter,
  workflow: workflowRouter,
});

// Export type definition of the API
export type AppRouter = typeof appRouter;
