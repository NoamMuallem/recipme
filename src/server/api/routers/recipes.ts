import { protectedProcedure, publicProcedure } from "./../trpc";
import { z } from "zod";
import { createTRPCRouter } from "y/server/api/trpc";
import { type Prisma } from "@prisma/client";
import { Units } from "y/index.d";

export type Filter = {
  ingredients?: string[];
  tags?: string[];
  title?: string;
  rating?: number;
  favoritesOnly?: boolean;
  myRecipes?: boolean;
};

export const ZodFilter = {
  ingredients: z.string().array().optional(),
  tags: z.string().array().optional(),
  title: z.string().optional(),
  rating: z.number().optional(),
  favoritesOnly: z.boolean().default(false),
  myRecipes: z.boolean().default(false),
};

export type Sort = {
  direction: "desc" | "asc";
  field: "title" | "createdAt" | "averageRating";
};

export const ZodSort = {
  direction: z.enum(["asc", "desc"]),
  field: z.enum(["title", "createdAt", "averageRating"]),
};

export type RecipeInput = {
  title: string;
  ingredients: {
    amount: number;
    name: string;
    unit: Units;
  }[];
  description: string;
  yield: number;
  directions: string;
  image: string;
  tags: {
    name: string;
  }[];
};

export const ZodRecipeInput = z.object({
  title: z
    .string({ required_error: "Recipe title must be provided" })
    .min(4)
    .max(15),
  ingredients: z
    .object({
      amount: z.number({
        required_error: "amount of ingredient must be provided",
      }),
      unit: z.nativeEnum(Units, {
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
  tags: z
    .object({
      name: z.string({ required_error: "tag name must be provided" }),
    })
    .array(),
}) satisfies z.ZodType<RecipeInput>;

const paginationInputSchema = {
  limit: z.number().default(10),
  page: z.number().default(1),
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
        recipeID: z.string().nullish(),
      })
    )
    .query(({ ctx, input }) => {
      //Query 2
      if (!input.recipeID) return;
      return ctx.prisma.recipe.findUnique({
        where: {
          id: input.recipeID,
        },
        include: {
          ingredients: {
            select: {
              ingredientName: true,
              amount: true,
            },
          },
        },
      });
    }),

  getRecipes: publicProcedure
    .input(
      z.object({
        pagination: z.object(paginationInputSchema),
        sort: z.object(ZodSort),
        filter: z.object(ZodFilter),
      })
    )
    .query(({ ctx, input }) => {
      const {
        pagination: { page, limit },
        sort,
        filter,
      } = input;
      const skip = (page - 1) * limit;
      const where = buildWhereFilter(filter);
      const orderBy = buildOrderBy(sort);

      return ctx.prisma.recipe.findMany({
        where,
        orderBy,
        take: limit,
        skip,
        include: {
          ingredients: true,
          recipeTags: {
            select: {
              tag: true,
            },
          },
          ratings: true,
          user: true,
        },
      });
    }),

  authGetRecipes: protectedProcedure
    .input(
      z.object({
        pagination: z.object(paginationInputSchema),
        sort: z.object(ZodSort),
        filter: z.object(ZodFilter),
      })
    )
    .query(({ ctx, input }) => {
      const {
        pagination: { page, limit },
        sort,
        filter,
      } = input;
      const skip = (page - 1) * limit;
      const where = buildWhereFilter(filter);
      const orderBy = buildOrderBy(sort);
      const userID = ctx.session.user.id;

      //authenticated users only properties
      if (filter.favoritesOnly) {
        where.favoritedBy = {
          some: {
            userID,
          },
        };
      }

      if (filter.myRecipes) {
        where.userId = userID;
      }

      return ctx.prisma.recipe.findMany({
        where,
        orderBy,
        take: limit,
        skip,
        include: {
          ingredients: {
            select: {
              ingredientName: true,
            },
          },
          recipeTags: {
            select: {
              tag: true,
            },
          },
          ratings: true,
          user: true,
          favoritedBy: {
            where: {
              userID,
            },
          },
        },
      });
    }),

  createRecipe: protectedProcedure
    .input(ZodRecipeInput)
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
            create: tags.map(({ name }) => ({
              tag: {
                connectOrCreate: {
                  create: { name, count: 1 },
                  where: { name },
                },
              },
            })),
          },
          ingredients: {
            create: ingredients.map((ingredient) => ({
              amount: ingredient.amount,
              unit: ingredient.unit as Units,
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
            unit: z.nativeEnum(Units, {
              required_error: "amount of ingredient must be provided",
            }),
          })
          .array(),
        description: z.string(),
        yield: z.number(),
        directions: z.string(),
        image: z.string(),
        tags: z
          .object({
            name: z.string({ required_error: "tag name must be provided" }),
          })
          .array(),
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
      const addedTags = tags.filter(({ name }) => !currentTags.includes(name));
      const removedTags = currentTags.filter(
        (tagID) => !tags.map(({ name }) => name).includes(tagID)
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
            create: addedTags.map(({ name }) => ({
              tag: {
                connectOrCreate: {
                  create: { name, count: 1 },
                  where: { name },
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
              unit: ingredient.unit as Units,
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

const buildWhereFilter = (filter: Filter) => {
  const where: Prisma.RecipeWhereInput = {};

  if (filter?.ingredients && filter.ingredients.length > 0) {
    where.ingredients = {
      some: {
        ingredientName: {
          name: {
            in: filter.ingredients,
          },
        },
      },
    };
  }

  if (filter?.tags && filter.tags.length > 0) {
    where.recipeTags = {
      some: {
        tag: {
          name: {
            in: filter.tags,
          },
        },
      },
    };
  }

  if (filter.title) {
    where.title = {
      contains: filter.title,
      mode: "insensitive",
    };
  }

  if (filter.rating) {
    where.averageRating = {
      gte: filter.rating,
    };
  }

  return where;
};

const buildOrderBy = (sort: Sort) => {
  const orderBy: Prisma.RecipeOrderByWithAggregationInput = {};

  if (sort) {
    if (sort.field === "title") {
      orderBy.title = sort.direction;
    } else if (sort.field === "createdAt") {
      orderBy.createdAt = sort.direction;
    } else if (sort.field === "averageRating") {
      orderBy.averageRating = sort.direction;
    }
  }

  return orderBy;
};
