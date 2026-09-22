import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { findings, reviews } from "~/server/db/schema";

export const reviewRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.reviews.findMany({
      where: eq(reviews.createdById, ctx.session.user.id),
      orderBy: [desc(reviews.createdAt)],
      limit: 50,
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        title: z.string().min(1).max(255),
        description: z.string().max(4000).optional(),
        applicationUrl: z.string().url().optional(),
        gitBranch: z.string().max(255).optional(),
        gitCommit: z.string().max(64).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [review] = await ctx.db
        .insert(reviews)
        .values({ ...input, createdById: ctx.session.user.id })
        .returning();
      return review;
    }),

  /**
   * Readable without a session when the caller holds the share token — the
   * token is the credential (§35). Workspace-scoped reads go through `list`.
   */
  byShareToken: publicProcedure
    .input(z.object({ shareToken: z.string().length(32) }))
    .query(async ({ ctx, input }) => {
      const review = await ctx.db.query.reviews.findFirst({
        where: eq(reviews.shareToken, input.shareToken),
      });
      if (!review || review.visibility !== "link") return null;

      const found = await ctx.db.query.findings.findMany({
        where: eq(findings.reviewId, review.id),
        orderBy: [desc(findings.rankScore)],
        with: { evidence: true },
      });
      return { review, findings: found };
    }),
});
