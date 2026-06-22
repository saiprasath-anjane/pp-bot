import { pgTable, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const crawlJobs = pgTable('crawl_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  baseUrl: text('base_url').notNull(),
  status: text('status').notNull().default('pending'), // pending, crawling, done, failed
  pagesFound: integer('pages_found').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow()
});

export const pages = pgTable('pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  crawlJobId: uuid('crawl_job_id').references(() => crawlJobs.id),
  url: text('url').notNull(),
  title: text('title'),
  createdAt: timestamp('created_at').defaultNow()
});

export const chunks = pgTable('chunks', {
  id: uuid('id').primaryKey().defaultRandom(),
  pageId: uuid('page_id').references(() => pages.id),
  content: text('content').notNull(),
  chunkIndex: integer('chunk_index').notNull()
});

export const pagesRelations = relations(pages, ({ many, one }) => ({
  chunks: many(chunks),
  crawlJob: one(crawlJobs, {
    fields: [pages.crawlJobId],
    references: [crawlJobs.id]
  })
}));

export const chunksRelations = relations(chunks, ({ one }) => ({
  page: one(pages, {
    fields: [chunks.pageId],
    references: [pages.id]
  })
}));
