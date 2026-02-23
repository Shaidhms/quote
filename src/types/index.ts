export interface Quote {
  id: number;
  day_number: number;
  quote_text: string;
  author: string;
  book_name: string;
  category: string;
  scheduled_date: string;
  is_posted: boolean;
  posted_at: string | null;
  card_template: string;
}

export interface UserSettings {
  id: string;
  profile_image_url: string;
  display_name: string;
  linkedin_handle: string;
}

export type FilterType = "all" | "today" | "posted" | "not_posted";

export type TemplateType = "minimalist" | "split" | "book";

export type ImageStyle =
  | "illustration"
  | "cinematic"
  | "watercolor"
  | "digital_art"
  | "minimalist";

export type CaptionStyle =
  | "professional"
  | "story"
  | "motivational"
  | "question";

export interface GenerateImageRequest {
  prompt: string;
  imageBase64: string;
  style: ImageStyle;
}

export interface GenerateImageResponse {
  imageBase64: string;
  error?: string;
}

export interface GenerateCaptionRequest {
  quote: Quote;
  style: CaptionStyle;
  displayName: string;
}

export interface GenerateCaptionResponse {
  caption: string;
  error?: string;
}
