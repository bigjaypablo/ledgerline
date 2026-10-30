export type ArticleLabel =
  | "Independent research"
  | "Pricing analysis"
  | "Feature comparison"
  | "Official documentation review"
  | "Security and risk overview"
  | "Practical guide";

export type ArticleStatus = "draft" | "review" | "published" | "archived";

export type Card = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  categorySlug: string;
  categoryName: string;
  label: string;
  coverImage: string;
  coverAlt: string;
  coverCaption: string;
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  featured: boolean;
  deepDive: boolean;
  lastChecked: string;
};

export type Category = {
  slug: string;
  name: string;
  description: string;
};

export type Source = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  sourceType: string;
  publishedOn: string;
  accessedOn: string;
  claim: string;
};

export type Tool = {
  id: string;
  name: string;
  category: string;
  website: string;
  affiliateUrl: string;
  programName: string;
  commissionNotes: string;
  commissionType: string;
  notes: string;
  lastVerified: string;
};

export type Settings = {
  siteName: string;
  tagline: string;
  contactEmail: string;
  publicUrl: string;
  xUrl: string;
  authorName: string;
  authorBio: string;
  newsletterConfigured: boolean;
  commentsEnabled: boolean;
};

export type Comment = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
};

export type HomeData = {
  lead: Card | null;
  secondary: Card[];
  latest: Card[];
  crypto: Card[];
  ai: Card[];
  saas: Card[];
  guides: Card[];
  picks: Card[];
  categories: Category[];
  tools: Tool[];
  settings: Settings;
};

export type ArticlePage = {
  article: Card & {
    body: string;
    seoTitle: string;
    seoDescription: string;
    affiliateDisclosure: boolean;
    tags: string[];
  };
  sources: Source[];
  related: Card[];
  previous: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
  comments: Comment[];
  tools: Tool[];
  author: { name: string; bio: string; xUrl: string; avatarUrl?: string };
  settings: Settings;
};

export type SourceInput = {
  title: string;
  publisher: string;
  url: string;
  sourceType: string;
  publishedOn: string;
  accessedOn: string;
  claim: string;
};

export type ArticleInput = {
  id: string | null;
  slug: string;
  title: string;
  summary: string;
  body: string;
  categorySlug: string;
  label: string;
  seoTitle: string;
  seoDescription: string;
  coverImage: string;
  coverAlt: string;
  coverCaption: string;
  featured: boolean;
  deepDive: boolean;
  lastChecked: string;
  affiliateDisclosure: boolean;
  tags: string[];
  sources: SourceInput[];
  affiliateIds: string[];
  authorId: string;
};

export type AdminArticle = ArticleInput & {
  status: ArticleStatus;
  authorName: string;
  publishedAt: string;
  updatedAt: string;
  hasUnpublishedEdits: boolean;
  readingMinutes: number;
};
