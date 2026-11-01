import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { getArticleStats, listAdminArticles } from "@/lib/editorial/admin";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { formatDate, safeImageSrc } from "@/lib/editorial/text";

type Rows = Awaited<ReturnType<typeof listAdminArticles>>;
type Stats = Awaited<ReturnType<typeof getArticleStats>>;

const pill: Record<string, string> = {
  published: "bg-ink text-inverse-fg border-ink",
  review: "border-accent text-accent",
  draft: "border-line text-muted bg-paper",
  archived: "border-line text-muted line-through",
};

function Tile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-line bg-card p-4">
      <dt className="text-xs font-bold tracking-widest uppercase text-muted">{label}</dt>
      <dd className="mt-1 font-serif text-3xl">{value}</dd>
    </div>
  );
}

export function PostsList() {
  const { user } = useCurrentUserState();
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Rows | null>(null);
  const [stats, setStats] = useState<Stats>({});
  const [error, setError] = useState("");

  useEffect(() => {
    getArticleStats().then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    let live = true;
    listAdminArticles({ data: { status, category, q } })
      .then((v) => {
        if (live) setRows(v);
      })
      .catch((e: unknown) => {
        if (live) setError(e instanceof Error ? e.message : "Could not list articles.");
      });
    return () => {
      live = false;
    };
  }, [user?.id, status, category, q]);

  const list = rows ?? [];
  const hasStats = Object.keys(stats).length > 0;
  const views7 = Object.values(stats).reduce((a, s) => a + s.views7, 0);
  const sel = "min-h-11 border border-line bg-card px-2 text-sm";

  return (
    <main>
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-serif text-4xl font-semibold">Posts</h1>
        <Link to="/admin/articles/new" className="inline-flex min-h-11 items-center bg-ink px-4 text-sm font-semibold text-inverse-fg">
          New post
        </Link>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tile label="Posts" value={list.length} />
        <Tile label="Published" value={list.filter((r) => r.status === "published").length} />
        <Tile label="Drafts" value={list.filter((r) => r.status === "draft" || r.status === "review").length} />
        <Tile label="Views, 7d" value={hasStats ? views7 : "—"} />
      </dl>

      <div className="mt-5 flex flex-wrap gap-2">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={sel} aria-label="Status">
          {["all", "draft", "review", "published", "archived"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={sel} aria-label="Category">
          {["all", "crypto", "ai", "saas", "guides", "comparisons", "research"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search titles" className={`${sel} min-w-0 flex-1 px-3`} aria-label="Search titles" />
      </div>

      {error ? <p className="mt-4 text-accent">{error}</p> : null}

      <ul className="mt-4 space-y-3">
        {list.map((row) => {
          const img = safeImageSrc(row.coverImage);
          const s = stats[row.id];
          return (
            <li key={row.id} className="flex gap-3 border border-line bg-card p-3">
              <div className="h-20 w-20 shrink-0 overflow-hidden bg-line">
                {img ? <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" /> : null}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  to="/admin/articles/$articleId"
                  params={{ articleId: row.id }}
                  className="line-clamp-2 font-serif text-lg font-semibold leading-snug"
                >
                  {row.title || "Untitled"}
                </Link>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                  <span className={`border px-1.5 text-[10px] font-bold tracking-widest uppercase ${pill[row.status] ?? pill.draft}`}>
                    {row.status}
                  </span>
                  <span className="uppercase">{row.categorySlug}</span>
                  <span>·</span>
                  <span>{formatDate(row.updatedAt)}</span>
                </p>
                {row.status === "published" ? (
                  <p className="mt-2 flex items-center gap-3 text-sm">
                    <span className="font-semibold">{s ? s.viewsAll : "—"} views</span>
                    <Link
                      to="/admin/articles/stats/$articleId"
                      params={{ articleId: row.id }}
                      className="font-semibold text-accent"
                    >
                      Stats →
                    </Link>
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
      {rows && rows.length === 0 ? <p className="mt-4 text-muted">No posts match this filter.</p> : null}
    </main>
  );
}
