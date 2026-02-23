import { NextResponse } from "next/server";
import { AINewsArticle, FetchAINewsResponse } from "@/types";

// Multiple RSS sources for diverse AI news, India locale for Google News
const RSS_FEEDS = [
  {
    url: "https://news.google.com/rss/search?q=artificial+intelligence+AI+when:2d&hl=en-IN&gl=IN&ceid=IN:en",
    fallbackSource: "Google News",
  },
  {
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
    fallbackSource: "TechCrunch",
  },
  {
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
    fallbackSource: "The Verge",
  },
  {
    url: "https://feeds.arstechnica.com/arstechnica/technology-lab",
    fallbackSource: "Ars Technica",
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

function parseItems(xml: string, fallbackSource: string): AINewsArticle[] {
  const itemRegex = /<item>([\s\S]*?)<\/item>|<entry>([\s\S]*?)<\/entry>/g;
  const articles: AINewsArticle[] = [];
  const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;

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

    // Only include articles from last 2 days
    if (publishedMs < twoDaysAgo) continue;

    const id = Buffer.from(link || title).toString("base64url").slice(0, 20);

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
        error: "No recent AI news found. Try refreshing in a few minutes.",
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
        error: `News fetch failed: ${message}`,
      } satisfies FetchAINewsResponse,
      { status: 500 }
    );
  }
}
