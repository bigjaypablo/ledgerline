import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";

export const findArticles = createServerFn({ method: "GET" })
  .validator((input: { q?: string }) => ({
    q: String(input?.q ?? "").slice(0, 80),
  }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const like = "%" + data.q.trim().replace(/[%_]/g, "") + "%";
    const rows = await sql<{ slug: string; title: string }>`
      select slug, title from articles
      where status = 'published' and title ilike ${like}
      order by published_at desc nulls last
      limit 10
    `;
    return rows;
  });
