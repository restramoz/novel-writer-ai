import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getNovels,
  getNovelById,
  createNovel,
  updateNovel,
  deleteNovel,
  getMasterConcept,
  createOrUpdateMasterConcept,
  getCharacters,
  createCharacter,
  getChapters,
  createChapter,
  updateChapter,
  getReadProgress,
  updateReadProgress,
} from "../db";
import { generateMasterConcept } from "../llm";

export const novelsRouter = router({
  // List all novels for the user
  list: protectedProcedure.query(async ({ ctx }) => {
    return await getNovels(ctx.user.id);
  }),

  // Get a specific novel
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const novel = await getNovelById(input.id, ctx.user.id);
      if (!novel) throw new Error("Novel not found");
      return novel;
    }),

  // Create a new novel
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        genre: z.string(),
        basicIdea: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await createNovel(ctx.user.id, input);
    }),

  // Update a novel
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        genre: z.string().optional(),
        status: z.enum(["planning", "writing", "completed"]).optional(),
        basicIdea: z.string().optional(),
        wordCount: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const novel = await getNovelById(id, ctx.user.id);
      if (!novel) throw new Error("Novel not found");

      return await updateNovel(id, ctx.user.id, data);
    }),

  // Delete a novel
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const novel = await getNovelById(input.id, ctx.user.id);
      if (!novel) throw new Error("Novel not found");

      return await deleteNovel(input.id, ctx.user.id);
    }),

  // Master Concept
  getMasterConcept: protectedProcedure
    .input(z.object({ novelId: z.string() }))
    .query(async ({ ctx, input }) => {
      const novel = await getNovelById(input.novelId, ctx.user.id);
      if (!novel) throw new Error("Novel not found");

      return await getMasterConcept(input.novelId);
    }),

  // Generate Master Concept with streaming
  generateMasterConcept: protectedProcedure
    .input(
      z.object({
        novelId: z.string(),
        synopsis: z.string(),
        genre: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const novel = await getNovelById(input.novelId, ctx.user.id);
      if (!novel) throw new Error("Novel not found");

      try {
        const conceptContent = await generateMasterConcept(
          input.synopsis,
          input.genre
        );

        // Parse the JSON response
        const concept = JSON.parse(conceptContent);

        // Save to database
        await createOrUpdateMasterConcept(input.novelId, {
          expandedSynopsis: concept.expandedSynopsis,
          plotOutline: concept.plotOutline,
          themes: concept.themes,
          tone: concept.tone,
          worldbuildingNotes: concept.worldbuildingNotes,
          storyArcs: concept.storyArcs || [],
        });

        return concept;
      } catch (error) {
        console.error("Error generating master concept:", error);
        throw new Error("Failed to generate master concept");
      }
    }),

  // Characters
  getCharacters: protectedProcedure
    .input(z.object({ novelId: z.string() }))
    .query(async ({ ctx, input }) => {
      const novel = await getNovelById(input.novelId, ctx.user.id);
      if (!novel) throw new Error("Novel not found");

      return await getCharacters(input.novelId);
    }),

  createCharacter: protectedProcedure
    .input(
      z.object({
        novelId: z.string(),
        name: z.string().min(1),
        role: z.string(),
        description: z.string().optional(),
        skills: z.array(z.string()).optional(),
        characteristics: z.record(z.string(), z.any()).optional(),
        appearance: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const novel = await getNovelById(input.novelId, ctx.user.id);
      if (!novel) throw new Error("Novel not found");

      const { novelId, ...charData } = input;
      return await createCharacter(novelId, charData);
    }),

  // Chapters
  getChapters: protectedProcedure
    .input(z.object({ novelId: z.string() }))
    .query(async ({ ctx, input }) => {
      const novel = await getNovelById(input.novelId, ctx.user.id);
      if (!novel) throw new Error("Novel not found");

      return await getChapters(input.novelId);
    }),

  createChapter: protectedProcedure
    .input(
      z.object({
        novelId: z.string(),
        chapterNumber: z.number(),
        title: z.string(),
        content: z.string().optional(),
        summary: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const novel = await getNovelById(input.novelId, ctx.user.id);
      if (!novel) throw new Error("Novel not found");

      const { novelId, ...chapterData } = input;
      return await createChapter(novelId, chapterData);
    }),

  updateChapter: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        novelId: z.string(),
        title: z.string().optional(),
        content: z.string().optional(),
        summary: z.string().optional(),
        status: z.enum(["draft", "review", "published"]).optional(),
        wordCount: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const novel = await getNovelById(input.novelId, ctx.user.id);
      if (!novel) throw new Error("Novel not found");

      const { id, novelId, ...data } = input;
      return await updateChapter(id, data);
    }),

  // Reading Progress
  getReadProgress: protectedProcedure
    .input(z.object({ novelId: z.string() }))
    .query(async ({ ctx, input }) => {
      const novel = await getNovelById(input.novelId, ctx.user.id);
      if (!novel) throw new Error("Novel not found");

      return await getReadProgress(ctx.user.id, input.novelId);
    }),

  updateReadProgress: protectedProcedure
    .input(
      z.object({
        novelId: z.string(),
        lastChapter: z.number(),
        scrollPercentage: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const novel = await getNovelById(input.novelId, ctx.user.id);
      if (!novel) throw new Error("Novel not found");

      const { novelId, ...data } = input;
      return await updateReadProgress(ctx.user.id, novelId, data);
    }),
});
