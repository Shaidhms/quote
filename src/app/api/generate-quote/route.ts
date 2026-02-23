import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

interface GenerateQuoteRequest {
  book_name: string;
  author: string;
  category: string;
  current_quote: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateQuoteRequest = await request.json();
    const { book_name, author, category, current_quote } = body;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Anthropic API key not configured. Add ANTHROPIC_API_KEY to .env.local" },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `You are a book quote curator. Give me ONE different famous quote from the book "${book_name}" by ${author}.

These quotes have already been used — do NOT repeat ANY of them:
${current_quote.split(" ||| ").map((q, i) => `${i + 1}. "${q}"`).join("\n")}

Pick a completely different and unique quote from the same book that has NOT been listed above.

The quote should fit the category: ${category}
It should be suitable for a LinkedIn professional audience.

Reply with ONLY a JSON object in this exact format, nothing else:
{"quote_text": "the quote here", "author": "${author}", "book_name": "${book_name}"}`,
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    const text = textBlock?.type === "text" ? textBlock.text : "";

    if (!text) {
      return NextResponse.json(
        { error: "No quote generated" },
        { status: 500 }
      );
    }

    // Parse JSON from response (strip markdown code fences if present)
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json({
      quote_text: parsed.quote_text,
      author: parsed.author || author,
      book_name: parsed.book_name || book_name,
    });
  } catch (error: unknown) {
    console.error("Quote generation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Quote generation failed: ${message}` },
      { status: 500 }
    );
  }
}
