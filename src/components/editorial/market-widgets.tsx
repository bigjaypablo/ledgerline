import { useEffect, useState } from "react";
import { getMarketWidgets, type MarketWidgets } from "@/lib/editorial/public";

function usd(v: number): string {
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  return `$${(v / 1e9).toFixed(0)}B`;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-line bg-card p-4">
      <h3 className="text-xs font-bold tracking-widest text-muted uppercase">{title}</h3>
      {children}
    </div>
  );
}

export function MarketWidgets() {
  const [data, setData] = useState<MarketWidgets | null>(null);

  useEffect(() => {
    let live = true;
    getMarketWidgets()
      .then((v) => {
        if (live) setData(v);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  if (!data || (!data.fearGreed && data.btcDominance === null)) return null;
  const fg = data.fearGreed;
  const up = (data.marketCapChange ?? 0) >= 0;

  return (
    <section className="sheet border-t border-ink py-6" aria-label="Market widgets">
      <div className="mb-3 flex items-end justify-between border-b border-ink pb-2">
        <h2 className="text-sm font-bold tracking-widest uppercase">Market snapshot</h2>
        <span className="text-xs text-muted">Informational only. Not financial advice.</span>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {fg ? (
          <Card title="Fear & Greed">
            <p className="mt-2 font-serif text-4xl">
              {fg.value} <span className="text-lg text-muted">{fg.label}</span>
            </p>
            <div
              className="relative mt-3 h-2 rounded-full"
              style={{ background: "linear-gradient(to right, #c0392b, #e0a030, #3c9a5f)" }}
              role="img"
              aria-label={`Fear and greed index ${fg.value} out of 100`}
            >
              <span
                className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-ink"
                style={{ left: `${Math.min(100, Math.max(0, fg.value))}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[10px] font-semibold tracking-widest text-muted uppercase">
              <span>Fear</span>
              <span>Greed</span>
            </div>
          </Card>
        ) : null}
        {data.btcDominance !== null ? (
          <Card title="BTC dominance">
            <p className="mt-2 font-serif text-4xl">{data.btcDominance.toFixed(1)}%</p>
            <div className="mt-3 h-2 bg-line">
              <div className="h-full bg-accent" style={{ width: `${Math.min(100, data.btcDominance)}%` }} />
            </div>
            <p className="mt-1 text-xs text-muted">Bitcoin's share of total crypto market cap.</p>
          </Card>
        ) : null}
        {data.marketCap !== null ? (
          <Card title="Total market cap">
            <p className="mt-2 font-serif text-4xl">{usd(data.marketCap)}</p>
            {data.marketCapChange !== null ? (
              <p className={`mt-3 text-sm font-semibold ${up ? "" : "text-accent"}`}>
                {up ? "+" : ""}
                {data.marketCapChange.toFixed(2)}% in 24h
              </p>
            ) : null}
          </Card>
        ) : null}
      </div>
      <p className="mt-2 text-xs text-muted">
        Fear &amp; Greed Index:{" "}
        <a href="https://alternative.me/crypto/fear-and-greed-index/" target="_blank" rel="noopener noreferrer" className="underline">
          alternative.me
        </a>
        . Market data:{" "}
        <a href="https://www.coingecko.com" target="_blank" rel="noopener noreferrer" className="underline">
          CoinGecko
        </a>
        . Values can lag by minutes to a day.
      </p>
    </section>
  );
}
