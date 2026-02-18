import { defineCollection, z } from "astro:content";

const books = defineCollection({
  schema: z.object({
    book_id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    updated_at: z.string().optional()
  })
});

const chapters = defineCollection({
  schema: z.object({
    book_id: z.string(),
    chapter_id: z.string(),
    order: z.number().int().positive(),
    title: z.string(),
    source_type: z.enum(["full", "chapter"]),
    source_file: z.string(),
    content_hash: z.string(),
    updated_at: z.string(),
    status: z.enum(["active", "archived"])
  })
});

export const collections = {
  books,
  chapters
};
