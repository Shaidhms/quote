import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { GenerateNewsCaptionRequest, GenerateCaptionResponse } from "@/types";
import {
  generateNewsCaptionSystemPrompt,
  generateNewsCaptionUserPrompt,
} from "@/lib/prompts";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body: GenerateNewsCaptionRequest = await request.json();
    const { article, style, displayName, variant } = body;

    if (!article || !style) {
      return NextResponse.json(
        { caption: "", error: "Article and style are required" } satisfies GenerateCaptionResponse,
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      return NextResponse.json(
        { caption: "", error: "Gemini API key not configured" } satisfies GenerateCaptionResponse,
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = generateNewsCaptionSystemPrompt(style, variant);
    const userPrompt = generateNewsCaptionUserPrompt(article, displayName);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
        },
      ],
    });

    const parts = response.candidates?.[0]?.content?.parts;
    const text = parts
      ?.filter((p) => p.text)
      .map((p) => p.text)
      .join("");

    if (!text) {
      return NextResponse.json(
        { caption: "", error: "No caption generated. Try again." } satisfies GenerateCaptionResponse,
        { status: 500 }
      );
    }

    return NextResponse.json({ caption: text } satisfies GenerateCaptionResponse);
  } catch (error: unknown) {
    console.error("News caption generation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { caption: "", error: `Caption generation failed: ${message}` } satisfies GenerateCaptionResponse,
      { status: 500 }
    );
  }
}
