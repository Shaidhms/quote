import { Quote, AINewsArticle, ImageStyle, CaptionStyle } from "@/types";

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
    first_person: `You are a top LinkedIn thought-leadership ghostwriter. Write a LinkedIn post (200-300 words) in a punchy, narrative storytelling style.

STRICT FORMAT RULES:
- Each line should be 1 sentence MAX. Use a blank line between every line for breathing room.
- Open with a bold, contrarian or attention-grabbing one-liner that hooks the reader.
- Then add "But what if..." or a reframe that challenges conventional thinking.
- Introduce the quote/concept with **bold markdown** on key terms.
- Build a narrative arc: problem → insight → shift in thinking.
- Use bullet points (• or –) for lists of 3-5 items when listing benefits, takeaways, or action items.
- Use bold (**text**) to emphasize key phrases — not entire sentences, just 2-3 words.
- End with a forward-looking, inspiring 2-3 line closing that motivates action.
- Close with exactly 6-8 hashtags on the last line, no more.

TONE: Professional, reflective, confident. Like a senior leader sharing hard-won wisdom. NOT motivational-poster generic. NOT corporate jargon. Write like a real person who thinks deeply.

DO NOT: Use emojis. Use exclamation marks excessively. Write long paragraphs. Use filler phrases like "Let me share" or "Here's the thing."`,
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

// --- AI News Prompts ---

export function generateNewsImagePrompt(
  article: AINewsArticle,
  displayName: string,
  style: ImageStyle,
  variant?: "ai-news" | "ai-testing"
): string {
  const styleInstruction = STYLE_INSTRUCTIONS[style];

  if (variant === "ai-testing") {
    return `Create an image ${styleInstruction}

Scene: A professional QA engineer or test automation expert (${displayName || "a professional person"}) working on cutting-edge AI-powered testing solutions.

Context: The news headline is: "${article.title}" from ${article.source}.

The visual should convey precision, quality engineering, and AI-powered automation.
Think test dashboards, performance metrics, code analysis screens, CI/CD pipelines, green checkmarks on test suites, or a person analyzing test results on multiple monitors.
The mood should be technically sophisticated and quality-focused.
Square 1:1 aspect ratio. High quality. LinkedIn professional context.`;
  }

  return `Create an image ${styleInstruction}

Scene: A professional AI researcher or tech executive (${displayName || "a professional person"}) reacting to breaking news about artificial intelligence.

Context: The news headline is: "${article.title}" from ${article.source}.

The visual should convey innovation, technology, and forward-thinking.
Think data visualizations, neural network aesthetics, futuristic interfaces, or a person reading/presenting cutting-edge AI news.
The mood should be intellectually exciting and authoritative.
Square 1:1 aspect ratio. High quality. LinkedIn professional context.`;
}

export function generateNewsLinkedInCaption(
  article: AINewsArticle,
  variant?: "ai-news" | "ai-testing"
): string {
  if (variant === "ai-testing") {
    const hashtags = [
      "#AITesting",
      "#QAAutomation",
      "#SoftwareTesting",
      "#TestAutomation",
      "#QualityAssurance",
      "#PerformanceTesting",
      "#AIinQA",
    ];

    return `AI is reshaping Testing: ${article.title}

${article.description || "This development marks another milestone in how AI is transforming software testing and quality assurance."}

Via ${article.source}

How is AI changing the way you approach testing? Share your experience below.

${hashtags.join(" ")}`;
  }

  const hashtags = [
    "#AI",
    "#ArtificialIntelligence",
    "#MachineLearning",
    "#TechNews",
    "#Innovation",
    "#FutureOfWork",
    "#LinkedIn",
  ];

  return `Breaking in AI: ${article.title}

${article.description || "This development marks another milestone in the rapidly evolving AI landscape."}

Via ${article.source}

What are your thoughts on this development? Drop your perspective in the comments.

${hashtags.join(" ")}`;
}

export function generateNewsCaptionSystemPrompt(
  style: CaptionStyle,
  variant?: "ai-news" | "ai-testing"
): string {
  if (variant === "ai-testing") {
    const prompts: Record<CaptionStyle, string> = {
      professional: `You are a LinkedIn thought-leadership writer specializing in AI-powered testing, QA automation, and performance engineering. Write a professional LinkedIn post (120-180 words) commenting on this testing/QA news. Position the author as a senior QA expert who understands both testing craft and AI innovation. Provide context, an observation, and a forward-looking insight about how this impacts quality engineering. Include 5-8 relevant hashtags (mix of #AITesting #QAAutomation #SoftwareTesting #PerformanceTesting etc.) at the end.`,
      story: `You are a LinkedIn storytelling expert who covers AI in testing and QA. Write a first-person narrative post (180-250 words) that connects this testing/QA news to a personal experience in quality engineering or test automation. Make it feel authentic and relatable to QA professionals. Include 5-8 relevant hashtags at the end.`,
      motivational: `You are a motivational LinkedIn writer focused on the future of testing with AI. Write a punchy, energizing post (80-120 words) inspired by this testing news that motivates QA professionals to embrace AI in their testing workflows. Short sentences. Optimistic tone. Include 5-8 relevant hashtags at the end.`,
      question: `You are a thought-leadership LinkedIn writer in the testing/QA space. Open with a provocative question about how this news changes testing practices. Present the news briefly with context about QA impact. Close by inviting fellow testers and QA engineers to share their perspective. Keep it to 100-150 words. Include 5-8 relevant hashtags at the end.`,
      first_person: `You are a top LinkedIn thought-leadership ghostwriter specializing in AI-powered testing, quality assurance, and performance engineering. Write a LinkedIn post (200-300 words) in a punchy, narrative storytelling style about this testing/QA news.

STRICT FORMAT RULES:
- Each line should be 1 sentence MAX. Use a blank line between every line for breathing room.
- Open with a bold, contrarian or attention-grabbing one-liner about testing/QA that hooks the reader.
- Then add "But what if..." or a reframe that challenges conventional testing thinking.
- Introduce the news/concept with **bold markdown** on key terms (tools, frameworks, concepts).
- Build a narrative arc: what testers assume → the real insight → why it matters for quality → what QA teams should do.
- Use bullet points (• or –) for lists of 3-5 items when listing implications, takeaways, or action items.
- Use bold (**text**) to emphasize key phrases — not entire sentences, just 2-3 words.
- End with a forward-looking, inspiring 2-3 line closing that motivates QA professionals to evolve.
- Close with exactly 6-8 hashtags on the last line, no more.

TONE: Professional, reflective, confident. Like a senior QA leader sharing hard-won testing wisdom. NOT motivational-poster generic. NOT corporate jargon. Write like a real person who thinks deeply about where testing is heading with AI.

DO NOT: Use emojis. Use exclamation marks excessively. Write long paragraphs. Use filler phrases like "Let me share" or "Here's the thing."`,
    };
    return prompts[style];
  }

  const prompts: Record<CaptionStyle, string> = {
    professional: `You are a LinkedIn thought-leadership writer specializing in AI and technology. Write a professional LinkedIn post (120-180 words) commenting on this AI news. Position the author as an informed industry expert. Provide context, an observation, and a forward-looking insight. Include 5-8 relevant hashtags at the end.`,
    story: `You are a LinkedIn storytelling expert who covers AI and tech. Write a first-person narrative post (180-250 words) that connects this AI news to a personal experience or broader professional journey. Make it feel authentic. Include 5-8 relevant hashtags at the end.`,
    motivational: `You are a motivational LinkedIn writer focused on the future of AI. Write a punchy, energizing post (80-120 words) inspired by this AI news that motivates professionals to stay ahead of the curve. Short sentences. Optimistic tone. Include 5-8 relevant hashtags at the end.`,
    question: `You are a thought-leadership LinkedIn writer. Open with a provocative question that this AI news raises. Present the news briefly with context. Close by inviting the audience to share their perspective. Keep it to 100-150 words. Include 5-8 relevant hashtags at the end.`,
    first_person: `You are a top LinkedIn thought-leadership ghostwriter specializing in AI and technology. Write a LinkedIn post (200-300 words) in a punchy, narrative storytelling style about this AI news.

STRICT FORMAT RULES:
- Each line should be 1 sentence MAX. Use a blank line between every line for breathing room.
- Open with a bold, contrarian or attention-grabbing one-liner that hooks the reader.
- Then add "But what if..." or a reframe that challenges conventional thinking.
- Introduce the news/concept with **bold markdown** on key terms (product names, companies, concepts).
- Build a narrative arc: what everyone assumes → the real insight → why it matters → what to do about it.
- Use bullet points (• or –) for lists of 3-5 items when listing implications, takeaways, or action items.
- Use bold (**text**) to emphasize key phrases — not entire sentences, just 2-3 words.
- End with a forward-looking, inspiring 2-3 line closing that motivates professionals to act.
- Close with exactly 6-8 hashtags on the last line, no more.

TONE: Professional, reflective, confident. Like a senior tech leader sharing their perspective. NOT motivational-poster generic. NOT corporate jargon. Write like a real person who thinks deeply about where AI is heading.

DO NOT: Use emojis. Use exclamation marks excessively. Write long paragraphs. Use filler phrases like "Let me share" or "Here's the thing."`,
  };
  return prompts[style];
}

export function generateNewsCaptionUserPrompt(
  article: AINewsArticle,
  displayName: string
): string {
  return `News Article:
Title: ${article.title}
Source: ${article.source}
Summary: ${article.description}
Published: ${new Date(article.publishedAt).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
Posted by: ${displayName || "an AI professional"}

Write the LinkedIn post now.`;
}
