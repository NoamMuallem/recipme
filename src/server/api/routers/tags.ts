import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "y/server/api/trpc";

export const tagsRouter = createTRPCRouter({
  suggestsTags: protectedProcedure
    .input(z.object({ searchString: z.string() }))
    .query(({ ctx, input }) => {
      const userID = ctx.session?.user.id;
      const { searchString } = input;

      return ctx.prisma.tag.findMany({
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
