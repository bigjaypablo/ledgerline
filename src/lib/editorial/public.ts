import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { isEmail, stripTags, xmlEscape, absoluteUrl } from "@/lib/editorial/text";
import type {
  Card,
  Category,
  Comment,
  HomeData,
  Settings,
  Source,
  Tool,
} from "@/lib/editorial/types";

function iso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return "";
}

function day(value: unknown): string {
  return iso(value).slice(0, 10);
}

function num(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function flag(value: unknown): boolean {
  return value === true || value === "t" || value === "true" || value === 1;
}

type CardRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category_slug: string;
  category_name: string;
  label: string;
  cover_image: string | null;
  cover_alt: string | null;
  cover_caption: string | null;
  published_at: unknown;
  updated_at: unknown;
  reading_minutes: unknown;
  featured: unknown;
  deep_dive: unknown;
  last_checked: unknown;
};

function asCard(row: CardRow): Card {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    categorySlug: row.category_slug,
    categoryName: row.category_name,
    label: row.label,
    coverImage: row.cover_image ?? "",
    coverAlt: row.cover_alt ?? "",
    coverCaption: row.cover_caption ?? "",
    publishedAt: iso(row.published_at),
    updatedAt: iso(row.updated_at),
    readingMinutes: num(row.reading_minutes) || 1,
    featured: flag(row.featured),
    deepDive: flag(row.deep_dive),
    lastChecked: day(row.last_checked),
  };
}

type SettingsRow = {
  site_name: string;
  tagline: string;
  contact_email: string;
  public_url: string;
  x_url: string;
  author_name: string;
  author_bio: string;
  newsletter_configured: unknown;
  comments_enabled: unknown;
};

function asSettings(row: SettingsRow | undefined): Settings {
  return {
    siteName: row?.site_name ?? "Ledgerline",
    tagline: row?.tagline ?? "Research before you pay.",
    contactEmail: row?.contact_email ?? "",
    publicUrl: row?.public_url ?? "",
    xUrl: row?.x_url ?? "",
    authorName: row?.author_name ?? "Ledgerline Desk",
    authorBio: row?.author_bio ?? "",
    newsletterConfigured: flag(row?.newsletter_configured),
    commentsEnabled: row ? flag(row.comments_enabled) : true,
  };
}

async function loadSettings(): Promise<Settings> {
  const sql = await getSql();
  const rows = await sql<SettingsRow>`
    select site_name, tagline, contact_email, public_url, x_url, author_name, author_bio,
           newsletter_configured, comments_enabled
    from site_settings where id = 1
  `;
  return asSettings(rows[0]);
}

async function publishedCards(): Promise<Card[]> {
  const sql = await getSql();
  const rows = await sql<CardRow>`
    select a.id, a.slug, a.title, a.summary, a.category_slug, c.name as category_name,
           a.label, a.cover_image, a.cover_alt, a.cover_caption,
           a.published_at, a.updated_at, a.reading_minutes, a.featured, a.deep_dive, a.last_checked
    from articles a
    join categories c on c.slug = a.category_slug
    where a.status = 'published'
    order by a.published_at desc nulls last, a.title asc
  `;
  return rows.map(asCard);
}

async function activeTools(): Promise<Tool[]> {
  const sql = await getSql();
  const rows = await sql<{
    id: string;
    name: string;
    category: string;
    website: string;
    affiliate_url: string;
    program_name: string;
    commission_notes: string;
    commission_type: string;
    notes: string;
    last_verified: unknown;
  }>`
    select id, name, category, website, affiliate_url, program_name, commission_notes,
           commission_type, notes, last_verified
    from affiliates
    where active = true and approval_status = 'approved' and length(trim(affiliate_url)) > 0
    order by name asc
  `;
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    website: row.website,
    affiliateUrl: row.affiliate_url,
    programName: row.program_name,
    commissionNotes: row.commission_notes,
    commissionType: row.commission_type,
    notes: row.notes,
    lastVerified: day(row.last_verified),
  }));
}

export const getHome = createServerFn({ method: "GET" }).handler(async (): Promise<HomeData> => {
  const sql = await getSql();
  const [cards, categories, tools, settings] = await Promise.all([
    publishedCards(),
    sql<Category>`select slug, name, description from categories order by sort_order asc, name asc`,
    activeTools(),
    loadSettings(),
  ]);
  const lead = cards.find((card) => card.featured) ?? cards[0] ?? null;
  const rest = cards.filter((card) => card.slug !== lead?.slug);
  return {
    lead,
    secondary: rest.slice(0, 3),
    latest: cards.slice(0, 8),
    crypto: cards.filter((card) => card.categorySlug === "crypto" && card.slug !== lead?.slug).slice(0, 4),
    ai: cards.filter((card) => card.categorySlug === "ai").slice(0, 4),
    saas: cards.filter((card) => card.categorySlug === "saas").slice(0, 4),
    guides: cards
      .filter((card) => card.categorySlug === "guides" || card.categorySlug === "comparisons")
      .slice(0, 6),
    picks: cards.filter((card) => card.deepDive).slice(0, 4),
    categories,
    tools,
    settings,
  };
});

export const getCategoryPage = createServerFn({ method: "GET" })
  .validator((input: { slug: string; page?: number }) => ({
    slug: String(input?.slug ?? ""),
    page: Math.max(1, Number(input?.page) || 1),
  }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const categories = await sql<Category>`
      select slug, name, description from categories where slug = ${data.slug}
    `;
    const category = categories[0];
    if (!category) return null;
    const limit = 4;
    const offset = (data.page - 1) * limit;
    const [countRows, rows, settings] = await Promise.all([
      sql<{ n: number }>`
        select count(*)::int as n from articles
        where status = 'published' and category_slug = ${data.slug}
      `,
      sql<CardRow>`
        select a.id, a.slug, a.title, a.summary, a.category_slug, c.name as category_name,
               a.label, a.cover_image, a.cover_alt, a.cover_caption,
               a.published_at, a.updated_at, a.reading_minutes, a.featured, a.deep_dive, a.last_checked
        from articles a
        join categories c on c.slug = a.category_slug
        where a.status = 'published' and a.category_slug = ${data.slug}
        order by a.featured desc, a.published_at desc nulls last
        limit ${limit} offset ${offset}
      `,
      loadSettings(),
    ]);
    const total = num(countRows[0]?.n);
    return {
      category,
      articles: rows.map(asCard),
      page: data.page,
      pages: Math.max(1, Math.ceil(total / limit)),
      total,
      settings,
    };
  });

export const searchArticles = createServerFn({ method: "GET" })
  .validator((input: { q?: string; page?: number }) => ({
    q: String(input?.q ?? "").slice(0, 120),
    page: Math.max(1, Number(input?.page) || 1),
  }))
  .handler(async ({ data }) => {
    const settings = await loadSettings();
    const q = data.q.trim();
    if (q.length < 2) {
      return { q, articles: [] as Card[], total: 0, page: 1, pages: 1, settings };
    }
    const like = `%${q.replace(/[%_]/g, "")}%`;
    const sql = await getSql();
    const limit = 12;
    const offset = (data.page - 1) * limit;
    const [countRows, rows] = await Promise.all([
      sql<{ n: number }>`
        select count(*)::int as n
        from articles a
        join categories c on c.slug = a.category_slug
        where a.status = 'published'
          and (a.title ilike ${like} or a.summary ilike ${like} or a.body ilike ${like} or c.name ilike ${like})
      `,
      sql<CardRow>`
        select a.id, a.slug, a.title, a.summary, a.category_slug, c.name as category_name,
               a.label, a.cover_image, a.cover_alt, a.cover_caption,
               a.published_at, a.updated_at, a.reading_minutes, a.featured, a.deep_dive, a.last_checked
        from articles a
        join categories c on c.slug = a.category_slug
        where a.status = 'published'
          and (a.title ilike ${like} or a.summary ilike ${like} or a.body ilike ${like} or c.name ilike ${like})
        order by a.published_at desc nulls last
        limit ${limit} offset ${offset}
      `,
    ]);
    const total = num(countRows[0]?.n);
    return {
      q,
      articles: rows.map(asCard),
      total,
      page: data.page,
      pages: Math.max(1, Math.ceil(total / limit)),
      settings,
    };
  });

export const getArticle = createServerFn({ method: "GET" })
  .validator((input: { slug: string }) => ({ slug: String(input?.slug ?? "").slice(0, 120) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<
      CardRow & {
        body: string;
        seo_title: string;
        seo_description: string;
        affiliate_disclosure: unknown;
        author_id: string;
      }
    >`
      select a.id, a.slug, a.title, a.summary, a.body, a.category_slug, c.name as category_name,
             a.label, a.cover_image, a.cover_alt, a.cover_caption, a.published_at, a.updated_at,
             a.reading_minutes, a.featured, a.deep_dive, a.last_checked, a.seo_title, a.seo_description,
             a.affiliate_disclosure, a.author_id
      from articles a
      join categories c on c.slug = a.category_slug
      where a.slug = ${data.slug} and a.status = 'published'
    `;
    if (!rows[0]) {
      const redirect = await sql<{ to_slug: string }>`
        select to_slug from slug_redirects where from_slug = ${data.slug}
      `;
      if (redirect[0]) return { kind: "redirect" as const, slug: redirect[0].to_slug };
      return null;
    }
    const row = rows[0];
    const card = asCard(row);
    const [sources, tags, related, previous, next, comments, tools, authorRows, settings] =
      await Promise.all([
        sql<{
          id: string;
          title: string;
          publisher: string;
          url: string;
          source_type: string;
          published_on: unknown;
          accessed_on: unknown;
          claim: string;
        }>`
          select id, title, publisher, url, source_type, published_on, accessed_on, claim
          from article_sources where article_id = ${row.id}
          order by sort_order asc, title asc
        `,
        sql<{ name: string }>`
          select t.name from tags t
          join article_tags at on at.tag_slug = t.slug
          where at.article_id = ${row.id}
          order by t.name asc
        `,
        sql<CardRow>`
          select a.id, a.slug, a.title, a.summary, a.category_slug, c.name as category_name,
                 a.label, a.cover_image, a.cover_alt, a.cover_caption,
                 a.published_at, a.updated_at, a.reading_minutes, a.featured, a.deep_dive, a.last_checked
          from articles a
          join categories c on c.slug = a.category_slug
          where a.status = 'published' and a.category_slug = ${row.category_slug} and a.id <> ${row.id}
          order by a.published_at desc nulls last
          limit 3
        `,
        sql<{ slug: string; title: string }>`
          select slug, title from articles
          where status = 'published' and published_at < ${row.published_at}
          order by published_at desc limit 1
        `,
        sql<{ slug: string; title: string }>`
          select slug, title from articles
          where status = 'published' and published_at > ${row.published_at}
          order by published_at asc limit 1
        `,
        sql<{ id: string; author_name: string; body: string; created_at: unknown }>`
          select id, author_name, body, created_at from comments
          where article_id = ${row.id} and status = 'approved'
          order by created_at asc
        `,
        sql<{
          id: string;
          name: string;
          category: string;
          website: string;
          affiliate_url: string;
          program_name: string;
          commission_notes: string;
          commission_type: string;
          notes: string;
          last_verified: unknown;
        }>`
          select f.id, f.name, f.category, f.website, f.affiliate_url, f.program_name,
                 f.commission_notes, f.commission_type, f.notes, f.last_verified
          from affiliates f
          join article_affiliates aa on aa.affiliate_id = f.id
          where aa.article_id = ${row.id}
            and f.active = true and f.approval_status = 'approved'
            and length(trim(f.affiliate_url)) > 0
          order by f.name asc
        `,
        sql<{ display_name: string; bio: string; x_url: string }>`
          select display_name, bio, x_url from profiles where user_id = ${row.author_id}
        `,
        loadSettings(),
      ]);
    const author = authorRows[0];
    const mappedSources: Source[] = sources.map((source) => ({
      id: source.id,
      title: source.title,
      publisher: source.publisher,
      url: source.url,
      sourceType: source.source_type,
      publishedOn: day(source.published_on),
      accessedOn: day(source.accessed_on),
      claim: source.claim,
    }));
    const mappedComments: Comment[] = comments.map((comment) => ({
      id: comment.id,
      authorName: comment.author_name,
      body: comment.body,
      createdAt: iso(comment.created_at),
    }));
    return {
      kind: "article" as const,
      article: {
        ...card,
        body: row.body,
        seoTitle: row.seo_title || row.title,
        seoDescription: row.seo_description || row.summary,
        affiliateDisclosure: flag(row.affiliate_disclosure),
        tags: tags.map((tag) => tag.name),
      },
      sources: mappedSources,
      related: related.map(asCard),
      previous: previous[0] ?? null,
      next: next[0] ?? null,
      comments: mappedComments,
      tools: tools.map((tool) => ({
        id: tool.id,
        name: tool.name,
        category: tool.category,
        website: tool.website,
        affiliateUrl: tool.affiliate_url,
        programName: tool.program_name,
        commissionNotes: tool.commission_notes,
        commissionType: tool.commission_type,
        notes: tool.notes,
        lastVerified: day(tool.last_verified),
      })),
      author: {
        name: author?.display_name || settings.authorName,
        bio: author?.bio || settings.authorBio,
        xUrl: author?.x_url || settings.xUrl,
      },
      settings,
    };
  });

export const getPublicSettings = createServerFn({ method: "GET" }).handler(async () => loadSettings());

const COINS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "ripple", symbol: "XRP", name: "XRP" },
  { id: "cardano", symbol: "ADA", name: "Cardano" },
] as const;

export type Quote = { symbol: string; name: string; usd: number; change: number };

let priceCache: { at: number; quotes: Quote[] } | null = null;

export const getPrices = createServerFn({ method: "GET" }).handler(async (): Promise<{ ok: boolean; quotes: Quote[] }> => {
  if (priceCache && Date.now() - priceCache.at < 60_000) {
    return { ok: true, quotes: priceCache.quotes };
  }
  try {
    const ids = COINS.map((coin) => coin.id).join(",");
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
      { headers: { accept: "application/json" }, signal: AbortSignal.timeout(6000) },
    );
    if (!response.ok) return { ok: false, quotes: [] };
    const body = (await response.json()) as Record<string, { usd?: number; usd_24h_change?: number }>;
    const quotes: Quote[] = [];
    for (const coin of COINS) {
      const row = body[coin.id];
      const usd = Number(row?.usd);
      const change = Number(row?.usd_24h_change);
      if (!Number.isFinite(usd) || !Number.isFinite(change)) return { ok: false, quotes: [] };
      quotes.push({ symbol: coin.symbol, name: coin.name, usd, change });
    }
    priceCache = { at: Date.now(), quotes };
    return { ok: true, quotes };
  } catch {
    return { ok: false, quotes: [] };
  }
});

export const getArchive = createServerFn({ method: "GET" })
  .validator((input: { page?: number; category?: string }) => ({
    page: Math.max(1, Number(input?.page) || 1),
    category: String(input?.category ?? "").slice(0, 40),
  }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const category = data.category;
    const limit = 6;
    const offset = (data.page - 1) * limit;
    const [countRows, rows, categories, settings] = await Promise.all([
      category
        ? sql<{ n: number }>`
            select count(*)::int as n from articles
            where status = 'published' and category_slug = ${category}
          `
        : sql<{ n: number }>`select count(*)::int as n from articles where status = 'published'`,
      category
        ? sql<CardRow>`
            select a.id, a.slug, a.title, a.summary, a.category_slug, c.name as category_name,
                   a.label, a.cover_image, a.cover_alt, a.cover_caption,
                   a.published_at, a.updated_at, a.reading_minutes, a.featured, a.deep_dive, a.last_checked
            from articles a
            join categories c on c.slug = a.category_slug
            where a.status = 'published' and a.category_slug = ${category}
            order by a.published_at desc nulls last
            limit ${limit} offset ${offset}
          `
        : sql<CardRow>`
            select a.id, a.slug, a.title, a.summary, a.category_slug, c.name as category_name,
                   a.label, a.cover_image, a.cover_alt, a.cover_caption,
                   a.published_at, a.updated_at, a.reading_minutes, a.featured, a.deep_dive, a.last_checked
            from articles a
            join categories c on c.slug = a.category_slug
            where a.status = 'published'
            order by a.published_at desc nulls last
            limit ${limit} offset ${offset}
          `,
      sql<Category>`select slug, name, description from categories order by sort_order asc, name asc`,
      loadSettings(),
    ]);
    const total = num(countRows[0]?.n);
    return {
      articles: rows.map(asCard),
      categories,
      category,
      page: data.page,
      pages: Math.max(1, Math.ceil(total / limit)),
      total,
      settings,
    };
  });

export const readerHome = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const userId = context.userId;
    await sql`
      insert into profiles (user_id, display_name, role)
      values (${userId}, 'Reader', 'reader')
      on conflict (user_id) do nothing
    `;
    const profiles = await sql<{ display_name: string; role: string }>`
      select display_name, role from profiles where user_id = ${userId}
    `;
    const saved = await sql<CardRow>`
      select a.id, a.slug, a.title, a.summary, a.category_slug, c.name as category_name,
             a.label, a.cover_image, a.cover_alt, a.cover_caption,
             a.published_at, a.updated_at, a.reading_minutes, a.featured, a.deep_dive, a.last_checked
      from article_saves s
      join articles a on a.id = s.article_id
      join categories c on c.slug = a.category_slug
      where s.user_id = ${userId} and a.status = 'published'
      order by s.created_at desc
    `;
    return {
      displayName: profiles[0]?.display_name || "Reader",
      role: profiles[0]?.role || "reader",
      saved: saved.map(asCard),
    };
  });

export const saveState = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { articleId?: string }) => ({ articleId: String(input?.articleId ?? "").slice(0, 80) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<{ n: number }>`
      select count(*)::int as n from article_saves
      where user_id = ${context.userId} and article_id = ${data.articleId}
    `;
    return { saved: num(rows[0]?.n) > 0 };
  });

export const toggleSave = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { articleId?: string }) => ({ articleId: String(input?.articleId ?? "").slice(0, 80) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const existing = await sql<{ n: number }>`
      select count(*)::int as n from article_saves
      where user_id = ${context.userId} and article_id = ${data.articleId}
    `;
    if (num(existing[0]?.n) > 0) {
      await sql`delete from article_saves where user_id = ${context.userId} and article_id = ${data.articleId}`;
      return { saved: false };
    }
    const published = await sql<{ id: string }>`
      select id from articles where id = ${data.articleId} and status = 'published'
    `;
    if (!published[0]) throw new Error("That article is not published.");
    await sql`
      insert into article_saves (user_id, article_id)
      values (${context.userId}, ${data.articleId})
      on conflict do nothing
    `;
    return { saved: true };
  });

export const subscribe = createServerFn({ method: "POST" })
  .validator((input: { email?: string; consent?: boolean; company?: string }) => ({
    email: String(input?.email ?? "").trim().toLowerCase(),
    consent: Boolean(input?.consent),
    company: String(input?.company ?? ""),
  }))
  .handler(async ({ data }) => {
    if (data.company.trim()) return { ok: true, message: "Subscribed." };
    if (!data.consent) {
      return { ok: false, message: "Tick the box to confirm you want the desk note." };
    }
    if (!isEmail(data.email)) return { ok: false, message: "Enter a valid email address." };
    const sql = await getSql();
    const existing = await sql<{ status: string }>`
      select status from subscribers where email = ${data.email}
    `;
    if (existing[0]?.status === "subscribed") {
      return { ok: true, message: "That address is already on the list." };
    }
    const token = crypto.randomUUID();
    if (existing[0]) {
      await sql`
        update subscribers
        set status = 'subscribed', consent = true, unsubscribed_at = null, unsubscribe_token = ${token}
        where email = ${data.email}
      `;
    } else {
      await sql`
        insert into subscribers (id, email, status, consent, unsubscribe_token)
        values (${`sub_${crypto.randomUUID()}`}, ${data.email}, 'subscribed', true, ${token})
      `;
    }
    const settings = await loadSettings();
    return {
      ok: true,
      message: settings.newsletterConfigured
        ? "You are on the list."
        : "Saved. A confirmation email is not sent until a mail provider is connected.",
    };
  });

export const unsubscribe = createServerFn({ method: "POST" })
  .validator((input: { token?: string }) => ({ token: String(input?.token ?? "").slice(0, 80) }))
  .handler(async ({ data }) => {
    if (!data.token) return { ok: false, message: "This unsubscribe link is missing a token." };
    const sql = await getSql();
    const rows = await sql<{ id: string }>`
      select id from subscribers where unsubscribe_token = ${data.token}
    `;
    if (!rows[0]) {
      return { ok: true, message: "If this address was subscribed, it is now unsubscribed." };
    }
    await sql`
      update subscribers
      set status = 'unsubscribed', unsubscribed_at = now()
      where id = ${rows[0].id}
    `;
    return { ok: true, message: "You are unsubscribed." };
  });

export const submitComment = createServerFn({ method: "POST" })
  .validator((input: { articleSlug?: string; name?: string; body?: string; company?: string }) => ({
    articleSlug: String(input?.articleSlug ?? "").slice(0, 120),
    name: stripTags(String(input?.name ?? "")).slice(0, 80),
    body: stripTags(String(input?.body ?? "")).slice(0, 1000),
    company: String(input?.company ?? ""),
  }))
  .handler(async ({ data }) => {
    if (data.company.trim()) return { ok: true, message: "Sent for moderation." };
    if (data.name.length < 2) return { ok: false, message: "Add a name." };
    if (data.body.length < 8) return { ok: false, message: "Write a comment of at least a sentence." };
    if (/https?:\/\/|www\./i.test(data.body)) {
      return { ok: false, message: "Links are not accepted in comments." };
    }
    const sql = await getSql();
    const settings = await loadSettings();
    if (!settings.commentsEnabled) return { ok: false, message: "Comments are turned off." };
    const articles = await sql<{ id: string }>`
      select id from articles where slug = ${data.articleSlug} and status = 'published'
    `;
    if (!articles[0]) return { ok: false, message: "That article is not open for comments." };
    const recent = await sql<{ n: number }>`
      select count(*)::int as n from comments
      where author_name = ${data.name}
        and created_at > now() - interval '10 minutes'
    `;
    if (num(recent[0]?.n) >= 3) {
      return { ok: false, message: "Please wait a few minutes before sending another comment." };
    }
    await sql`
      insert into comments (id, article_id, author_name, body, status)
      values (${`cmt_${crypto.randomUUID()}`}, ${articles[0].id}, ${data.name}, ${data.body}, 'pending')
    `;
    return { ok: true, message: "Sent for moderation. It will not appear until an editor approves it." };
  });

export const submitContact = createServerFn({ method: "POST" })
  .validator((input: { name?: string; email?: string; message?: string; company?: string }) => ({
    name: stripTags(String(input?.name ?? "")).slice(0, 80),
    email: String(input?.email ?? "").trim().toLowerCase(),
    message: stripTags(String(input?.message ?? "")).slice(0, 4000),
    company: String(input?.company ?? ""),
  }))
  .handler(async ({ data }) => {
    if (data.company.trim()) return { ok: true, message: "Message received." };
    if (data.name.length < 2) return { ok: false, message: "Add your name." };
    if (!isEmail(data.email)) return { ok: false, message: "Add a valid email so the desk can reply." };
    if (data.message.length < 12) return { ok: false, message: "Write a message." };
    const sql = await getSql();
    await sql`
      insert into contact_messages (id, name, email, message)
      values (${`msg_${crypto.randomUUID()}`}, ${data.name}, ${data.email}, ${data.message})
    `;
    return { ok: true, message: "Message stored for the editor. This form does not send an email by itself." };
  });

export const trackAffiliateClick = createServerFn({ method: "POST" })
  .validator((input: { id?: string; articleId?: string }) => ({
    id: String(input?.id ?? "").slice(0, 80),
    articleId: String(input?.articleId ?? "").slice(0, 80),
  }))
  .handler(async ({ data }) => {
    if (!data.id) return { ok: false };
    const sql = await getSql();
    const rows = await sql<{ id: string }>`
      select id from affiliates
      where id = ${data.id} and active = true and approval_status = 'approved'
    `;
    if (!rows[0]) return { ok: false };
    await sql`
      insert into affiliate_clicks (id, affiliate_id, article_id)
      values (${`clk_${crypto.randomUUID()}`}, ${data.id}, ${data.articleId || null})
    `;
    return { ok: true };
  });

const STATIC_PATHS = [
  "/",
  "/crypto",
  "/ai",
  "/saas",
  "/guides",
  "/comparisons",
  "/research",
  "/archive",
  "/about",
  "/contact",
  "/standards",
  "/corrections",
  "/disclosure",
  "/privacy",
  "/terms",
  "/disclaimer",
];

export const getFeedDocument = createServerFn({ method: "GET" })
  .validator((input: { kind?: string; origin?: string }) => ({
    kind: input?.kind === "rss" ? "rss" : "sitemap",
    origin: String(input?.origin ?? "").replace(/\/$/, ""),
  }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const settings = await loadSettings();
    const base = (settings.publicUrl || data.origin).replace(/\/$/, "");
    const rows = await sql<{
      slug: string;
      title: string;
      summary: string;
      updated_at: unknown;
      published_at: unknown;
    }>`
      select slug, title, summary, updated_at, published_at
      from articles
      where status = 'published'
      order by published_at desc nulls last
    `;
    const loc = (path: string) => (base ? absoluteUrl(base, path) : "");
    if (data.kind === "rss") {
      const items = rows
        .map((row) => {
          const link = loc(`/article/${row.slug}`);
          if (!link) return "";
          return `<item><title>${xmlEscape(row.title)}</title><link>${xmlEscape(link)}</link><guid>${xmlEscape(link)}</guid><description>${xmlEscape(row.summary)}</description><pubDate>${xmlEscape(iso(row.published_at))}</pubDate></item>`;
        })
        .filter(Boolean)
        .join("");
      const channelLink = loc("/");
      return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${xmlEscape(settings.siteName)}</title><link>${xmlEscape(channelLink)}</link><description>${xmlEscape(settings.tagline)}</description>${items}</channel></rss>`;
    }
    const urls = [
      ...STATIC_PATHS.map((path) => loc(path)),
      ...rows.map((row) => loc(`/article/${row.slug}`)),
    ].filter(Boolean);
    const body = urls
      .map((url) => `<url><loc>${xmlEscape(url)}</loc></url>`)
      .join("");
    return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
  });

type ReactionState = { likes: number; dislikes: number; mine: number };

async function reactionState(sql: Awaited<ReturnType<typeof getSql>>, articleId: string, voterId: string): Promise<ReactionState> {
  const counts = await sql<{ likes: number; dislikes: number }>`
    select count(*) filter (where value = 1)::int as likes,
           count(*) filter (where value = -1)::int as dislikes
    from reactions where article_id = ${articleId}
  `;
  const mine = voterId
    ? await sql<{ value: number }>`select value from reactions where article_id = ${articleId} and voter_id = ${voterId}`
    : [];
  return { likes: Number(counts[0]?.likes ?? 0), dislikes: Number(counts[0]?.dislikes ?? 0), mine: Number(mine[0]?.value ?? 0) };
}

const cleanVoter = (value: unknown) => {
  const v = String(value ?? "");
  return /^[A-Za-z0-9-]{16,64}$/.test(v) ? v : "";
};

export const getReactions = createServerFn({ method: "GET" })
  .validator((input: { articleId?: string; voterId?: string }) => ({
    articleId: String(input?.articleId ?? "").slice(0, 120),
    voterId: cleanVoter(input?.voterId),
  }))
  .handler(async ({ data }): Promise<ReactionState> => {
    const sql = await getSql();
    return reactionState(sql, data.articleId, data.voterId);
  });

export const reactToArticle = createServerFn({ method: "POST" })
  .validator((input: { articleId?: string; voterId?: string; value?: number }) => ({
    articleId: String(input?.articleId ?? "").slice(0, 120),
    voterId: cleanVoter(input?.voterId),
    value: input?.value === 1 ? 1 : input?.value === -1 ? -1 : 0,
  }))
  .handler(async ({ data }): Promise<ReactionState> => {
    if (!data.voterId) throw new Error("Could not record your vote.");
    const sql = await getSql();
    const found = await sql<{ id: string }>`select id from articles where id = ${data.articleId} and status = 'published'`;
    if (!found[0]) throw new Error("That article is not open for voting.");
    if (data.value === 0) {
      await sql`delete from reactions where article_id = ${data.articleId} and voter_id = ${data.voterId}`;
    } else {
      await sql`
        insert into reactions (article_id, voter_id, value)
        values (${data.articleId}, ${data.voterId}, ${data.value})
        on conflict (article_id, voter_id) do update set value = excluded.value
      `;
    }
    return reactionState(sql, data.articleId, data.voterId);
  });
