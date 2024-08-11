"use server"; // don't forget to add this!

import {} from "@/jobs/examples";
import { actionClient } from "@/lib/safe-action";
import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";
import { NodeHtmlMarkdown } from "node-html-markdown";
import { remark } from "remark";
import html from "remark-html";
import Sitemapper from "sitemapper";
import TurndownService from "turndown";
import urlMetadata from "url-metadata";
import { z } from "zod";

// This schema is used to validate input from client.
const schema = z.object({
  url: z.string().url(),
});

export const crawlSite = actionClient
  .schema(schema)
  .action(async ({ parsedInput: { url } }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return await fetchSitemap(url);
  });

const fetchSitemap = async (url: string) => {
  const sitemap_url = await findSitemapUrl(url);
  if (!sitemap_url) {
    throw new Error("Sitemap not found");
  }
  console.log("SITEMAP URL", sitemap_url);
  const site = new Sitemapper({
    url: sitemap_url,
    timeout: 5000, // 15 seconds
  });

  try {
    const { sites } = await site.fetch();
    console.log(sites);
    const pageDate = await crawlPage(url ?? "");
    return pageDate;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch sitemap");
  }
};

const crawlPage = async (url: string) => {
  console.log("Crawling page", url);
  const nhm = new NodeHtmlMarkdown(
    /* options (optional) */ {},
    /* customTransformers (optional) */ undefined,
    /* customCodeBlockTranslators (optional) */ undefined,
  );

  const response = await fetch(url);
  const html = await response.text();

  const $ = cheerio.load(html);

  function isHidden(element: AnyNode) {
    return (
      $(element).css("display") === "none" ||
      $(element).css("visibility") === "hidden" ||
      $(element).attr("hidden") !== undefined ||
      $(element).attr("aria-hidden") === "true" ||
      $(element).css("opacity") === "0" ||
      //class of hidden
      $(element).hasClass("hidden") ||
      //class of hidden
      $(element).hasClass("sr-only") ||
      //class of hidden
      $(element).hasClass("not-visible") ||
      //class of hidden
      $(element).hasClass("invisible")
    );
  }

  // Remove hidden elements
  $("*").each((index, element) => {
    if (isHidden(element)) {
      $(element).remove();
    }
  });

  // Remove unwanted elements
  $(
    "nav, " + // Navigation menus
      "header, " + // Page headers
      "footer, " + // Page footers
      "aside, " + // Sidebars
      "script, " + // JavaScript
      "style, " + // CSS
      "noscript, " + // Fallback content for when JS is disabled
      "iframe, " + // Embedded frames
      "ads, " + // Advertisement containers
      ".ad, " + // Common ad class
      ".advertisement, " + // Another common ad class
      "#sidebar, " + // Sidebars often have this ID
      ".sidebar, " + // Sidebars with class
      ".menu, " + // Menus
      ".nav, " + // Navigation elements
      ".related-posts, " + // Related content sections
      ".comments, " + // Comment sections
      ".social-share, " + // Social media sharing buttons
      ".widget, " + // Widgets (often in sidebars)
      '[role="banner"], ' + // Another way to identify headers
      '[role="navigation"]', // Another way to identify navigation
  ).remove();

  // Get the cleaned HTML
  const cleanedHtml = $("body").html();

  // Convert the cleaned HTML to Markdown
  const markdown = nhm.translate(cleanedHtml ?? "");

  return markdown;
};

async function findSitemapUrl(url: string) {
  try {
    // Check robots.txt first
    const robotsUrl = new URL("/robots.txt", url).toString();
    const robotsResponse = await fetch(robotsUrl);
    if (robotsResponse.status === 200) {
      const robotsTxt = await robotsResponse.text();
      const sitemapMatch = robotsTxt.match(/^Sitemap:\s*(.*)$/im);
      if (sitemapMatch) {
        return sitemapMatch[1]?.trim();
      }
    }

    // If not found in robots.txt, check the HTML
    const response = await fetch(url);
    const $ = cheerio.load(await response.text());
    const sitemapLink = $('link[rel="sitemap"]').attr("href");
    if (sitemapLink) {
      return new URL(sitemapLink, url).toString();
    }

    // If still not found, check common sitemap location
    const commonSitemapUrl = new URL("/sitemap.xml", url).toString();
    const sitemapResponse = await fetch(commonSitemapUrl);
    if (sitemapResponse.status === 200) {
      return commonSitemapUrl;
    }

    // If still not found, check common sitemap location
    const commonSitemapUrl2 = new URL(
      "/sitemap/sitemap-index.xml",
      url,
    ).toString();
    const sitemapResponse2 = await fetch(commonSitemapUrl2);
    if (sitemapResponse2.status === 200) {
      return commonSitemapUrl2;
    }

    return null; // Sitemap not found
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("An error occurred:", error.message);
    } else {
      console.error("An error occurred:", error);
    }
    return null;
  }
}
