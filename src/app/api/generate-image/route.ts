import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { GenerateImageRequest, GenerateImageResponse } from "@/types";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body: GenerateImageRequest = await request.json();
    const { prompt, imageBase64 } = body;

    if (!prompt) {
      return NextResponse.json(
        { imageBase64: "", error: "Prompt is required" } satisfies GenerateImageResponse,
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      return NextResponse.json(
        { imageBase64: "", error: "Gemini API key not configured. Add GOOGLE_GEMINI_API_KEY to .env.local" } satisfies GenerateImageResponse,
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Build contents: text prompt + optional reference image
    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
      { text: prompt },
    ];

    if (imageBase64 && imageBase64.length > 0) {
      const base64Data = imageBase64.includes(",")
        ? imageBase64.split(",")[1]
        : imageBase64;

      const mimeType = imageBase64.startsWith("data:")
        ? imageBase64.split(";")[0].split(":")[1]
        : "image/jpeg";

      parts.push({
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [{ role: "user", parts }],
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    });

    // Extract generated image from response
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      return NextResponse.json(
        { imageBase64: "", error: "No response from Gemini. Try a different prompt." } satisfies GenerateImageResponse,
        { status: 500 }
      );
    }

    const responseParts = candidates[0].content?.parts;
    if (!responseParts) {
      return NextResponse.json(
        { imageBase64: "", error: "Empty response from Gemini." } satisfies GenerateImageResponse,
        { status: 500 }
      );
    }

    let generatedImageBase64 = "";
    for (const part of responseParts) {
      if (part.inlineData?.data) {
        generatedImageBase64 = part.inlineData.data;
        break;
      }
    }

    if (!generatedImageBase64) {
      return NextResponse.json(
        { imageBase64: "", error: "No image generated. The prompt may have triggered safety filters. Try modifying it." } satisfies GenerateImageResponse,
        { status: 500 }
      );
    }

    return NextResponse.json({
      imageBase64: generatedImageBase64,
    } satisfies GenerateImageResponse);
  } catch (error: unknown) {
    console.error("Image generation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { imageBase64: "", error: `Generation failed: ${message}` } satisfies GenerateImageResponse,
      { status: 500 }
    );
  }
}
