import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
  getCoinChart,
  getMarketWidgets,
  getPrices,
  type ChartData,
  type MarketWidgets as Data,
} from "@/lib/editorial/public";

const GREEN = "#3c9a5f";
const RED = "#c0392b";

const COINS = ["BTC", "ETH", "SOL", "XRP", "ADA"];
const NAMES: Record<string, string> = { BTC: "Bitcoin", ETH: "Ethereum", SOL: "Solana", XRP: "XRP", ADA: "Cardano" };
const RANGES: Array<[string, string, string]> = [
  ["1h", "1H", "Last hour"],
  ["24h", "24H", "Last 24 hours"],
  ["7d", "7D", "Last 7 days"],
  ["30d", "30D", "Last 30 days"],
  ["6m", "6M", "Last 6 months"],
  ["1y", "1Y", "Last 12 months"],
];

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
      <text x="100" y="132" textAnchor="middle" fontSize="14" fill="currentColor" opacity="0.75">
        {label}
      </text>
    </svg>
  );
}

function Card({ title, tag, className = "", children }: { title: string; tag?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`flex flex-col border border-line bg-card p-3 md:p-4 ${className}`}>
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

function Change({ v }: { v: number }) {
  const up = v >= 0;
  return (
    <span className="text-sm font-semibold" style={{ color: up ? GREEN : RED }}>
      {up ? "▲" : "▼"} {Math.abs(v).toFixed(2)}%
    </span>
  );
}

function fmtPrice(v: number): string {
  const digits = v >= 100 ? 0 : v >= 1 ? 2 : 4;
  return "$" + v.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function fmtTime(ts: number, range: string): string {
  const d = new Date(ts);
  if (range === "1h") return d.toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" });
  if (range === "24h" || range === "7d" || range === "30d") {
    return d.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  }
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function Pick({ value, onChange, label, children }: { value: string; onChange: (v: string) => void; label: string; children: React.ReactNode }) {
  return (
    <span className="relative inline-flex">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="min-h-9 appearance-none rounded-full border border-line bg-paper py-0 pr-8 pl-3.5 text-xs font-semibold text-ink"
      >
        {children}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted" />
    </span>
  );
}

const arrowCls = "inline-grid size-9 place-items-center rounded-full border border-line bg-paper text-muted hover:text-ink";

function PriceCard() {
  const [coin, setCoin] = useState("BTC");
  const [range, setRange] = useState("24h");
  const [chart, setChart] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const [livePrice, setLivePrice] = useState<Record<string, number>>({});
  const box = useRef<HTMLDivElement>(null);
  const gid = useId().replace(/[^a-zA-Z0-9]/g, "") + "g";
  const step = (d: number) => setCoin(COINS[(COINS.indexOf(coin) + d + COINS.length) % COINS.length]);

  useEffect(() => {
    let live = true;
    const load = () =>
      getPrices()
        .then((r) => {
          if (live && r.ok) setLivePrice(Object.fromEntries(r.quotes.map((q) => [q.symbol, q.usd])));
        })
        .catch(() => {});
    void load();
    const t = window.setInterval(load, 60_000);
    return () => {
      live = false;
      window.clearInterval(t);
    };
  }, []);

  useEffect(() => {
    let live = true;
    setLoading(true);
    setFailed(false);
    setHover(null);
    getCoinChart({ data: { coin, range } })
      .then((v) => {
        if (!live) return;
        if (v.ok) setChart(v);
        else setFailed(true);
      })
      .catch(() => {
        if (live) setFailed(true);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [coin, range]);

  const pts = chart?.points ?? [];
  const n = pts.length;
  const idx = n ? (hover === null ? n - 1 : Math.min(n - 1, Math.max(0, hover))) : 0;
  const cur = n ? pts[idx] : null;
  const first = n ? pts[0][1] : 0;
  const live = livePrice[chart?.coin ?? coin];
  const shown = cur ? (hover === null && live ? live : cur[1]) : 0;
  const change = shown && first ? ((shown - first) / first) * 100 : 0;
  const color = change >= 0 ? GREEN : RED;

  const W = 300;
  const H = 120;
  const prices = pts.map((p) => p[1]);
  const min = n ? Math.min(...prices) : 0;
  const max = n ? Math.max(...prices) : 1;
  const span = max - min || 1;
  const px = (i: number) => (n > 1 ? (i / (n - 1)) * W : 0);
  const py = (v: number) => H - 10 - ((v - min) / span) * (H - 24);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${px(i).toFixed(1)} ${py(p[1]).toFixed(1)}`).join(" ");

  function track(e: React.PointerEvent) {
    const el = box.current;
    if (!el || n < 2) return;
    const r = el.getBoundingClientRect();
    setHover(Math.round(((e.clientX - r.left) / r.width) * (n - 1)));
  }

  const rangeLabel = RANGES.find((r) => r[0] === range)?.[2] ?? "";

  return (
    <div className="col-span-2 border border-line bg-card p-3 md:p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button type="button" aria-label="Previous coin" className={arrowCls} onClick={() => step(-1)}>
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <Pick value={coin} onChange={setCoin} label="Coin">
            {COINS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Pick>
          <button type="button" aria-label="Next coin" className={arrowCls} onClick={() => step(1)}>
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
        <Pick value={range} onChange={setRange} label="Time range">
          {RANGES.map(([v, short]) => (
            <option key={v} value={v}>
              {short}
            </option>
          ))}
        </Pick>
      </div>
      {cur ? (
        <div key={chart?.coin} className="coin-flip">
          <p className="mt-3 text-xs font-semibold tracking-widest text-muted uppercase">{NAMES[chart?.coin ?? coin]}</p>
          <p className="font-serif text-3xl leading-tight">{fmtPrice(shown)}</p>
          <div className="mt-0.5 flex items-center justify-between gap-2">
            <span>
              <Change v={change} />
              {hover !== null ? <span className="ml-1 text-xs text-muted">since start</span> : null}
            </span>
            <span className={hover !== null ? "text-sm font-semibold" : "text-xs text-muted"}>
              {hover !== null ? fmtTime(cur[0], range) : rangeLabel}
            </span>
          </div>
          <div
            ref={box}
            className={`relative mt-3 h-32 touch-pan-y select-none ${loading ? "opacity-50" : ""}`}
            onPointerDown={track}
            onPointerMove={track}
            onPointerLeave={() => setHover(null)}
          >
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <defs>
                <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity="0.32" />
                  <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="0" x2={W} y1={py(first)} y2={py(first)} stroke="currentColor" strokeOpacity="0.25" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
              <path d={`${line} L${W} ${H} L0 ${H} Z`} fill={`url(#${gid})`} />
              <path d={line} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
            {hover === null ? (
              <span
                className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ left: "100%", top: `${(py(pts[n - 1][1]) / H) * 100}%`, background: color }}
              >
                <span className="absolute inset-0 animate-ping rounded-full opacity-60" style={{ background: color }} />
              </span>
            ) : (
              <>
                <div className="absolute top-0 bottom-0 w-px bg-muted/60" style={{ left: `${(idx / (n - 1)) * 100}%` }} />
                <div
                  className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card"
                  style={{ left: `${(idx / (n - 1)) * 100}%`, top: `${(py(cur[1]) / H) * 100}%`, background: color }}
                />
              </>
            )}
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted">
            <span>Low {fmtPrice(min)}</span>
            <span>High {fmtPrice(max)}</span>
          </div>
          {failed ? <p className="mt-1 text-xs text-muted">Could not refresh. Showing the last chart.</p> : null}
        </div>
      ) : (
        <div className="grid min-h-[15rem] place-items-center text-sm text-muted">
          {failed ? "The chart is unavailable right now." : "Loading chart…"}
        </div>
      )}
    </div>
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

  const fg = data?.fearGreed ?? null;

  return (
    <section className="sheet border-t border-ink py-6" aria-label="Market widgets">
      <div className="mb-3 flex items-end justify-between gap-3 border-b border-ink pb-2">
        <h2 className="text-sm font-bold tracking-widest uppercase">Market snapshot</h2>
        <span className="text-xs text-muted">Not financial advice.</span>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
        <PriceCard />
        {fg ? (
          <Card title="Fear & Greed" tag="Daily">
            <Gauge value={fg.value} label={fg.label} />
          </Card>
        ) : null}
        {data && data.marketCap !== null ? (
          <Card title="Total market cap" tag="24H">
            <div className="my-auto py-3">
              <p className="font-serif text-3xl">{usd(data.marketCap)}</p>
              {data.marketCapChange !== null ? <Change v={data.marketCapChange} /> : null}
              <p className="mt-1 text-xs text-muted">All cryptocurrencies combined</p>
              {data.marketVolume !== null ? <p className="text-xs text-muted">24h volume {usd(data.marketVolume)}</p> : null}
            </div>
          </Card>
        ) : null}
        {data && data.btcDominance !== null ? (
          <Card title="Bitcoin dominance" className="col-span-2 md:col-span-4">
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
        . Values can lag by minutes to a day.{data ? " Updated " + new Date(data.updatedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) + "." : null}
      </p>
    </section>
  );
}
