import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

export const listInbound = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const who = await sql<{ role: string }>`
      select role from profiles where user_id = ${context.userId}
    `;
    const role = who[0]?.role;
    if (role !== "admin" && role !== "editor") throw new Error("Staff only.");
    const rows = await sql<{ id: string; slug: string; title: string; n: number }>`
      select a.id, a.slug, a.title,
        (select count(*)::int from articles b
          where b.status = 'published' and b.id <> a.id
            and b.body ~ ('/article/' || a.slug || '([^a-z0-9-]|$)')) as n
      from articles a
      where a.status = 'published'
      order by n asc, a.published_at desc nulls last
    `;
    return rows;
  });
