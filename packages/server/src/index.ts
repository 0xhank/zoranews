// Load environment variables
import dotenv from "dotenv";
dotenv.config();

import { createExpressMiddleware } from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import { appRouter } from "./routers/_app";

// Export type definition of API
export type { AppRouter } from "./routers/_app";

// Create express app
const app = express();

// Configure middleware
app.use(cors());
app.use(express.json());

// Serve tRPC
app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}),
  })
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 3069;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`tRPC API available at http://localhost:${PORT}/trpc`);
  console.log(`News scraper initialized and scheduled to run every 15 minutes`);
});
