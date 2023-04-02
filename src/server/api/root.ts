import { createTRPCRouter } from "y/server/api/trpc";
import { ingredientsRouter } from "./routers/ingredients";
import { tagsRouter } from "./routers/tags";
import { ratingRouter } from "./routers/ratings";
import { recipeRouter } from "./routers/recipes";
import { exampleRouter } from "./routers/example";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  recipe: recipeRouter,
  rating: ratingRouter,
  tags: tagsRouter,
  ingredients: ingredientsRouter,
  example: exampleRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
