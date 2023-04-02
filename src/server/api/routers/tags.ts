import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "y/server/api/trpc";
const paginationInputSchema = {
  limit: z.number().default(10),
  page: z.number().default(1),
};

export const tagsRouter = createTRPCRouter({
  suggestsTags: publicProcedure
    .input(z.object({ text: z.string(), ...paginationInputSchema }))
    .query(({ ctx, input }) => {
      const { page, limit, text } = input;
      const skip = (page - 1) * limit;
      // Query 14
      return ctx.prisma.tag.findMany({
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
