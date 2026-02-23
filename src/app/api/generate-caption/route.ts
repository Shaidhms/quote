import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { GenerateCaptionRequest, GenerateCaptionResponse } from "@/types";
import {
  generateCaptionSystemPrompt,
  generateCaptionUserPrompt,
} from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const body: GenerateCaptionRequest = await request.json();
    const { quote, style, displayName } = body;

    if (!quote || !style) {
      return NextResponse.json(
        { caption: "", error: "Quote and style are required" } satisfies GenerateCaptionResponse,
        { status: 400 }
      );
    }

    if (style === "professional") {
      return NextResponse.json(
        { caption: "", error: "Professional captions are generated client-side" } satisfies GenerateCaptionResponse,
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      return NextResponse.json(
        { caption: "", error: "Gemini API key not configured. Add GOOGLE_GEMINI_API_KEY to .env.local" } satisfies GenerateCaptionResponse,
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = generateCaptionSystemPrompt(style);
    const userPrompt = generateCaptionUserPrompt(quote, displayName);

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
    console.error("Caption generation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { caption: "", error: `Caption generation failed: ${message}` } satisfies GenerateCaptionResponse,
      { status: 500 }
    );
  }
}
