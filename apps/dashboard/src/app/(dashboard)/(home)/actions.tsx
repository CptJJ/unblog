"use server"; // don't forget to add this!

import { actionClient } from "@/lib/safe-action";
import { z } from "zod";

// This schema is used to validate input from client.
const schema = z.object({
  url: z.string().url(),
});

export const crawlSite = actionClient
  .schema(schema)
  .action(async ({ parsedInput: { url } }) => {
    // await crawlSiteJob.invoke({
    //   url,
    // });
    return "done";
  });
