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

export type WatermarkPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";

export interface UserSettings {
  id: string;
  profile_image_url: string;
  display_name: string;
  linkedin_handle: string;
  instagram_personal_handle: string;
  instagram_ai_handle: string;
  // Brand Kit
  brand_colors: string[];
  brand_font: string;
  watermark_image_url: string;
  watermark_position: WatermarkPosition;
  watermark_opacity: number;
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
  | "question"
  | "first_person";

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

// AI News
export interface AINewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
}

export interface FetchAINewsResponse {
  articles: AINewsArticle[];
  fetchedAt: string;
  error?: string;
}

export interface GenerateNewsCaptionRequest {
  article: AINewsArticle;
  style: CaptionStyle;
  displayName: string;
}

// News Post Queue
export type NewsPostStatus = "queued" | "posted" | "declined";

export interface NewsPostDecision {
  articleId: string;
  article: AINewsArticle;
  status: NewsPostStatus;
  decidedAt: string;
  updatedAt: string;
}

export type NewsQueueFilter = "all" | "queued" | "posted" | "declined";

// Content Hub
export type Platform = "linkedin" | "instagram";
export type InstagramHandle = "meshaid" | "ai360withshaid";
export type PostTarget = "linkedin" | "instagram_meshaid" | "instagram_ai360withshaid";
export type ContentPostStatus = "draft" | "scheduled" | "posted";

export interface ContentAttachment {
  id: string;
  type: "image" | "pdf";
  dataUrl: string;
  name: string;
}

export interface ContentPost {
  id: string;
  caption: string;
  images: string[];
  attachments?: ContentAttachment[];
  scheduledDate: string | null;
  status: ContentPostStatus;
  targets: PostTarget[];
  /** @deprecated use targets instead */
  platform?: Platform;
  /** @deprecated use targets instead */
  instagramHandle?: InstagramHandle;
  postedTargets?: PostTarget[];
  source?: { type: "quote" | "news" | "custom"; title?: string };
  createdAt: string;
  updatedAt: string;
}

export type ContentHubFilter = "all" | "draft" | "scheduled" | "posted";

// Ideas Braindump
export interface ContentIdea {
  id: string;
  text: string;
  tags?: string[];
  platform?: Platform;
  convertedToPostId?: string;
  createdAt: string;
}

// Analytics & Stats
export interface PostingGap {
  target: PostTarget;
  daysSinceLastPost: number | null;
  lastPostedAt: string | null;
}

export interface DayActivity {
  date: string;
  count: number;
}

export interface PlatformMonthCount {
  month: string;
  linkedin: number;
  instagram_meshaid: number;
  instagram_ai360withshaid: number;
}

export interface ContentMixEntry {
  type: "quote" | "news" | "custom";
  count: number;
  percentage: number;
}

export interface BestTimeCell {
  day: number;
  hour: number;
  count: number;
}

export interface MonthlyReportData {
  month: string;
  linkedin: number;
  instagram_meshaid: number;
  instagram_ai360withshaid: number;
  quotesPosted: number;
  newsPosted: number;
  newsQueued: number;
}

export interface StatsResult {
  todayPosts: ContentPost[];
  overduePosts: ContentPost[];
  overdueTotalCount: number;
  postingGaps: PostingGap[];
  queuedNewsCount: number;
  postingStreak: number;
  weeklyActivity: DayActivity[];
  platformMonthCounts: PlatformMonthCount[];
  contentMix: ContentMixEntry[];
  bestTimeCells: BestTimeCell[];
  bestTimeSummary: string;
  queueCompletionRate: number;
  monthlyReport: MonthlyReportData;
  postsThisWeek: number;
  quotesPostedCount: number;
}
