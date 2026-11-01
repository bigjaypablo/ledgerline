import { useEffect, useId, useState } from "react";
import { getMarketWidgets, type MarketWidgets as Data } from "@/lib/editorial/public";

const GREEN = "#3c9a5f";
const RED = "#c0392b";

const SEGMENTS: Array<[number, number, string]> = [
  [0, 23, "#c0392b"],
  [27, 43, "#e07a30"],
  [47, 53, "#e0b830"],
  [57, 73, "#8fbf4a"],
  [77, 100, "#3c9a5f"],
];

function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function arc(cx: number, cy: number, r: number, from: number, to: number): string {
  const a1 = 135 + 2.7 * from;
  const a2 = 135 + 2.7 * to;
  const [x1, y1] = polar(cx, cy, r, a1);
  const [x2, y2] = polar(cx, cy, r, a2);
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${a2 - a1 > 180 ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

function colorFor(v: number): string {
  for (const [a, b, c] of SEGMENTS) if (v >= a && v <= b + 3) return c;
  return SEGMENTS[SEGMENTS.length - 1][2];
}

function Gauge({ value, label }: { value: number; label: string }) {
  const v = Math.min(100, Math.max(0, value));
  const [mx, my] = polar(100, 100, 78, 135 + 2.7 * v);
  return (
    <svg viewBox="0 0 200 165" className="mx-auto mt-1 block w-full max-w-[140px]" role="img" aria-label={`Fear and greed index ${value} out of 100, ${label}`}>
      {SEGMENTS.map(([a, b, c]) => (
        <path key={a} d={arc(100, 100, 78, a, b)} fill="none" stroke={c} strokeWidth="13" />
      ))}
      <circle cx={mx} cy={my} r="9" fill={colorFor(v)} stroke="#fff" strokeWidth="3" />
      <text x="100" y="108" textAnchor="middle" fontSize="40" fontWeight="600" fill="currentColor" style={{ fontFamily: "var(--font-serif)" }}>
        {value}
      </text>
      <text x="100" y="132" textAnchor="middle" fontSize="14" fill="currentColor" opacity="0.65">
        {label}
      </text>
    </svg>
  );
}

function Area({ points, up }: { points: number[]; up: boolean }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const W = 300;
  const H = 100;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const xy = points.map((p, i) => [(i / (points.length - 1)) * W, H - 8 - ((p - min) / span) * (H - 20)] as const);
  const line = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const color = up ? GREEN : RED;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="mt-2 block h-16 w-full" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${W} ${H} L0 ${H} Z`} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}

function Card({ title, tag, wide, children }: { title: string; tag?: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={"border border-line bg-card p-3 md:p-4 " + (wide ? "col-span-2 md:col-span-1" : "")}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-wide">{title}</h3>
        {tag ? <span className="text-xs font-bold tracking-widest text-accent uppercase">{tag}</span> : null}
      </div>
      {children}
    </div>
  );
}

function usd(v: number): string {
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  return `$${(v / 1e9).toFixed(0)}B`;
}

function Change({ v, suffix }: { v: number; suffix: string }) {
  const up = v >= 0;
  return (
    <span className="text-sm font-semibold" style={{ color: up ? GREEN : RED }}>
      {up ? "▲" : "▼"} {Math.abs(v).toFixed(2)}% {suffix}
    </span>
  );
}

export function MarketWidgets() {
  const [data, setData] = useState<Data | null>(null);

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

  if (!data || (!data.fearGreed && !data.btc && data.marketCap === null)) return null;
  const { fearGreed: fg, btc } = data;

  return (
    <section className="sheet border-t border-ink py-6" aria-label="Market widgets">
      <div className="mb-3 flex items-end justify-between gap-3 border-b border-ink pb-2">
        <h2 className="text-sm font-bold tracking-widest uppercase">Market snapshot</h2>
        <span className="text-xs text-muted">Informational only. Not financial advice.</span>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
        {fg ? (
          <Card title="Fear & Greed">
            <Gauge value={fg.value} label={fg.label} />
          </Card>
        ) : null}
        {btc ? (
          <Card title="Bitcoin" tag="7D">
            <p className="mt-1 font-serif text-2xl">${Math.round(btc.price).toLocaleString("en-US")}</p>
            <Change v={btc.change7d} suffix="" />
            <Area points={btc.points} up={btc.change7d >= 0} />
          </Card>
        ) : null}
        {data.marketCap !== null ? (
          <Card title="Total market cap" tag="24H" wide>
            <div className="mt-1 flex items-baseline justify-between">
              <p className="font-serif text-2xl">{usd(data.marketCap)}</p>
              {data.marketCapChange !== null ? <Change v={data.marketCapChange} suffix="" /> : null}
            </div>
          </Card>
        ) : null}
        {data.btcDominance !== null ? (
          <Card title="Bitcoin dominance" wide>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="font-serif text-2xl">{data.btcDominance.toFixed(1)}%</span>
              <span className="text-xs text-muted">of total crypto market cap</span>
            </div>
            <div className="mt-2 h-2 bg-line">
              <div className="h-full bg-accent" style={{ width: `${Math.min(100, data.btcDominance)}%` }} />
            </div>
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
