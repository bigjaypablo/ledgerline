import { useEffect, useState } from "react";
import { getMetrics } from "@/lib/editorial/admin";

type Metrics = Awaited<ReturnType<typeof getMetrics>>;

function Box({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-line bg-card p-4">
      <dt className="text-xs font-bold tracking-widest uppercase text-muted">{label}</dt>
      <dd className="mt-1 font-serif text-3xl">{value}</dd>
    </div>
  );
}

export function MetricsPanel() {
  const [data, setData] = useState<Metrics | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    getMetrics()
      .then(setData)
      .catch(() => setHidden(true));
  }, []);

  if (hidden) return null;
  if (!data) return <p className="mt-10 text-sm text-muted">Loading metrics…</p>;

  const ctr = data.views30 > 0 ? ((data.clicks30 / data.views30) * 100).toFixed(1) + "%" : "—";

  return (
    <section className="mt-10">
      <h2 className="font-serif text-2xl font-semibold">Traffic</h2>
      <dl className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-3">
        <Box label="Views, 24h" value={data.views1} />
        <Box label="Views, 7d" value={data.views7} />
        <Box label="Views, 30d" value={data.views30} />
        <Box label="Affiliate clicks, 7d" value={data.clicks7} />
        <Box label="Affiliate clicks, 30d" value={data.clicks30} />
        <Box label="Click rate, 30d" value={ctr} />
      </dl>
      <h3 className="mt-6 text-sm font-bold tracking-widest uppercase">Top articles, 30d</h3>
      {data.topArticles.length === 0 ? (
        <p className="mt-2 text-sm text-muted">No article views yet.</p>
      ) : (
        <ul className="mt-2 divide-y divide-line border-y border-line text-sm">
          {data.topArticles.map((a) => (
            <li key={a.slug} className="flex justify-between gap-4 py-2">
              <span>{a.title}</span>
              <span className="shrink-0 text-muted">
                {a.views} views · {a.clicks} clicks
              </span>
            </li>
          ))}
        </ul>
      )}
      <h3 className="mt-6 text-sm font-bold tracking-widest uppercase">Referrers, 30d</h3>
      {data.referrers.length === 0 ? (
        <p className="mt-2 text-sm text-muted">No external referrers yet.</p>
      ) : (
        <ul className="mt-2 divide-y divide-line border-y border-line text-sm">
          {data.referrers.map((r) => (
            <li key={r.referrer} className="flex justify-between gap-4 py-2">
              <span>{r.referrer}</span>
              <span className="text-muted">{r.n}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
