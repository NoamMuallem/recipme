import { createTRPCRouter } from "y/server/api/trpc";
import { ingredientsRouter } from "./routers/ingredients";
import { tagsRouter } from "./routers/tags";
import { recipeRouter } from "./routers/recipes";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  recipe: recipeRouter,
  tags: tagsRouter,
  ingredients: ingredientsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
