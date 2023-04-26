import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "y/server/api/trpc";

const zodRecipeIDObject = {
  recipeID: z.string({
    required_error: "recipeID must be provided",
  }),
};

const zodFavoriteObject = {
  ...zodRecipeIDObject,
  favorite: z.boolean(),
};

export const favoriteRouter = createTRPCRouter({
  getRecipeUserFavorite: protectedProcedure
    .input(z.object(zodRecipeIDObject))
    .query(async ({ ctx, input }) => {
      const userID = ctx.session.user.id;
      return ctx.prisma.recipe.findUnique({
        where: {
          id: input.recipeID,
        },
        select: {
          favoritedBy: {
            where: {
              userID,
            },
          },
        },
      });
    }),

  updateRating: protectedProcedure
    .input(z.object(zodFavoriteObject))
    .mutation(({ ctx, input }) => {
      const { recipeID, favorite } = input;
      const userID = ctx.session.user.id;
      if (favorite) {
        return ctx.prisma.favorite.create({
          data: {
            user: {
              connect: {
                id: userID,
              },
            },
            recipe: {
              connect: {
                id: recipeID,
              },
            },
          },
        });
      }

      return ctx.prisma.favorite.delete({
        where: {
          userID_recipeID: {
            userID,
            recipeID,
          },
        },
      });
    }),
});
