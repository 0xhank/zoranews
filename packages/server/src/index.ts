// Load environment variables
import dotenv from "dotenv";
dotenv.config();

import { createExpressMiddleware } from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import { appRouter } from "./routers/_app.js";

// Export type definition of API
export type { AppRouter } from "./routers/_app.js";

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
  console.log(`Server running on port ${PORT}`);
  console.log(`tRPC API available at ${PORT}/trpc`);
});
