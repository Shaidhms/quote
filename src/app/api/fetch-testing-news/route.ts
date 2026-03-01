import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { AINewsArticle, FetchAINewsResponse } from "@/types";

// Google News queries use multi-word quoted phrases to avoid ambiguity.
// Single-word tool names like "Selenium" or "Playwright" are NOT used alone
// because they match chemistry / theater results.
const RSS_FEEDS = [
  // AI + software testing (highly specific phrases only)
  {
    url: "https://news.google.com/rss/search?q=%22test+automation%22+OR+%22software+testing%22+OR+%22QA+automation%22+OR+%22quality+assurance+software%22+when:14d&hl=en&gl=US&ceid=US:en",
    fallbackSource: "Google News",
  },
  // Performance & load testing tools (with disambiguating context)
  {
    url: "https://news.google.com/rss/search?q=%22JMeter+performance%22+OR+%22LoadRunner+testing%22+OR+%22Gatling+load+test%22+OR+%22performance+testing+tool%22+OR+%22load+testing+tool%22+when:14d&hl=en&gl=US&ceid=US:en",
    fallbackSource: "Google News",
  },
  // AI-specific testing news
  {
    url: "https://news.google.com/rss/search?q=%22AI+test+automation%22+OR+%22AI+software+testing%22+OR+%22AI+QA%22+OR+%22AI+bug+detection%22+OR+%22AI+code+review%22+OR+%22copilot+testing%22+when:14d&hl=en&gl=US&ceid=US:en",
    fallbackSource: "Google News",
  },
  // Test frameworks with disambiguating words
  {
    url: "https://news.google.com/rss/search?q=%22Selenium+WebDriver%22+OR+%22Playwright+testing%22+OR+%22Cypress+automation%22+OR+%22Appium+mobile+testing%22+OR+%22SDET%22+OR+%22shift+left+testing%22+when:14d&hl=en&gl=US&ceid=US:en",
    fallbackSource: "Google News",
  },
  {
    url: "https://feeds.feedburner.com/ministryoftesting",
    fallbackSource: "Ministry of Testing",
  },
];

function extractTag(xml: string, tag: string): string {
  const match = xml.match(
    new RegExp(
      `<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([\\s\\S]*?)</${tag}>`
    )
  );
  return match ? (match[1] || match[2] || "").trim() : "";
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[^;]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ---- Relevance filtering ----

// These multi-word phrases are unambiguous (no false positives)
const SAFE_KEYWORDS =
  /\btest automation\b|\bautomated testing\b|\bQA engineer\b|\bQA automation\b|\bSDET\b|\bshift.left\b|\bunit test(s|ing)?\b|\be2e test(s|ing)?\b|\bend.to.end test\b|\bregression test(s|ing)?\b|\bload test(s|ing)?\b|\bperformance test(s|ing)?\b|\bstress test(s|ing)?\b|\bAPI test(s|ing)?\b|\bintegration test(s|ing)?\b|\btest framework\b|\btest suite\b|\btest coverage\b|\btest case(s)?\b|\bsoftware test(s|ing)?\b|\bsoftware quality\b|\btest generat\b|\bbug detect\b|\btest execut\b|\btest orchestrat\b|\btest pipeline\b|\bCI.CD test\b|\btest driven\b|\bbehavior driven\b|\btest infrastructure\b|\bquality engineering\b|\bperformance engineering\b/i;

// Tool names that are ambiguous on their own — require a software context word nearby
const AMBIGUOUS_TOOLS =
  /\bselenium\b|\bplaywright\b|\bcypress\b|\bpostman\b|\bgatling\b|\bcucumber\b/i;

const SOFTWARE_CONTEXT =
  /\btest(s|ing|er)?\b|\bautomation\b|\bQA\b|\bbrowser\b|\bwebdriver\b|\bCI.CD\b|\bframework\b|\bdevops\b|\bsoftware\b|\bAPI\b|\bweb\b|\bmobile\b|\bcode\b|\bbug\b|\bregression\b|\bpipeline\b|\bopen.source\b|\bnpm\b|\bgithub\b|\bselenium\b|\bscript\b|\brelease\b/i;

// Tool names that are unambiguous (multi-word or unique to testing)
const UNIQUE_TOOLS =
  /\bselenium webdriver\b|\bplaywright test\b|\bcypress\.io\b|\bcypress automation\b|\bjmeter\b|\bloadrunner\b|\bload runner\b|\bappium\b|\btestng\b|\bjunit\b|\bpytest\b|\brobot framework\b|\bsonarqube\b|\btricentis\b|\bsauce labs\b|\bbrowserstack\b|\blambdatest\b|\bmabl\b|\btestim\b|\bapplitool\b|\bk6 load\b|\bk6 test\b|\btestcomplete\b|\bkatalon\b|\branorex\b|\bqtest\b|\bzephyr\b|\bxray test\b/i;

// Hard exclude: topics that are definitely NOT software testing
const EXCLUDE_KEYWORDS =
  /\bclinical trial\b|\bdrug test\b|\bmedical test\b|\bblood test\b|\bcovid test\b|\bvaccine\b|\bpatient\b|\bFDA\b|\bdiagnos\b|\bcrash test\b|\bemission test\b|\bnuclear test\b|\bmissile test\b|\bweapon test\b|\bdoping\b|\bantidoping\b|\bplaywright.*award\b|\bplaywright.*theater\b|\bplaywright.*theatre\b|\bplaywright.*play\b|\bplaywright.*drama\b|\bplaywright.*stage\b|\bplaywright.*broadway\b|\btheater\b|\btheatre\b|\bbroadway\b|\bmusical\b|\bopera\b|\bfilm festival\b|\bscreenwriter\b|\bscreenplay\b|\bnovelist\b|\bpoet\b|\bsupplement\b|\bnutrient\b|\bmineral\b|\bdietary\b/i;

function isTestingRelated(title: string, description: string): boolean {
  const text = `${title} ${description}`;

  // Hard exclude non-software content
  if (EXCLUDE_KEYWORDS.test(text)) return false;

  // Unambiguous software testing phrases — always accept
  if (SAFE_KEYWORDS.test(text)) return true;

  // Unambiguous tool names — always accept
  if (UNIQUE_TOOLS.test(text)) return true;

  // Ambiguous tool names — only accept if software context word is also present
  if (AMBIGUOUS_TOOLS.test(text) && SOFTWARE_CONTEXT.test(text)) return true;

  return false;
}

function parseItems(xml: string, fallbackSource: string): AINewsArticle[] {
  const itemRegex = /<item>([\s\S]*?)<\/item>|<entry>([\s\S]*?)<\/entry>/g;
  const articles: AINewsArticle[] = [];
  const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;

  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1] || match[2];
    const title = stripHtml(extractTag(item, "title"));

    // Handle different link formats (RSS vs Atom)
    let link =
      extractTag(item, "link") ||
      item.match(/<link\s*\/>([^<]+)/)?.[1]?.trim() ||
      "";
    // Atom feeds use <link href="..."/>
    if (!link) {
      const hrefMatch = item.match(/<link[^>]*href="([^"]+)"/);
      if (hrefMatch) link = hrefMatch[1];
    }

    const description = stripHtml(
      extractTag(item, "description") ||
        extractTag(item, "summary") ||
        extractTag(item, "content")
    ).slice(0, 300);

    const pubDate =
      extractTag(item, "pubDate") ||
      extractTag(item, "published") ||
      extractTag(item, "updated");
    const source =
      stripHtml(extractTag(item, "source")) ||
      extractTag(item, "dc:creator") ||
      fallbackSource;

    if (!title) continue;

    const publishedAt = pubDate
      ? new Date(pubDate).toISOString()
      : new Date().toISOString();
    const publishedMs = new Date(publishedAt).getTime();

    // Only include articles from last 14 days
    if (publishedMs < fourteenDaysAgo) continue;

    // Filter ALL sources for software testing relevance
    if (!isTestingRelated(title, description)) {
      continue;
    }

    const id = createHash("sha256")
      .update(link || title)
      .digest("base64url")
      .slice(0, 24);

    articles.push({ id, title, description, url: link, source, publishedAt });
  }
  return articles;
}

async function fetchFeed(
  url: string,
  fallbackSource: string
): Promise<AINewsArticle[]> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "LinkedInPostGen/1.0" },
      next: { revalidate: 900 },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseItems(xml, fallbackSource);
  } catch {
    return [];
  }
}

function dedupeByTitle(articles: AINewsArticle[]): AINewsArticle[] {
  const seen = new Set<string>();
  return articles.filter((a) => {
    const key = a.title.toLowerCase().slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function GET() {
  try {
    // Fetch all feeds in parallel
    const results = await Promise.all(
      RSS_FEEDS.map((feed) => fetchFeed(feed.url, feed.fallbackSource))
    );

    // Merge, dedupe, and sort by date (newest first)
    const allArticles = results.flat();
    const unique = dedupeByTitle(allArticles);
    unique.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    if (unique.length === 0) {
      return NextResponse.json({
        articles: [],
        fetchedAt: new Date().toISOString(),
        error:
          "No recent AI testing news found. Try refreshing in a few minutes.",
      } satisfies FetchAINewsResponse);
    }

    return NextResponse.json({
      articles: unique,
      fetchedAt: new Date().toISOString(),
    } satisfies FetchAINewsResponse);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        articles: [],
        fetchedAt: new Date().toISOString(),
        error: `Testing news fetch failed: ${message}`,
      } satisfies FetchAINewsResponse,
      { status: 500 }
    );
  }
}
