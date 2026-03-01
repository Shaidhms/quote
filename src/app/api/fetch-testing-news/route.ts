import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { AINewsArticle, FetchAINewsResponse } from "@/types";

// RSS feeds focused on software test automation, QA tools, performance engineering
const RSS_FEEDS = [
  // Specific tool names + AI to get highly relevant results
  {
    url: "https://news.google.com/rss/search?q=%22Selenium%22+OR+%22Playwright%22+OR+%22Cypress+testing%22+OR+%22JMeter%22+OR+%22LoadRunner%22+OR+%22Gatling%22+OR+%22k6+testing%22+when:14d&hl=en&gl=US&ceid=US:en",
    fallbackSource: "Google News",
  },
  // AI + software testing specific phrases
  {
    url: "https://news.google.com/rss/search?q=%22AI+test+automation%22+OR+%22AI+software+testing%22+OR+%22AI+QA+engineer%22+OR+%22copilot+testing%22+OR+%22AI+code+review%22+OR+%22AI+bug+detection%22+when:14d&hl=en&gl=US&ceid=US:en",
    fallbackSource: "Google News",
  },
  // QA platforms and test frameworks
  {
    url: "https://news.google.com/rss/search?q=%22test+automation+framework%22+OR+%22SDET%22+OR+%22performance+engineering%22+OR+%22shift+left+testing%22+OR+%22CI+CD+testing%22+OR+%22Appium%22+OR+%22TestNG%22+when:14d&hl=en&gl=US&ceid=US:en",
    fallbackSource: "Google News",
  },
  // Load/perf testing specific
  {
    url: "https://news.google.com/rss/search?q=%22load+testing+tool%22+OR+%22performance+testing+tool%22+OR+%22API+testing%22+OR+%22Postman%22+OR+%22software+quality%22+AI+when:14d&hl=en&gl=US&ceid=US:en",
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

// Software testing tool names and specific terms (high confidence)
const TOOL_KEYWORDS =
  /\bselenium\b|\bcypress\b|\bplaywright\b|\bjmeter\b|\bloadrunner\b|\bload runner\b|\bgatling\b|\bk6\b|\bappium\b|\btestng\b|\bjunit\b|\bpytest\b|\brobot framework\b|\bcucumber\b|\bpostman\b|\bsonarqube\b|\btricentis\b|\bsauce labs\b|\bbrowserstack\b|\blambdatest\b|\bmabl\b|\btestim\b|\bapplitool/i;

// Software testing concepts (must appear with software/code/dev context)
const TESTING_CONCEPTS =
  /\btest automation\b|\bQA engineer\b|\bQA automation\b|\bSDET\b|\bshift.left\b|\bCI.CD\b|\bunit test\b|\be2e test\b|\bend.to.end test\b|\bregression test\b|\bload test\b|\bperformance test\b|\bstress test\b|\bAPI test\b|\bintegration test\b|\btest framework\b|\btest suite\b|\btest case\b|\btest coverage\b|\bbug detect\b|\bcode review\b|\btest generat\b|\bsoftware test\b|\bsoftware quality\b|\bquality assurance\b|\bperformance engineer/i;

// Exclude non-software testing (medical, clinical, drug, etc.)
const EXCLUDE_KEYWORDS =
  /\bclinical trial\b|\bdrug test\b|\bmedical test\b|\bblood test\b|\bcovid test\b|\bvaccine\b|\bpatient\b|\bFDA\b|\bdiagnos\b|\bcrash test\b|\bemission test\b|\bnuclear test\b|\bmissile test\b|\bweapon test\b|\bdoping\b|\bantidoping\b/i;

function isTestingRelated(title: string, description: string): boolean {
  const text = `${title} ${description}`;
  // Exclude medical/military/automotive testing
  if (EXCLUDE_KEYWORDS.test(text)) return false;
  // Include if mentions specific tools
  if (TOOL_KEYWORDS.test(text)) return true;
  // Include if mentions software testing concepts
  if (TESTING_CONCEPTS.test(text)) return true;
  return false;
}

function parseItems(xml: string, fallbackSource: string): AINewsArticle[] {
  const itemRegex = /<item>([\s\S]*?)<\/item>|<entry>([\s\S]*?)<\/entry>/g;
  const articles: AINewsArticle[] = [];
  const sevenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;

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

    // Only include articles from last 14 days (wider window for niche topic)
    if (publishedMs < sevenDaysAgo) continue;

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
