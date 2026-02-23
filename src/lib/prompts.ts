import { Quote, ImageStyle, CaptionStyle } from "@/types";

const SCENE_MAP: Record<string, string> = {
  Productivity: "modern minimalist workspace with warm golden lighting, notebook and coffee on desk",
  Mindset: "serene mountain summit at golden hour, clouds below, wide horizon",
  Leadership: "standing at the helm of a ship overlooking a vast ocean at sunrise",
  Entrepreneurship: "bustling startup office with whiteboard full of ideas, dynamic energy",
  "Self-improvement": "peaceful Japanese garden with cherry blossoms and a stone path",
  Innovation: "futuristic lab with holographic displays and blue ambient lighting",
  Relationships: "cozy library with warm fireplace, two armchairs, books everywhere",
};

export function generateNanoBananaPrompt(
  quote: Quote,
  displayName: string
): string {
  const scene = SCENE_MAP[quote.category] || "elegant professional setting with warm lighting";

  return `Professional cinematic photo of ${displayName}, standing in a ${scene}. The person looks thoughtful and confident. The quote "${quote.quote_text}" is elegantly overlaid in clean white serif typography. Subtle bokeh background. LinkedIn professional style. Square 1080x1080 format. High quality, photorealistic, cinematic lighting.`;
}

export function generateLinkedInCaption(quote: Quote): string {
  const hashtags = [
    "#LinkedInPost",
    "#BookWisdom",
    "#DailyQuote",
    `#${quote.category.replace(/[^a-zA-Z]/g, "")}`,
    `#${quote.book_name.replace(/[^a-zA-Z]/g, "")}`,
    "#PersonalGrowth",
    "#Leadership",
    "#Motivation",
  ];

  return `"${quote.quote_text}"

— ${quote.author}, ${quote.book_name}

This quote resonates because it reminds us that ${getCategoryReflection(quote.category)}.

What does this quote mean to you? Share your thoughts below.

${hashtags.join(" ")}`;
}

function getCategoryReflection(category: string): string {
  const reflections: Record<string, string> = {
    Productivity: "true productivity comes from intentional systems, not just working harder",
    Mindset: "our thoughts shape our reality more than any external circumstance",
    Leadership: "great leadership is about serving others and creating lasting impact",
    Entrepreneurship: "the entrepreneurial journey demands courage, vision, and relentless execution",
    "Self-improvement": "growth is a continuous journey, not a destination",
    Innovation: "breakthrough ideas come from challenging conventional thinking",
    Relationships: "meaningful connections are the foundation of both personal and professional success",
  };
  return reflections[category] || "wisdom from great books can transform our perspective";
}

// --- Image Generation Prompts ---

const STYLE_INSTRUCTIONS: Record<ImageStyle, string> = {
  illustration:
    "in a hand-drawn editorial illustration style with bold colors, clean lines, and slightly stylized proportions. Think New Yorker magazine illustration.",
  cinematic:
    "as a cinematic photograph with dramatic lighting, shallow depth of field, and filmic color grading. Photorealistic, DSLR quality.",
  watercolor:
    "in a loose watercolor painting style with soft washes of color, visible brush texture, and dreamy atmospheric quality.",
  digital_art:
    "as polished digital concept art with vibrant colors, detailed environments, and a semi-realistic aesthetic.",
  minimalist:
    "in a clean minimalist style with simple shapes, limited color palette, plenty of negative space, and elegant composition.",
};

export function generateImagePrompt(
  quote: Quote,
  displayName: string,
  style: ImageStyle
): string {
  const scene =
    SCENE_MAP[quote.category] ||
    "elegant professional setting with warm lighting";
  const styleInstruction = STYLE_INSTRUCTIONS[style];

  return `Create an image ${styleInstruction}

Scene: ${displayName} is in a ${scene}. The person looks thoughtful and confident.

Context: This image accompanies the quote "${quote.quote_text}" by ${quote.author} from the book "${quote.book_name}".

The mood should reflect the theme of ${quote.category.toLowerCase()}.
Make the person in the provided reference photo the central figure in this scene.
Square 1:1 aspect ratio. High quality.`;
}

// --- Caption Generation Prompts ---

export function generateCaptionSystemPrompt(style: CaptionStyle): string {
  const prompts: Record<CaptionStyle, string> = {
    professional: "",
    story: `You are a LinkedIn storytelling expert. Write a first-person narrative LinkedIn post (150-250 words) that uses the given quote as the anchor. Start with a personal anecdote or scenario that leads into the quote. Make it feel authentic, relatable, and end with a takeaway. Use line breaks between paragraphs for readability. Include 5-8 relevant hashtags at the end.`,
    motivational: `You are a motivational LinkedIn writer. Write a short, punchy LinkedIn post (80-120 words) that is energizing and direct. Use the quote as the centerpiece. Short sentences. Bold claims. End with a call-to-action. Include 5-8 relevant hashtags at the end.`,
    question: `You are a thought-leadership LinkedIn writer. Open the post with a provocative, thought-provoking question inspired by the quote. Then present the quote with context. Close by asking the audience to reflect and share their perspective. Keep it to 100-150 words. Include 5-8 relevant hashtags at the end.`,
  };
  return prompts[style];
}

export function generateCaptionUserPrompt(
  quote: Quote,
  displayName: string
): string {
  return `Quote: "${quote.quote_text}"
Author: ${quote.author}
Book: ${quote.book_name}
Category: ${quote.category}
Posted by: ${displayName}

Write the LinkedIn post now.`;
}
