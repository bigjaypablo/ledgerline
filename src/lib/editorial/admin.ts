import { createServerFn } from "@tanstack/react-start";
import { put } from "@vercel/blob";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql, type Sql } from "@/lib/db";
import { isEmail, publishErrors, readingMinutes, safeImageSrc, slugify } from "@/lib/editorial/text";
import type { ArticleInput, ArticleStatus, SourceInput } from "@/lib/editorial/types";

type Role = "admin" | "editor" | "writer" | "reader";

type Profile = {
  userId: string;
  role: Role;
  displayName: string;
  bio: string;
  xHandle: string;
  xUrl: string;
};

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

async function ensureProfile(sql: Sql, userId: string): Promise<Profile> {
  await sql`
    insert into profiles (user_id, display_name, role)
    values (${userId}, 'Reader', 'reader')
    on conflict (user_id) do nothing
  `;
  const rows = await sql<{
    user_id: string;
    role: Role;
    display_name: string;
    bio: string;
    x_handle: string;
    x_url: string;
  }>`
    select user_id, role, display_name, bio, x_handle, x_url
    from profiles where user_id = ${userId}
  `;
  const row = rows[0];
  if (!row) throw new Error("Could not open a profile.");
  return {
    userId: row.user_id,
    role: row.role,
    displayName: row.display_name,
    bio: row.bio ?? "",
    xHandle: row.x_handle ?? "",
    xUrl: row.x_url ?? "",
  };
}

const staffRoles: Role[] = ["admin", "editor", "writer"];

async function gate(userId: string, roles: Role[] = staffRoles): Promise<{ sql: Sql; profile: Profile }> {
  const sql = await getSql();
  const profile = await ensureProfile(sql, userId);
  if (!roles.includes(profile.role)) {
    throw new Error("You do not have permission for that.");
  }
  return { sql, profile };
}

function canEdit(role: Role, authorId: string, userId: string): boolean {
  if (role === "admin" || role === "editor") return true;
  return role === "writer" && authorId === userId;
}

const editorRoles: Role[] = ["admin", "editor"];

function cleanSources(sources: SourceInput[]): SourceInput[] {
  return (sources ?? []).slice(0, 20).map((source) => ({
    title: String(source.title ?? "").trim().slice(0, 200),
    publisher: String(source.publisher ?? "").trim().slice(0, 160),
    url: String(source.url ?? "").trim().slice(0, 500),
    sourceType: String(source.sourceType ?? "").trim().slice(0, 80),
    publishedOn: String(source.publishedOn ?? "").slice(0, 10),
    accessedOn: String(source.accessedOn ?? "").slice(0, 10),
    claim: String(source.claim ?? "").trim().slice(0, 600),
  }));
}

function cleanInput(input: ArticleInput): ArticleInput {
  return {
    id: input.id ? String(input.id).slice(0, 80) : null,
    slug: slugify(String(input.slug || input.title || "")),
    title: String(input.title ?? "").trim().slice(0, 180),
    summary: String(input.summary ?? "").trim().slice(0, 500),
    body: String(input.body ?? "").slice(0, 100000),
    categorySlug: ["crypto", "ai", "saas", "guides", "comparisons", "research"].includes(
      String(input.categorySlug),
    )
      ? String(input.categorySlug)
      : "research",
    label: String(input.label ?? "Practical guide"),
    seoTitle: String(input.seoTitle ?? "").trim().slice(0, 180),
    seoDescription: String(input.seoDescription ?? "").trim().slice(0, 300),
    coverImage: safeImageSrc(String(input.coverImage ?? "")),
    coverAlt: String(input.coverAlt ?? "").trim().slice(0, 240),
    coverCaption: String(input.coverCaption ?? "").trim().slice(0, 300),
    featured: Boolean(input.featured),
    deepDive: Boolean(input.deepDive),
    lastChecked: String(input.lastChecked ?? "").slice(0, 10),
    affiliateDisclosure: Boolean(input.affiliateDisclosure),
    tags: (input.tags ?? []).map((tag) => String(tag).trim()).filter(Boolean).slice(0, 12),
    sources: cleanSources(input.sources ?? []),
    affiliateIds: (input.affiliateIds ?? []).map((id) => String(id).slice(0, 80)).slice(0, 12),
    authorId: String(input.authorId ?? ""),
  };
}

async function replaceRelations(sql: Sql, articleId: string, input: ArticleInput) {
  await sql`delete from article_sources where article_id = ${articleId}`;
  for (let i = 0; i < input.sources.length; i += 1) {
    const source = input.sources[i];
    if (!source.title && !source.url) continue;
    await sql`
      insert into article_sources
        (id, article_id, title, publisher, url, source_type, published_on, accessed_on, claim, sort_order)
      values (
        ${`src_${crypto.randomUUID()}`}, ${articleId}, ${source.title}, ${source.publisher}, ${source.url},
        ${source.sourceType}, ${source.publishedOn || null}, ${source.accessedOn || null}, ${source.claim}, ${i}
      )
    `;
  }
  await sql`delete from article_tags where article_id = ${articleId}`;
  for (const tag of input.tags) {
    const tagSlug = slugify(tag);
    if (!tagSlug) continue;
    await sql`
      insert into tags (slug, name) values (${tagSlug}, ${tag})
      on conflict (slug) do update set name = excluded.name
    `;
    await sql`
      insert into article_tags (article_id, tag_slug) values (${articleId}, ${tagSlug})
      on conflict do nothing
    `;
  }
  await sql`delete from article_affiliates where article_id = ${articleId}`;
  for (const affiliateId of input.affiliateIds) {
    const ok = await sql<{ id: string }>`select id from affiliates where id = ${affiliateId}`;
    if (!ok[0]) continue;
    await sql`
      insert into article_affiliates (article_id, affiliate_id)
      values (${articleId}, ${affiliateId})
      on conflict do nothing
    `;
  }
}

async function writeLive(sql: Sql, id: string, input: ArticleInput, status: ArticleStatus, publish: boolean) {
  const minutes = readingMinutes(input.body);
  if (publish) {
    await sql`
      update articles set
        slug = ${input.slug},
        title = ${input.title},
        summary = ${input.summary},
        body = ${input.body},
        category_slug = ${input.categorySlug},
        label = ${input.label},
        seo_title = ${input.seoTitle},
        seo_description = ${input.seoDescription},
        cover_image = ${input.coverImage},
        cover_alt = ${input.coverAlt},
        cover_caption = ${input.coverCaption},
        featured = ${input.featured},
        deep_dive = ${input.deepDive},
        last_checked = ${input.lastChecked || null},
        affiliate_disclosure = ${input.affiliateDisclosure},
        reading_minutes = ${minutes},
        status = 'published',
        published_at = coalesce(published_at, now()),
        updated_at = now(),
        draft_json = null,
        author_id = case when ${input.authorId} = '' then author_id else ${input.authorId} end
      where id = ${id}
    `;
  } else {
    await sql`
      update articles set
        slug = ${input.slug},
        title = ${input.title},
        summary = ${input.summary},
        body = ${input.body},
        category_slug = ${input.categorySlug},
        label = ${input.label},
        seo_title = ${input.seoTitle},
        seo_description = ${input.seoDescription},
        cover_image = ${input.coverImage},
        cover_alt = ${input.coverAlt},
        cover_caption = ${input.coverCaption},
        featured = ${input.featured},
        deep_dive = ${input.deepDive},
        last_checked = ${input.lastChecked || null},
        affiliate_disclosure = ${input.affiliateDisclosure},
        reading_minutes = ${minutes},
        status = ${status},
        updated_at = now(),
        draft_json = null,
        author_id = case when ${input.authorId} = '' then author_id else ${input.authorId} end
      where id = ${id}
    `;
  }
  await replaceRelations(sql, id, input);
}

export const deskOverview = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql, profile } = await gate(context.userId);
    const counts = await sql<{
      published: number;
      drafts: number;
      review: number;
      subscribers: number;
      pending_comments: number;
      messages: number;
      categories: number;
      admins: number;
      missing_sources: number;
    }>`
      select
        (select count(*)::int from articles where status = 'published') as published,
        (select count(*)::int from articles where status = 'draft') as drafts,
        (select count(*)::int from articles where status = 'review') as review,
        (select count(*)::int from subscribers where status = 'subscribed') as subscribers,
        (select count(*)::int from comments where status = 'pending') as pending_comments,
        (select count(*)::int from contact_messages where read_at is null) as messages,
        (select count(*)::int from categories) as categories,
        (select count(*)::int from profiles where role = 'admin') as admins,
        (select count(*)::int from articles a
          where a.status = 'published' and (
            a.last_checked is null
            or not exists (
              select 1 from article_sources s
              where s.article_id = a.id and length(trim(s.url)) > 0 and length(trim(s.claim)) > 0
            )
          )) as missing_sources
    `;
    const settings = await sql<{
      contact_email: string;
      public_url: string;
      newsletter_configured: unknown;
    }>`select contact_email, public_url, newsletter_configured from site_settings where id = 1`;
    const row = counts[0];
    const site = settings[0];
    const items = [
      { id: "admin", label: "Admin account available", done: num(row?.admins) > 0, required: true },
      { id: "categories", label: "Categories available", done: num(row?.categories) > 0, required: true },
      { id: "article", label: "At least one article published", done: num(row?.published) > 0, required: true },
      {
        id: "sources",
        label: "Published articles have sources and a last-checked date",
        done: num(row?.missing_sources) === 0,
        required: true,
      },
      { id: "url", label: "Public site URL configured", done: Boolean(site?.public_url), required: true },
      { id: "contact", label: "Contact email configured", done: Boolean(site?.contact_email), required: true },
      { id: "disclosure", label: "Affiliate disclosure page", done: true, required: true },
      { id: "legal", label: "Privacy policy and terms drafted", done: true, required: true },
      { id: "sitemap", label: "Sitemap and robots.txt routes", done: true, required: true },
      { id: "share", label: "Default share card included", done: true, required: false },
      {
        id: "newsletter",
        label: "Newsletter sending",
        done: flag(site?.newsletter_configured),
        required: false,
        note: flag(site?.newsletter_configured) ? "Marked configured." : "Not configured. Addresses are stored only.",
      },
    ];
    return {
      profile,
      counts: {
        published: num(row?.published),
        drafts: num(row?.drafts),
        review: num(row?.review),
        subscribers: profile.role === "writer" ? null : num(row?.subscribers),
        pendingComments: num(row?.pending_comments),
        messages: profile.role === "writer" ? null : num(row?.messages),
      },
      checklist: items,
    };
  });

export const listAdminArticles = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { status?: string; category?: string; q?: string }) => ({
    status: String(input?.status ?? "all"),
    category: String(input?.category ?? "all"),
    q: String(input?.q ?? "").slice(0, 80),
  }))
  .handler(async ({ context, data }) => {
    const { sql, profile } = await gate(context.userId);
    const like = `%${data.q.trim().replace(/[%_]/g, "")}%`;
    const rows = await sql<{
      id: string;
      slug: string;
      title: string;
      status: ArticleStatus;
      category_slug: string;
      label: string;
      updated_at: unknown;
      published_at: unknown;
      author_id: string;
      author_name: string | null;
      cover_image: string;
      cover_alt: string;
      featured: unknown;
    }>`
      select a.id, a.slug, a.title, a.status, a.category_slug, a.label, a.updated_at, a.published_at,
             a.author_id, p.display_name as author_name, a.cover_image, a.cover_alt, a.featured
      from articles a
      left join profiles p on p.user_id = a.author_id
      where (${data.status} = 'all' or a.status = ${data.status})
        and (${data.category} = 'all' or a.category_slug = ${data.category})
        and (${data.q.trim()} = '' or a.title ilike ${like} or a.slug ilike ${like})
        and (${profile.role} <> 'writer' or a.author_id = ${profile.userId})
      order by a.updated_at desc
      limit 100
    `;
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      status: row.status,
      categorySlug: row.category_slug,
      label: row.label,
      updatedAt: iso(row.updated_at),
      publishedAt: iso(row.published_at),
      authorId: row.author_id,
      authorName: row.author_name || "Ledgerline Desk",
      coverImage: row.cover_image ?? "",
      coverAlt: row.cover_alt ?? "",
      featured: flag(row.featured),
    }));
  });

export const getAdminArticle = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { id: string }) => ({ id: String(input?.id ?? "") }))
  .handler(async ({ context, data }) => {
    const { sql, profile } = await gate(context.userId);
    const rows = await sql<{
      id: string;
      slug: string;
      title: string;
      summary: string;
      body: string;
      status: ArticleStatus;
      category_slug: string;
      label: string;
      seo_title: string;
      seo_description: string;
      cover_image: string;
      cover_alt: string;
      cover_caption: string;
      featured: unknown;
      deep_dive: unknown;
      last_checked: unknown;
      affiliate_disclosure: unknown;
      author_id: string;
      published_at: unknown;
      updated_at: unknown;
      draft_json: string | null;
      reading_minutes: unknown;
      author_name: string | null;
    }>`
      select a.*, p.display_name as author_name
      from articles a
      left join profiles p on p.user_id = a.author_id
      where a.id = ${data.id}
    `;
    const row = rows[0];
    if (!row) return null;
    if (!canEdit(profile.role, row.author_id, profile.userId)) {
      throw new Error("You do not have permission to open that draft.");
    }
    const [sources, tags, affiliateIds, categories, affiliates, authors] = await Promise.all([
      sql<SourceInput & { source_type: string; published_on: unknown; accessed_on: unknown }>`
        select title, publisher, url, source_type, published_on, accessed_on, claim
        from article_sources where article_id = ${row.id} order by sort_order asc
      `,
      sql<{ name: string }>`
        select t.name from tags t
        join article_tags at on at.tag_slug = t.slug
        where at.article_id = ${row.id}
      `,
      sql<{ affiliate_id: string }>`select affiliate_id from article_affiliates where article_id = ${row.id}`,
      sql<{ slug: string; name: string }>`select slug, name from categories order by sort_order asc`,
      profile.role === "writer"
        ? Promise.resolve([] as { id: string; name: string; approval_status: string; active: boolean }[])
        : sql<{ id: string; name: string; approval_status: string; active: unknown }>`
            select id, name, approval_status, active from affiliates order by name asc
          `.then((items) =>
            items.map((item) => ({
              id: item.id,
              name: item.name,
              approval_status: item.approval_status,
              active: flag(item.active),
            })),
          ),
      profile.role === "writer"
        ? Promise.resolve([])
        : sql<{ user_id: string; display_name: string; role: string }>`
            select user_id, display_name, role from profiles order by display_name asc
          `,
    ]);
    const live: ArticleInput = {
      id: row.id,
      slug: row.slug,
      title: row.title,
      summary: row.summary,
      body: row.body,
      categorySlug: row.category_slug,
      label: row.label,
      seoTitle: row.seo_title,
      seoDescription: row.seo_description,
      coverImage: row.cover_image,
      coverAlt: row.cover_alt,
      coverCaption: row.cover_caption,
      featured: flag(row.featured),
      deepDive: flag(row.deep_dive),
      lastChecked: day(row.last_checked),
      affiliateDisclosure: flag(row.affiliate_disclosure),
      tags: tags.map((tag) => tag.name),
      sources: sources.map((source) => ({
        title: source.title,
        publisher: source.publisher,
        url: source.url,
        sourceType: source.source_type,
        publishedOn: day(source.published_on),
        accessedOn: day(source.accessed_on),
        claim: source.claim,
      })),
      affiliateIds: affiliateIds.map((item) => item.affiliate_id),
      authorId: row.author_id,
    };
    let draft = live;
    if (row.draft_json) {
      try {
        draft = { ...live, ...(JSON.parse(row.draft_json) as ArticleInput), id: row.id };
      } catch {
        draft = live;
      }
    }
    return {
      status: row.status,
      publishedAt: iso(row.published_at),
      updatedAt: iso(row.updated_at),
      authorName: row.author_name || "Ledgerline Desk",
      hasUnpublishedEdits: Boolean(row.draft_json) && row.status === "published",
      readingMinutes: num(row.reading_minutes) || 1,
      live,
      draft,
      role: profile.role,
      categories,
      affiliates,
      authors,
    };
  });

export const getEditorMeta = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql, profile } = await gate(context.userId);
    const categories = await sql<{ slug: string; name: string }>`
      select slug, name from categories order by sort_order asc
    `;
    const affiliates =
      profile.role === "writer"
        ? []
        : (
            await sql<{ id: string; name: string; approval_status: string; active: unknown }>`
              select id, name, approval_status, active from affiliates order by name asc
            `
          ).map((item) => ({
            id: item.id,
            name: item.name,
            approval_status: item.approval_status,
            active: flag(item.active),
          }));
    const authors =
      profile.role === "writer"
        ? []
        : await sql<{ user_id: string; display_name: string }>`
            select user_id, display_name from profiles order by display_name asc
          `;
    return { role: profile.role, categories, affiliates, authors };
  });

export const saveArticle = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: ArticleInput) => input)
  .handler(async ({ context, data }) => {
    const { sql, profile } = await gate(context.userId);
    const input = cleanInput(data);
    if (!input.title) throw new Error("Add a headline before saving.");
    if (!input.slug) input.slug = slugify(input.title);
    const duplicate = await sql<{ id: string }>`
      select id from articles where slug = ${input.slug} and id <> ${input.id ?? ""}
    `;
    if (duplicate[0]) throw new Error("That slug is already in use.");
    if (!input.id) {
      const id = `art_${crypto.randomUUID()}`;
      input.id = id;
      input.authorId = profile.userId;
      await sql`
        insert into articles (
          id, slug, title, summary, body, status, category_slug, author_id, label,
          seo_title, seo_description, cover_image, cover_alt, cover_caption,
          featured, deep_dive, last_checked, affiliate_disclosure, reading_minutes
        ) values (
          ${id}, ${input.slug}, ${input.title}, ${input.summary}, ${input.body}, 'draft',
          ${input.categorySlug || "research"}, ${profile.userId}, ${input.label},
          ${input.seoTitle}, ${input.seoDescription}, ${input.coverImage}, ${input.coverAlt},
          ${input.coverCaption}, ${input.featured}, ${input.deepDive}, ${input.lastChecked || null},
          ${input.affiliateDisclosure}, ${readingMinutes(input.body)}
        )
      `;
      await replaceRelations(sql, id, input);
      await sql`
        insert into revisions (id, article_id, actor_id, action)
        values (${`rev_${crypto.randomUUID()}`}, ${id}, ${profile.userId}, 'create')
      `;
      return { id, status: "draft" as const, private: false };
    }
    const existing = await sql<{ id: string; status: ArticleStatus; author_id: string; slug: string }>`
      select id, status, author_id, slug from articles where id = ${input.id}
    `;
    const row = existing[0];
    if (!row) throw new Error("Article not found.");
    if (!canEdit(profile.role, row.author_id, profile.userId)) {
      throw new Error("You do not have permission to edit that article.");
    }
    if (profile.role === "writer") input.authorId = row.author_id;
    if (row.slug !== input.slug && row.status === "published") {
      await sql`
        insert into slug_redirects (from_slug, to_slug) values (${row.slug}, ${input.slug})
        on conflict (from_slug) do update set to_slug = excluded.to_slug
      `;
    }
    if (row.status === "published") {
      await sql`
        update articles
        set draft_json = ${JSON.stringify(input)}, updated_at = now()
        where id = ${row.id}
      `;
      return { id: row.id, status: row.status, private: true };
    }
    await writeLive(sql, row.id, input, row.status, false);
    return { id: row.id, status: row.status, private: false };
  });

export const changeArticleStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id?: string; status?: ArticleStatus; payload?: ArticleInput }) => ({
    id: String(input?.id ?? ""),
    status: input?.status ?? "draft",
    payload: input?.payload,
  }))
  .handler(async ({ context, data }) => {
    const { sql, profile } = await gate(context.userId);
    const rows = await sql<{ id: string; status: ArticleStatus; author_id: string; slug: string }>`
      select id, status, author_id, slug from articles where id = ${data.id}
    `;
    const row = rows[0];
    if (!row) throw new Error("Article not found.");
    if (!canEdit(profile.role, row.author_id, profile.userId)) {
      throw new Error("You do not have permission to change that article.");
    }
    const next = data.status;
    if (next === "published") {
      if (!editorRoles.includes(profile.role)) {
        throw new Error("Writers can submit work for review. An editor publishes it.");
      }
      if (!data.payload) throw new Error("Nothing to publish.");
      const input = cleanInput({ ...data.payload, id: row.id });
      const errors = publishErrors(input);
      if (errors.length) throw new Error(errors[0]);
      const duplicate = await sql<{ id: string }>`
        select id from articles where slug = ${input.slug} and id <> ${row.id}
      `;
      if (duplicate[0]) throw new Error("That slug is already in use.");
      if (row.slug !== input.slug) {
        await sql`
          insert into slug_redirects (from_slug, to_slug) values (${row.slug}, ${input.slug})
          on conflict (from_slug) do update set to_slug = excluded.to_slug
        `;
      }
      await writeLive(sql, row.id, input, "published", true);
      await sql`
        insert into revisions (id, article_id, actor_id, action)
        values (${`rev_${crypto.randomUUID()}`}, ${row.id}, ${profile.userId}, 'publish')
      `;
      return { ok: true, status: "published" as const };
    }
    if ((next === "archived" || row.status === "published") && !editorRoles.includes(profile.role)) {
      throw new Error("Only an editor can unpublish or archive.");
    }
    if (next === "review" || next === "draft" || next === "archived") {
      await sql`update articles set status = ${next}, updated_at = now() where id = ${row.id}`;
      await sql`
        insert into revisions (id, article_id, actor_id, action)
        values (${`rev_${crypto.randomUUID()}`}, ${row.id}, ${profile.userId}, ${next})
      `;
      return { ok: true, status: next };
    }
    throw new Error("Unknown status.");
  });

export const listAffiliates = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql } = await gate(context.userId, ["admin"]);
    const rows = await sql<{
      id: string;
      name: string;
      category: string;
      website: string;
      affiliate_url: string;
      program_name: string;
      commission_notes: string;
      commission_type: string;
      cookie_notes: string;
      eligibility: string;
      approval_status: string;
      notes: string;
      last_verified: unknown;
      active: unknown;
      clicks: number;
    }>`
      select f.*, (select count(*)::int from affiliate_clicks c where c.affiliate_id = f.id) as clicks
      from affiliates f
      order by f.name asc
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
      cookieNotes: row.cookie_notes,
      eligibility: row.eligibility,
      approvalStatus: row.approval_status,
      notes: row.notes,
      lastVerified: day(row.last_verified),
      active: flag(row.active),
      clicks: num(row.clicks),
    }));
  });

export const saveAffiliate = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: Record<string, unknown>) => input)
  .handler(async ({ context, data }) => {
    const { sql } = await gate(context.userId, ["admin"]);
    const name = String(data.name ?? "").trim().slice(0, 160);
    if (!name) throw new Error("Name the product or company.");
    const approval = String(data.approvalStatus ?? "not_applied");
    const allowed = ["not_applied", "pending", "approved", "rejected", "inactive"];
    if (!allowed.includes(approval)) throw new Error("Unknown approval status.");
    const commissionType = String(data.commissionType ?? "undocumented");
    if (!["undocumented", "one-time", "recurring"].includes(commissionType)) {
      throw new Error("Commission type must be undocumented until the program states otherwise.");
    }
    const active = Boolean(data.active) && approval === "approved";
    const fields = {
      category: String(data.category ?? "").slice(0, 80),
      website: String(data.website ?? "").trim().slice(0, 400),
      affiliateUrl: String(data.affiliateUrl ?? "").trim().slice(0, 500),
      programName: String(data.programName ?? "").slice(0, 160),
      commissionNotes: String(data.commissionNotes ?? "").slice(0, 400),
      cookieNotes: String(data.cookieNotes ?? "").slice(0, 200),
      eligibility: String(data.eligibility ?? "").slice(0, 400),
      notes: String(data.notes ?? "").slice(0, 800),
      lastVerified: String(data.lastVerified ?? "").slice(0, 10),
    };
    const id = String(data.id ?? "") || `aff_${crypto.randomUUID()}`;
    await sql`
      insert into affiliates (
        id, name, category, website, affiliate_url, program_name, commission_notes, commission_type,
        cookie_notes, eligibility, approval_status, notes, last_verified, active
      ) values (
        ${id}, ${name}, ${fields.category}, ${fields.website}, ${fields.affiliateUrl}, ${fields.programName},
        ${fields.commissionNotes}, ${commissionType}, ${fields.cookieNotes}, ${fields.eligibility},
        ${approval}, ${fields.notes}, ${fields.lastVerified || null}, ${active}
      )
      on conflict (id) do update set
        name = excluded.name,
        category = excluded.category,
        website = excluded.website,
        affiliate_url = excluded.affiliate_url,
        program_name = excluded.program_name,
        commission_notes = excluded.commission_notes,
        commission_type = excluded.commission_type,
        cookie_notes = excluded.cookie_notes,
        eligibility = excluded.eligibility,
        approval_status = excluded.approval_status,
        notes = excluded.notes,
        last_verified = excluded.last_verified,
        active = excluded.active
    `;
    return { id, active };
  });

export const listSubscribers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql } = await gate(context.userId, ["admin"]);
    const rows = await sql<{ email: string; status: string; created_at: unknown }>`
      select email, status, created_at from subscribers order by created_at desc limit 500
    `;
    return rows.map((row) => ({
      email: row.email,
      status: row.status,
      createdAt: iso(row.created_at),
    }));
  });

export const exportSubscribers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql } = await gate(context.userId, ["admin"]);
    const rows = await sql<{ email: string; status: string; created_at: unknown }>`
      select email, status, created_at from subscribers order by created_at asc
    `;
    const lines = ["email,status,created_at"];
    for (const row of rows) {
      lines.push(`${row.email},${row.status},${iso(row.created_at)}`);
    }
    return { csv: lines.join("\n") };
  });

export const listCommentsAdmin = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql } = await gate(context.userId, editorRoles);
    const rows = await sql<{
      id: string;
      author_name: string;
      body: string;
      status: string;
      created_at: unknown;
      title: string;
      slug: string;
    }>`
      select c.id, c.author_name, c.body, c.status, c.created_at, a.title, a.slug
      from comments c
      join articles a on a.id = c.article_id
      order by c.created_at desc
      limit 200
    `;
    return rows.map((row) => ({
      id: row.id,
      authorName: row.author_name,
      body: row.body,
      status: row.status,
      createdAt: iso(row.created_at),
      title: row.title,
      slug: row.slug,
    }));
  });

export const moderateComment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id?: string; status?: string }) => ({
    id: String(input?.id ?? ""),
    status: String(input?.status ?? ""),
  }))
  .handler(async ({ context, data }) => {
    const { sql } = await gate(context.userId, editorRoles);
    if (!["approved", "rejected", "pending"].includes(data.status)) throw new Error("Unknown decision.");
    if (data.status === "rejected") {
      await sql`delete from comments where id = ${data.id}`;
      return { ok: true };
    }
    await sql`update comments set status = ${data.status} where id = ${data.id}`;
    return { ok: true };
  });

export const listMessages = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql } = await gate(context.userId, editorRoles);
    const rows = await sql<{
      id: string;
      name: string;
      email: string;
      message: string;
      created_at: unknown;
      read_at: unknown;
    }>`
      select id, name, email, message, created_at, read_at
      from contact_messages order by created_at desc limit 100
    `;
    await sql`update contact_messages set read_at = now() where read_at is null`;
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      message: row.message,
      createdAt: iso(row.created_at),
      read: Boolean(row.read_at),
    }));
  });

export const listProfiles = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql, profile } = await gate(context.userId);
    if (profile.role !== "admin") return { self: profile, people: [] as Profile[] };
    const rows = await sql<{
      user_id: string;
      role: Role;
      display_name: string;
      bio: string;
      x_handle: string;
      x_url: string;
    }>`select user_id, role, display_name, bio, x_handle, x_url from profiles order by created_at asc`;
    return {
      self: profile,
      people: rows.map((row) => ({
        userId: row.user_id,
        role: row.role,
        displayName: row.display_name,
        bio: row.bio ?? "",
        xHandle: row.x_handle ?? "",
        xUrl: row.x_url ?? "",
      })),
    };
  });

export const saveProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { userId?: string; role?: string; displayName?: string; bio?: string; xHandle?: string; xUrl?: string }) => input)
  .handler(async ({ context, data }) => {
    const { sql, profile } = await gate(context.userId);
    const target = String(data.userId || profile.userId);
    if (target !== profile.userId && profile.role !== "admin") {
      throw new Error("Only an admin can edit another person.");
    }
    const displayName = String(data.displayName ?? "").trim().slice(0, 80) || "Editor";
    const bio = String(data.bio ?? "").trim().slice(0, 800);
    const xHandle = String(data.xHandle ?? "").trim().replace(/^@/, "").slice(0, 40);
    const xUrl = String(data.xUrl ?? "").trim().slice(0, 200);
    if (xUrl && !/^https:\/\/(x\.com|twitter\.com)\//i.test(xUrl)) {
      throw new Error("X links must start with https://x.com/ or https://twitter.com/.");
    }
    let role = profile.role;
    if (profile.role === "admin" && data.role && target) {
      if (!["admin", "editor", "writer", "reader"].includes(String(data.role))) throw new Error("Unknown role.");
      role = data.role as Role;
      if (role !== "admin") {
        const others = await sql<{ n: number }>`
          select count(*)::int as n from profiles where role = 'admin' and user_id <> ${target}
        `;
        if (num(others[0]?.n) === 0) throw new Error("Keep at least one admin.");
      }
    }
    await sql`
      update profiles
      set display_name = ${displayName}, bio = ${bio}, x_handle = ${xHandle}, x_url = ${xUrl}, role = ${role}
      where user_id = ${target}
    `;
    return { ok: true };
  });

export const saveSettings = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: Record<string, unknown>) => input)
  .handler(async ({ context, data }) => {
    const { sql } = await gate(context.userId, ["admin"]);
    const contact = String(data.contactEmail ?? "").trim().toLowerCase();
    if (contact && !isEmail(contact)) throw new Error("Contact email is not valid.");
    const publicUrl = String(data.publicUrl ?? "").trim().replace(/\/$/, "");
    if (publicUrl && !/^https?:\/\//i.test(publicUrl)) {
      throw new Error("Public URL should start with https://");
    }
    const xUrl = String(data.xUrl ?? "").trim();
    if (xUrl && !/^https:\/\/(x\.com|twitter\.com)\//i.test(xUrl)) {
      throw new Error("X profile must be an https://x.com/ or https://twitter.com/ URL.");
    }
    await sql`
      update site_settings set
        contact_email = ${contact},
        public_url = ${publicUrl},
        x_url = ${xUrl},
        author_name = ${String(data.authorName ?? "Ledgerline Desk").slice(0, 80)},
        author_bio = ${String(data.authorBio ?? "").slice(0, 800)},
        newsletter_configured = ${Boolean(data.newsletterConfigured)},
        comments_enabled = ${data.commentsEnabled !== false},
        tagline = ${String(data.tagline ?? "Research before you pay.").slice(0, 140)}
      where id = 1
    `;
    return { ok: true };
  });

export const getSettingsAdmin = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql } = await gate(context.userId, ["admin"]);
    const rows = await sql<{
      tagline: string;
      contact_email: string;
      public_url: string;
      x_url: string;
      author_name: string;
      author_bio: string;
      newsletter_configured: unknown;
      comments_enabled: unknown;
    }>`
      select tagline, contact_email, public_url, x_url, author_name, author_bio,
             newsletter_configured, comments_enabled
      from site_settings where id = 1
    `;
    const row = rows[0];
    return {
      tagline: row?.tagline ?? "",
      contactEmail: row?.contact_email ?? "",
      publicUrl: row?.public_url ?? "",
      xUrl: row?.x_url ?? "",
      authorName: row?.author_name ?? "",
      authorBio: row?.author_bio ?? "",
      newsletterConfigured: flag(row?.newsletter_configured),
      commentsEnabled: flag(row?.comments_enabled),
    };
  });

export const staffStatus = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<{ n: number }>`select count(*)::int as n from profiles where role = 'admin'`;
  return { needsBootstrap: num(rows[0]?.n) === 0 };
});

export const bootstrapStaff = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { displayName?: string }) => ({
    displayName: String(input?.displayName ?? "").trim().slice(0, 80),
  }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const profile = await ensureProfile(sql, context.userId);
    const admins = await sql<{ n: number }>`select count(*)::int as n from profiles where role = 'admin'`;
    if (num(admins[0]?.n) > 0) return { ok: false as const };
    const displayName = data.displayName || (profile.displayName === "Reader" ? "Editor" : profile.displayName);
    await sql`
      update profiles
      set role = 'admin', display_name = ${displayName}
      where user_id = ${context.userId}
        and (select count(*) from profiles where role = 'admin') = 0
    `;
    const check = await sql<{ role: string }>`select role from profiles where user_id = ${context.userId}`;
    return { ok: check[0]?.role === "admin" };
  });

export const claimStaff = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const profile = await ensureProfile(sql, context.userId);
    if (!staffRoles.includes(profile.role)) return { ok: false as const, role: profile.role };
    return { ok: true as const, role: profile.role };
  });

export const uploadImage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { dataUrl: string }) => input)
  .handler(async ({ context, data }) => {
    const { profile } = await gate(context.userId);
    if (profile.role === "reader") throw new Error("You do not have permission to upload images.");
    const match = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(data.dataUrl);
    if (!match) throw new Error("Only JPEG images can be uploaded.");
    const bytes = Buffer.from(match[1], "base64");
    if (bytes.length > 2_000_000) throw new Error("That image is too large.");
    const blob = await put(`media/${Date.now()}.jpg`, bytes, {
      access: "public",
      contentType: "image/jpeg",
      addRandomSuffix: true,
    });
    return { url: blob.url };
  });
