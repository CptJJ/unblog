import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const websites = pgTable("websites", {
  id: text("url").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export type InsertWebsite = typeof websites.$inferInsert;
export type Website = typeof websites.$inferSelect;
