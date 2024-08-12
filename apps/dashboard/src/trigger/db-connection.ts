import { db, tables, eq } from '@unblog/db'

export const setStatusToPending = async (url: string) => {
  await db
    .update(tables.websites)
    .set({ crawlStatus: 'pending' })
    .where(eq(tables.websites.url, url))
}
