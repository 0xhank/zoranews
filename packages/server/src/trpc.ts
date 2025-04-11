import { initTRPC } from "@trpc/server";

// Initialize tRPC backend
const t = initTRPC.create();

// Export tRPC router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;
