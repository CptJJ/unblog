'use server' // don't forget to add this!

import { actionClient } from '@/lib/safe-action'
import { z } from 'zod'
import { helloWorldTask } from '@/trigger/example'
import { db, eq, tables } from '@unblog/db'

// This schema is used to validate input from client.
const actionSchema = z.object({
  url: z.string().url(),
})

export const crawlSite = actionClient
  .schema(actionSchema)
  .action(async ({ parsedInput: { url } }) => {
    // await crawlSiteJob.invoke({
    //   url,
    // });
    const websiteData = await db.query.websites.findFirst({
      where: eq(tables.websites.url, url),
    })

    if (!websiteData) {
      await db.insert(tables.websites).values({
        url: url,
      })
    } else if (websiteData?.crawlStatus === 'done') {
      return 'done'
    } else if (websiteData?.crawlStatus === 'pending') {
      return 'pending'
    }

    const response = await helloWorldTask.trigger({
      url: url,
    })

    return response.id
  })
