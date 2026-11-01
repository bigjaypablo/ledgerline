import { useEffect, useState } from "react";
import { getArticleDetail } from "@/lib/editorial/admin";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

type Detail = Awaited<ReturnType<typeof getArticleDetail>>;

const RANGES = [
  { v: 1, t: "Last 24 hours" },
  { v: 7, t: "Last 7 days" },
  { v: 30, t: "Last 30 days" },
  { v: 90, t: "Last 3 months" },
  { v: 180, t: "Last 6 months" },
  { v: 365, t: "Last 12 months" },
  { v: 0, t: "All time" },
];

function pretty(label: string): string {
  return label.length === 13 ? `${label.slice(0, 10)} ${label.slice(11)}:00` : label;
}

function pct(a: number, b: number): string {
  return b > 0 ? `${((a / b) * 100).toFixed(1)}%` : "—";
}

function Box({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-line bg-card p-4">
      <dt className="text-xs font-bold tracking-widest uppercase text-muted">{label}</dt>
      <dd className="mt-1 font-serif text-3xl">{value}</dd>
    </div>
  );
}

function Bars({ title, values, names }: { title: string; values: number[]; names: string[] }) {
  const max = Math.max(1, ...values);
  return (
    <div className="mt-6">
      <h3 className="text-sm font-bold tracking-widest uppercase">{title}</h3>
      <div className="mt-2 flex h-36 items-end gap-px border-b border-line">
        {values.map((v, i) => (
          <div
            key={i}
            title={`${names[i]}: ${v}`}
            className="min-w-0 flex-1 bg-ink"
            style={{ height: `${(v / max) * 100}%`, minHeight: v > 0 ? 2 : 0 }}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted">
        <span>{names[0]}</span>
        <span>{names[names.length - 1]}</span>
      </div>
    </div>
  );
}

export function ArticleStats({ articleId }: { articleId: string }) {
  const { user } = useCurrentUserState();
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Detail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    let live = true;
    setError("");
    getArticleDetail({ data: { id: articleId, days } })
      .then((d) => {
        if (live) setData(d);
      })
      .catch((e: unknown) => {
        if (live) setError(e instanceof Error ? e.message : "Could not load stats.");
      });
    return () => {
      live = false;
    };
  }, [user?.id, articleId, days]);

  const names = (data?.series ?? []).map((p) => pretty(p.label));

  return (
    <main>
      <a href="/admin/articles" className="text-sm font-semibold text-accent">
        ← Posts
      </a>
      <h1 className="mt-2 font-serif text-3xl font-semibold">{data?.title ?? "Post stats"}</h1>
      {data ? <p className="mt-1 text-xs font-semibold tracking-wide text-muted uppercase">{data.status}</p> : null}
      <div className="mt-4 flex justify-end">
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="min-h-11 border border-line bg-card px-2"
          aria-label="Time range"
        >
          {RANGES.map((r) => (
            <option key={r.v} value={r.v}>
              {r.t}
            </option>
          ))}
        </select>
      </div>
      {error ? <p className="mt-4 text-accent">{error}</p> : null}
      {!data && !error ? <p className="mt-4 text-muted">Loading…</p> : null}
      {data ? (
        <>
          <dl className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
            <Box label="Impressions" value={data.totals.impressions} />
            <Box label="Views" value={data.totals.views} />
            <Box label="Affiliate clicks" value={data.totals.clicks} />
            <Box label="Impression → view" value={pct(data.totals.views, data.totals.impressions)} />
            <Box label="View → click" value={pct(data.totals.clicks, data.totals.views)} />
          </dl>
          <Bars title="Views" values={data.series.map((p) => p.views)} names={names} />
          <Bars title="Impressions" values={data.series.map((p) => p.impressions)} names={names} />
          <Bars title="Affiliate clicks" values={data.series.map((p) => p.clicks)} names={names} />
        </>
      ) : null}
    </main>
  );
}
