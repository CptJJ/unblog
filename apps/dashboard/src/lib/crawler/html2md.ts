import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";
import { NodeHtmlMarkdown } from "node-html-markdown";

export async function html2md(url: string) {
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
      $(element).hasClass("hidden") ||
      $(element).hasClass("sr-only") ||
      $(element).hasClass("not-visible") ||
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
}
