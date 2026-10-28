import type { ArticleLabel, SourceInput } from "@/lib/editorial/types";

export const LABELS: ArticleLabel[] = [
  "Independent research",
  "Pricing analysis",
  "Feature comparison",
  "Official documentation review",
  "Security and risk overview",
  "Practical guide",
];

export const CATEGORY_SLUGS = [
  "crypto",
  "ai",
  "saas",
  "guides",
  "comparisons",
  "research",
] as const;

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function readingMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function formatDate(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function headingIds(markdown: string): { level: 2 | 3; text: string; id: string }[] {
  const used = new Map<string, number>();
  const out: { level: 2 | 3; text: string; id: string }[] = [];
  let fence = false;
  for (const line of markdown.split("\n")) {
    if (line.trim().startsWith("```")) {
      fence = !fence;
      continue;
    }
    if (fence) continue;
    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!match) continue;
    const text = match[2].replace(/[*_`[\]]/g, "").trim();
    const base = slugify(text) || "section";
    const seen = used.get(base) ?? 0;
    used.set(base, seen + 1);
    out.push({
      level: match[1].length === 2 ? 2 : 3,
      text,
      id: seen === 0 ? base : `${base}-${seen + 1}`,
    });
  }
  return out;
}

export function safeImageSrc(src: string): string {
  const value = src.trim();
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  if (value.startsWith("https://")) return value;
  if (
    value.startsWith("data:image/jpeg") ||
    value.startsWith("data:image/png") ||
    value.startsWith("data:image/webp")
  ) {
    return value;
  }
  return "";
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 200;
}

export function stripTags(value: string): string {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function absoluteUrl(publicUrl: string, path: string, fallbackOrigin = ""): string {
  const base = (publicUrl || fallbackOrigin).replace(/\/$/, "");
  if (!base) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function publishErrors(input: {
  title: string;
  summary: string;
  body: string;
  slug: string;
  categorySlug: string;
  label: string;
  lastChecked: string;
  coverImage: string;
  coverAlt: string;
  sources: SourceInput[];
}): string[] {
  const errors: string[] = [];
  if (input.title.trim().length < 8) errors.push("Add a headline.");
  if (input.summary.trim().length < 40) errors.push("Add a standfirst of at least a sentence.");
  if (input.body.trim().length < 200) errors.push("The body is too short to publish.");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)) errors.push("Use a lowercase hyphenated slug.");
  if (!CATEGORY_SLUGS.includes(input.categorySlug as (typeof CATEGORY_SLUGS)[number])) {
    errors.push("Choose a category.");
  }
  if (!LABELS.includes(input.label as ArticleLabel)) errors.push("Choose an editorial label.");
  if (!input.lastChecked) errors.push("Add the date the sources were last checked.");
  if (safeImageSrc(input.coverImage) && !input.coverAlt.trim()) {
    errors.push("Add alt text for the cover.");
  }
  if (input.coverImage.trim() && !safeImageSrc(input.coverImage)) {
    errors.push("Cover images must be a site path, an https URL, or an uploaded image.");
  }
  if (input.sources.length < 1) errors.push("Add at least one source before publishing.");
  input.sources.forEach((source, index) => {
    const n = index + 1;
    if (!source.title.trim() || !source.publisher.trim() || !source.claim.trim()) {
      errors.push(`Source ${n} needs a title, publisher, and the claim it supports.`);
    }
    if (!/^https?:\/\//i.test(source.url.trim()) && !source.url.trim().startsWith("/")) {
      errors.push(`Source ${n} needs a direct http(s) URL.`);
    }
    if (!source.accessedOn) errors.push(`Source ${n} needs the date you accessed it.`);
    if (!source.sourceType.trim()) errors.push(`Source ${n} needs a source type.`);
  });
  return errors;
}
