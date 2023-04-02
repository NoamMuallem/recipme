import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "y/server/api/trpc";

const zodRecipeIDObject = {
  recipeID: z.string({
    required_error: "recipeID must be provided",
  }),
};

const zodRatingObject = {
  ...zodRecipeIDObject,
  stars: z
    .number({ required_error: "number of rating must be provided" })
    .min(1)
    .max(5),
  comment: z.string().max(255),
};

export const ratingRouter = createTRPCRouter({
  addRating: protectedProcedure
    .input(z.object(zodRatingObject))
    .query(async ({ ctx, input }) => {
      const { comment, recipeID, stars } = input;
      const userID = ctx.session.user.id;

      // Query 16
      const recipe = await ctx.prisma.recipe.findUnique({
        where: { id: recipeID },
        include: { ratings: true },
      });

      if (!recipe) {
        throw new Error("Recipe not found");
      }

      // Query 17
      const newRating = await ctx.prisma.rating.create({
        data: {
          stars,
          comment,
          recipe: {
            connect: {
              id: recipeID,
            },
          },
          user: {
            connect: {
              id: userID,
            },
          },
        },
      });

      const newAverageRating =
        (recipe.averageRating * recipe.ratings.length + stars) /
        (recipe.ratings.length + 1);

      // Query 18
      await ctx.prisma.recipe.update({
        where: { id: recipeID },
        data: { averageRating: newAverageRating },
      });

      return newRating;
    }),

  updateRating: protectedProcedure
    .input(z.object(zodRatingObject))
    .query(async ({ ctx, input }) => {
      const { comment, recipeID, stars } = input;
      const userID = ctx.session.user.id;
      // Query 19
      const rating = await ctx.prisma.rating.findUnique({
        where: { userID_recipeID: { userID, recipeID } },
        include: { recipe: true },
      });

      if (!rating) {
        throw new Error("Rating not found");
      }

      const shouldUpdateStars = rating.stars !== stars;
      const shouldUpdateComment = rating.comment !== comment;
      const shouldUpdate = shouldUpdateStars || shouldUpdateComment;

      if (!shouldUpdate) return;

      // Query 20
      const updatedRating = await ctx.prisma.rating.update({
        where: { userID_recipeID: { userID, recipeID } },
        data: { stars, comment },
      });

      if (shouldUpdateStars) {
        // Query 21
        const recipe = await ctx.prisma.recipe.findUnique({
          where: { id: rating.recipeID },
          include: { ratings: true },
        });

        if (!recipe) {
          throw new Error("Recipe not found");
        }

        const newAverageRating =
          (recipe.averageRating * recipe.ratings.length -
            rating.stars +
            stars) /
          recipe.ratings.length;

        // Query 22
        await ctx.prisma.recipe.update({
          where: { id: rating.recipe.id },
          data: { averageRating: newAverageRating },
        });
      }

      return updatedRating;
    }),

  //not sure if deleting rating is allowed, would like to support it
  delete: protectedProcedure
    .input(z.object(zodRecipeIDObject))
    .query(async ({ ctx, input }) => {
      const { recipeID } = input;
      const userID = ctx.session.user.id;
      // Query 23
      const rating = await ctx.prisma.rating.findUnique({
        where: { userID_recipeID: { userID, recipeID } },
        include: { recipe: true },
      });

      if (!rating) {
        throw new Error("Rating not found");
      }

      // Query 24
      await ctx.prisma.rating.delete({
        where: { userID_recipeID: { userID, recipeID } },
      });

      // Query 25
      const recipe = await ctx.prisma.recipe.findUnique({
        where: { id: rating.recipe.id },
        include: { ratings: true },
      });

      if (!recipe) {
        throw new Error("Recipe not found");
      }

      const newAverageRating =
        recipe.ratings.length > 1
          ? (recipe.averageRating * recipe.ratings.length - rating.stars) /
            (recipe.ratings.length - 1)
          : 0;

      // Query 26
      await ctx.prisma.recipe.update({
        where: { id: recipeID },
        data: { averageRating: newAverageRating },
      });

      return rating;
    }),
});
