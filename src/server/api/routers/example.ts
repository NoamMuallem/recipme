import { protectedProcedure, publicProcedure } from "./../trpc";
import { z } from "zod";

import { createTRPCRouter } from "y/server/api/trpc";

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query(({ input }) => {
      return { greeting: `hello from ${input.text}` };
    }),

  getSecretMessage: protectedProcedure.query(() => {
    return "this is a secret message";
  }),
});
