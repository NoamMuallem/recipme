import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "y/server/api/trpc";
import { NUMBER_OF_CHARACTERS_NEEDED_FOR_INGREDIENTS_TYPEAHEAD } from "y/constants";
const paginationInputSchema = {
  limit: z.number().default(10),
  page: z.number().default(1),
};
export const ingredientsRouter = createTRPCRouter({
  suggestIngredients: publicProcedure
    .input(
      z.object({
        text: z
          .string()
          .min(NUMBER_OF_CHARACTERS_NEEDED_FOR_INGREDIENTS_TYPEAHEAD),
        ...paginationInputSchema,
      })
    )
    .query(({ ctx, input }) => {
      const { page, limit, text } = input;
      const skip = (page - 1) * limit;
      // Query 15
      return ctx.prisma.ingredientsName.findMany({
        where: {
          name: {
            startsWith: text,
          },
          count: {
            gt: 0,
          },
        },
        orderBy: {
          count: "desc",
        },
        take: limit,
        skip,
      });
    }),
});
