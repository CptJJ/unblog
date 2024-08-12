import { logger, task, wait } from '@trigger.dev/sdk/v3'
import { findSideMapUrl, crawlSiteMap } from '@/lib/crawler/sitemap'
import { setStatusToPending } from './db-connection'

export const helloWorldTask = task({
  id: 'hello-world1',
  run: async (payload: { url: string }, { ctx }) => {
    logger.log('Hello, world!', { payload, ctx })

    await setStatusToPending(payload.url)

    const siteMapUrl = await findSideMapUrl(payload.url)
    if (!siteMapUrl) {
      logger.error('Sitemap not found')
      throw new Error('Sitemap not found')
    }
    logger.log(`Site map url found: ${siteMapUrl}`)

    const pages = await crawlSiteMap(siteMapUrl)
    if (!pages || pages.length === 0) {
      throw new Error('Sitemap not able to be parsed')
    }

    logger.log(`Total number of pages found: ${pages.length}`)

    await wait.for({ seconds: 5 })

    return {
      url: payload.url,
    }
  },

  onSuccess: async ({ url }) => {
    // await databaseConnection()
    //   .update(tables.websites)
    //   .set({ crawlStatus: 'done' })
    //   .where(eq(tables.websites.url, url))
  },
})
