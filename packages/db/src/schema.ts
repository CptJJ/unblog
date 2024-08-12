import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const websites = pgTable('websites', {
  url: text('url').primaryKey(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  crawlStatus: text('crawl_status', { enum: ['none', 'done', 'pending'] })
    .notNull()
    .default('none'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type InsertWebsite = typeof websites.$inferInsert
export type Website = typeof websites.$inferSelect
