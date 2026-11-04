import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

const clean = (s: string) => s.replace(/<[^>]*>/g, "").trim();

export const postComment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { articleSlug?: string; body?: string; parentId?: string | null }) => ({
    articleSlug: String(input?.articleSlug ?? "").slice(0, 120),
    body: clean(String(input?.body ?? "")).slice(0, 1000),
    parentId: input?.parentId ? String(input.parentId).slice(0, 80) : null,
  }))
  .handler(async ({ context, data }) => {
    if (data.body.length < 8) return { ok: false, message: "Write at least a full sentence." };
    if (/https?:\/\/|www\./i.test(data.body)) return { ok: false, message: "Links are not accepted in comments." };
    const sql = await getSql();
    const articles = await sql<{ id: string }>`
      select id from articles where slug = ${data.articleSlug} and status = 'published'
    `;
    if (!articles[0]) return { ok: false, message: "That article is not open for comments." };
    const recent = await sql<{ n: number }>`
      select count(*)::int as n from comments
      where user_id = ${context.userId} and created_at > now() - interval '10 minutes'
    `;
    if (Number(recent[0]?.n ?? 0) >= 3) return { ok: false, message: "Please wait a few minutes before commenting again." };
    let parent: string | null = null;
    if (data.parentId) {
      const p = await sql<{ id: string; parent_id: string | null }>`
        select id, parent_id from comments
        where id = ${data.parentId} and article_id = ${articles[0].id} and status = 'approved'
      `;
      if (!p[0]) return { ok: false, message: "That comment is no longer available." };
      parent = p[0].parent_id ?? p[0].id;
    }
    const users = await sql<{ name: string }>`select name from "user" where id = ${context.userId}`;
    const name = (users[0]?.name || "Reader").slice(0, 80);
    await sql`
      insert into comments (id, article_id, author_name, body, status, parent_id, user_id)
      values (${`cmt_${crypto.randomUUID()}`}, ${articles[0].id}, ${name}, ${data.body}, 'pending', ${parent}, ${context.userId})
    `;
    return { ok: true, message: "Sent for moderation. It appears once an editor approves it." };
  });

export const toggleCommentLike = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { commentId?: string }) => ({ commentId: String(input?.commentId ?? "").slice(0, 80) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const c = await sql<{ id: string }>`select id from comments where id = ${data.commentId} and status = 'approved'`;
    if (!c[0]) throw new Error("Comment not found.");
    const had = await sql`select 1 from comment_likes where comment_id = ${data.commentId} and user_id = ${context.userId}`;
    if (had.length) await sql`delete from comment_likes where comment_id = ${data.commentId} and user_id = ${context.userId}`;
    else await sql`insert into comment_likes (comment_id, user_id) values (${data.commentId}, ${context.userId}) on conflict do nothing`;
    const n = await sql<{ n: number }>`select count(*)::int as n from comment_likes where comment_id = ${data.commentId}`;
    return { liked: !had.length, count: Number(n[0]?.n ?? 0) };
  });

export const myCommentLikes = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { articleSlug?: string }) => ({ articleSlug: String(input?.articleSlug ?? "").slice(0, 120) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<{ comment_id: string }>`
      select l.comment_id from comment_likes l
      join comments c on c.id = l.comment_id
      join articles a on a.id = c.article_id
      where l.user_id = ${context.userId} and a.slug = ${data.articleSlug}
    `;
    return rows.map((r) => r.comment_id);
  });
