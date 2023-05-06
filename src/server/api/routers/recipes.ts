import { Units } from "y/index.d";
import { createTRPCRouter } from "y/server/api/trpc";
import { z } from "zod";
import { protectedProcedure, publicProcedure } from "./../trpc";
import { uploadBase64 } from "y/server/cloudinary";

export type Filter = {
  ingredientNames?: string[];
  tagNames?: string[];
  titleSubstring?: string;
};

export const ZodFilter = {
  ingredientNames: z.string().array().optional(),
  tagNames: z.string().array().optional(),
  titleSubstring: z.string().optional(),
};

export type RecipeInput = {
  title: string;
  ingredients: {
    amount: number;
    name: string;
    unit: Units;
  }[];
  description: string;
  yieldValue: number;
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
  yieldValue: z.number(),
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
          recipeTags: {
            select: {
              tag: true,
              tagID: true,
            },
          },
          ingredients: {
            select: {
              ingredientName: true,
              amount: true,
            },
          },
        },
      });
    }),

  getRecipes: protectedProcedure
    .input(
      z.object({
        pagination: z.object(paginationInputSchema),
        filter: z.object(ZodFilter),
      })
    )
    .query(({ ctx, input }) => {
      const { titleSubstring, ingredientNames, tagNames } = input.filter;
      const userID = ctx.session.user.id;

      return ctx.prisma.recipe.findMany({
        where: {
          userID,
          title:
            titleSubstring && titleSubstring.trim() !== ""
              ? { contains: titleSubstring }
              : undefined,
          ingredients:
            ingredientNames && ingredientNames.length > 0
              ? { every: { ingredientName: { name: { in: ingredientNames } } } }
              : undefined,
          recipeTags:
            tagNames && tagNames.length > 0
              ? { every: { tag: { name: { in: tagNames } } } }
              : undefined,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          ingredients: true,
          recipeTags: { include: { tag: true } },
        },
      });
    }),

  createRecipe: protectedProcedure
    .input(ZodRecipeInput)
    .mutation(async ({ ctx, input }) => {
      const {
        tags,
        ingredients,
        title,
        description,
        yieldValue,
        directions,
        image,
      } = input;
      const userID = ctx.session.user.id;

      let coudinaryImageUrl = image;
      try {
        coudinaryImageUrl = await uploadBase64(image);
      } catch (e) {
        console.error(e);
      }

      //Query 7
      return await ctx.prisma.recipe.create({
        data: {
          title,
          description,
          yield: yieldValue,
          directions,
          image: coudinaryImageUrl,
          user: { connect: { id: userID } },
          recipeTags: {
            create: tags.map((tag) => ({
              tag: {
                connectOrCreate: {
                  create: {
                    name: tag.name,
                    count: 1,
                    user: { connect: { id: userID } },
                  },
                  where: { name: tag.name },
                },
              },
            })),
          },
          ingredients: {
            create: ingredients.map((ingredient) => ({
              ingredientName: {
                connectOrCreate: {
                  create: {
                    name: ingredient.name,
                    count: 1,
                    user: { connect: { id: userID } },
                  },
                  where: { name: ingredient.name },
                },
              },
              unit: ingredient.unit,
              amount: ingredient.amount,
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
        yieldValue: z.number(),
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
      const {
        tags,
        ingredients,
        id,
        title,
        description,
        directions,
        yieldValue,
        image,
      } = input;
      const userID = ctx.session.user.id;

      return ctx.prisma.recipe.update({
        where: { id },
        data: {
          title,
          description,
          yield: yieldValue,
          directions,
          image,
          recipeTags: {
            deleteMany: {},
            create: tags.map((tag) => ({
              tag: {
                connectOrCreate: {
                  create: {
                    name: tag.name,
                    count: 1,
                    user: { connect: { id: userID } },
                  },
                  where: { name: tag.name },
                },
              },
            })),
          },
          ingredients: {
            deleteMany: {},
            create: ingredients.map((ingredient) => ({
              ingredientName: {
                connectOrCreate: {
                  create: {
                    name: ingredient.name,
                    count: 1,
                    user: { connect: { id: userID } },
                  },
                  where: { name: ingredient.name },
                },
              },
              unit: ingredient.unit,
              amount: ingredient.amount,
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
      const userID = ctx.session.user.id;
      const recipe = await ctx.prisma.recipe.findUnique({
        where: { id },
        include: {
          ingredients: {
            include: {
              ingredientName: true,
            },
          },
          recipeTags: { include: { tag: true } },
        },
      });

      if (!recipe || recipe.userID !== userID) {
        throw new Error("Recipe not found or unauthorized access");
      }

      // Prepare update operations for tags count
      const updateTagsCount = recipe.recipeTags.map((recipeTag) => {
        const updatedTagCount = recipeTag.tag.count - 1;
        return ctx.prisma.tag.update({
          where: { id: recipeTag.tagID },
          data: { count: updatedTagCount },
        });
      });

      // Prepare update operations for ingredients count
      const updateIngredientsCount = recipe.ingredients.map((ingredient) => {
        const updatedIngredientCount = ingredient.ingredientName.count - 1;
        return ctx.prisma.ingredientsName.update({
          where: { id: ingredient.ingredientNameId },
          data: { count: updatedIngredientCount },
        });
      });

      // Prepare delete operation for the recipe
      const deleteRecipeOperation = ctx.prisma.recipe.delete({ where: { id } });

      // Perform all operations within a transaction
      await ctx.prisma.$transaction([
        ...updateTagsCount,
        ...updateIngredientsCount,
        deleteRecipeOperation,
      ]);
    }),
});
