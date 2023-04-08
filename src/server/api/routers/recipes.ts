import { protectedProcedure, publicProcedure } from "./../trpc";
import { z } from "zod";

import { createTRPCRouter } from "y/server/api/trpc";

const paginationInputSchema = {
  limit: z.number().default(10),
  page: z.number().default(1),
};

type RecipeInput = {
  title: string;
  ingredients: {
    amount: number;
    name: string;
  }[];
  description: string;
  yield: number;
  directions: string;
  image: string;
  tags: string[];
};

export const recipeRouter = createTRPCRouter({
  getAllMy: publicProcedure.query(({ ctx }) => {
    //Query 1
    return ctx.prisma.recipe.findMany({
      where: {
        userId: ctx.session?.user.id,
      },
    });
  }),

  getOne: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      //Query 2
      return ctx.prisma.recipe.findUnique({
        where: {
          id: input.id,
        },
      });
    }),

  findTopRated: publicProcedure
    .input(z.object(paginationInputSchema))
    .query(({ ctx, input }) => {
      const { page, limit } = input;
      const skip = (page - 1) * limit;
      //Query 3
      return ctx.prisma.recipe.findMany({
        orderBy: {
          averageRating: "desc",
        },
        take: limit,
        skip,
      });
    }),

  findRecentlyCreated: publicProcedure
    .input(z.object(paginationInputSchema))
    .query(({ ctx, input }) => {
      const { page, limit } = input;
      const skip = (page - 1) * limit;
      //Query 4
      return ctx.prisma.recipe.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip,
      });
    }),

  findUserFavorites: protectedProcedure
    .input(z.object(paginationInputSchema))
    .query(async ({ ctx, input }) => {
      const { page, limit } = input;
      const userID = ctx.session.user.id;
      const skip = (page - 1) * limit;
      //Query 5
      const favoriteRecipes = await ctx.prisma.favorite.findMany({
        where: {
          userID,
        },
        skip,
        take: limit,
        select: {
          recipe: true,
        },
      });

      return favoriteRecipes.map((favorite) => favorite.recipe);
    }),

  findByIngredients: publicProcedure
    .input(
      z.object({
        ...paginationInputSchema,
        ingredientsNames: z.string().array(),
      })
    )
    .query(({ ctx, input }) => {
      const { page, limit, ingredientsNames } = input;
      const skip = (page - 1) * limit;
      //Query 6
      return ctx.prisma.recipe.findMany({
        where: {
          ingredients: {
            some: {
              ingredientName: {
                name: {
                  in: ingredientsNames,
                },
              },
            },
          },
        },
        skip: skip,
        take: limit,
      });
    }),

  createRecipe: protectedProcedure
    .input(
      z.object({
        title: z
          .string({ required_error: "Recipe title must be provided" })
          .min(4)
          .max(15),
        ingredients: z
          .object({
            amount: z.number({
              required_error: "amount of ingredient must be provided",
            }),
            name: z
              .string({ required_error: "ingredient name must be provided" })
              .min(3)
              .max(15),
          })
          .array(),
        description: z.string(),
        yield: z.number(),
        directions: z.string(),
        image: z.string(),
        tags: z.string().array(),
      }) satisfies z.ZodType<RecipeInput>
    )
    .mutation(async ({ ctx, input }) => {
      const { tags, ingredients, ...rest } = input;
      const userID = ctx.session.user.id;

      //Query 7
      return await ctx.prisma.recipe.create({
        data: {
          ...rest,
          user: {
            connect: {
              id: userID,
            },
          },
          recipeTags: {
            create: tags.map((tag) => ({
              tag: {
                connectOrCreate: {
                  create: { name: tag, count: 1 },
                  where: { name: tag },
                },
              },
            })),
          },
          ingredients: {
            create: ingredients.map((ingredient) => ({
              amount: ingredient.amount,
              ingredientName: {
                connectOrCreate: {
                  create: { name: ingredient.name, count: 1 },
                  where: { name: ingredient.name },
                },
              },
            })),
          },
        },
      });
    }),

  updateRecipe: protectedProcedure
    .input(
      z.object({
        id: z.string({ required_error: "Recipe ID must be provided" }),
        title: z.string().min(4).max(15),
        ingredients: z
          .object({
            amount: z.number({}),
            name: z.string().min(3).max(15),
          })
          .array(),
        description: z.string(),
        yield: z.number(),
        directions: z.string(),
        image: z.string(),
        tags: z.string().array(),
      }) satisfies z.ZodType<RecipeInput>
    )
    .mutation(async ({ ctx, input }) => {
      const { tags, ingredients, id, ...rest } = input;

      // Query 8
      const currentRecipe = await ctx.prisma.recipe.findUnique({
        where: { id },
        include: {
          recipeTags: {
            select: {
              tag: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          ingredients: {
            select: {
              ingredientName: true,
              ingredientNameId: true,
            },
          },
        },
      });

      if (!currentRecipe) throw new Error("Recipe not found");

      const currentTags = currentRecipe.recipeTags.map(
        (recipeTag) => recipeTag.tag.name
      );
      const currentIngredients = currentRecipe.ingredients.map(
        (ingredient) => ingredient.ingredientNameId
      );

      // Find added and removed tags
      const addedTags = tags.filter((tag) => !currentTags.includes(tag));
      const removedTags = currentTags.filter(
        (tagID) => !tags.map((tag) => tag).includes(tagID)
      );

      // Find added and removed ingredients
      const addedIngredients = ingredients.filter(
        (ingredient) => !currentIngredients.includes(ingredient.name)
      );
      const removedIngredients = currentIngredients.filter(
        (ingredientID) =>
          !ingredients
            .map((ingredient) => ingredient.name)
            .includes(ingredientID)
      );

      // Query 9
      return await ctx.prisma.recipe.update({
        where: { id },
        data: {
          ...rest,
          recipeTags: {
            deleteMany: removedTags.map((tagID) => ({ tagID })),
            create: addedTags.map((tag) => ({
              tag: {
                connectOrCreate: {
                  create: { name: tag, count: 1 },
                  where: { name: tag },
                },
              },
            })),
          },
          ingredients: {
            deleteMany: removedIngredients.map((ingredientNameId) => ({
              ingredientNameId,
            })),
            create: addedIngredients.map((ingredient) => ({
              amount: ingredient.amount,
              ingredientName: {
                connectOrCreate: {
                  create: { name: ingredient.name, count: 1 },
                  where: { name: ingredient.name },
                },
              },
            })),
          },
        },
      });
    }),

  deleteRecipe: protectedProcedure
    .input(
      z.object({
        id: z.string({ required_error: "recipe ID must be provided" }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      // Query 10
      const recipeToDelete = await ctx.prisma.recipe.findUnique({
        where: { id },
        include: {
          recipeTags: {
            select: {
              tag: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          ingredients: {
            select: {
              ingredientName: true,
              ingredientNameId: true,
            },
          },
        },
      });

      if (!recipeToDelete) throw new Error("Recipe not found");

      await Promise.all([
        // Query 11
        ...recipeToDelete.recipeTags.map((tag) =>
          ctx.prisma.tag.update({
            where: { id: tag.tag.id },
            data: { count: { decrement: 1 } },
          })
        ),
        // Query 12
        ...recipeToDelete.ingredients.map((ingredient) =>
          ctx.prisma.ingredientsName.update({
            where: { id: ingredient.ingredientNameId },
            data: { count: { decrement: 1 } },
          })
        ),
      ]);

      // Query 13
      return await ctx.prisma.recipe.delete({
        where: { id },
      });
    }),
});
