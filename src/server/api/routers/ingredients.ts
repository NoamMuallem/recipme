import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "y/server/api/trpc";
import { NUMBER_OF_CHARACTERS_NEEDED_FOR_INGREDIENTS_TYPEAHEAD } from "y/constants";

export const ingredientsRouter = createTRPCRouter({
  suggestIngredients: protectedProcedure
    .input(
      z.object({
        searchString: z
          .string()
          .min(NUMBER_OF_CHARACTERS_NEEDED_FOR_INGREDIENTS_TYPEAHEAD),
      })
    )
    .query(({ ctx, input }) => {
      const { searchString } = input;
      const userID = ctx.session.user.id;
      if (searchString.length < 3) {
        return [];
      }

      return ctx.prisma.ingredientsName.findMany({
        where: {
          userID,
          name: { startsWith: searchString },
        },
        orderBy: {
          count: "desc",
        },
      });
    }),
});
