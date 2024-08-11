import * as cheerio from "cheerio";
import Sitemapper from "sitemapper";

export async function findSideMapUrl(url: string) {
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

export async function crawlSiteMap(siteMapUrl: string) {
  const sitemapper = new Sitemapper({
    url: siteMapUrl,
    timeout: 10000, // 15 seconds
  });

  try {
    const { sites } = await sitemapper.fetch();
    return sites;
  } catch (error) {
    console.log(error);
    return [];
  }
}
