import { useEffect, useState } from "react";
import { getPrices, type Quote } from "@/lib/editorial/public";

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value);
}

function Row({ quotes }: { quotes: Quote[] }) {
  return (
    <>
      {quotes.map((quote) => {
        const up = quote.change >= 0;
        return (
          <li key={quote.symbol} className="flex items-baseline gap-2">
            <span className="font-semibold tracking-wide">{quote.symbol}</span>
            <span>{formatUsd(quote.usd)}</span>
            <span className={up ? "text-inverse-fg" : "text-accent"}>
              {up ? "+" : ""}
              {quote.change.toFixed(2)}%
            </span>
          </li>
        );
      })}
    </>
  );
}

export function PriceTicker() {
  const [quotes, setQuotes] = useState<Quote[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    getPrices()
      .then((result) => {
        if (!live) return;
        if (!result.ok || result.quotes.length === 0) setFailed(true);
        else setQuotes(result.quotes);
      })
      .catch(() => {
        if (live) setFailed(true);
      });
    return () => {
      live = false;
    };
  }, []);

  return (
    <div className="overflow-hidden border-b border-white/10 bg-ink text-inverse-fg">
      <div className="sheet flex items-center gap-4 py-2 text-xs">
        <span className="shrink-0 font-bold tracking-widest uppercase">Markets</span>
        {quotes ? (
          <div className="ticker-mask min-w-0 flex-1 overflow-hidden">
            <ul className="ticker-track gap-8">
              <Row quotes={quotes} />
              <Row quotes={quotes} />
            </ul>
          </div>
        ) : (
          <p className="truncate text-inverse-fg/80">
            {failed ? "Live prices are unavailable right now. Nothing below is a quote." : "Loading prices…"}
          </p>
        )}
      </div>
    </div>
  );
}
