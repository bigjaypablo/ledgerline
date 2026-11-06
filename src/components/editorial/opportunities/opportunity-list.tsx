import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import type { Opportunity } from "@/lib/editorial/opportunities";
import { nextDeadline } from "@/lib/editorial/opportunity-types";
import { ACTIVITY_LABEL } from "./labels";
import { OpportunityLogo } from "./logo";

const REWARD = {
  confirmed: "Reward confirmed",
  potential: "Potential",
  none: "No reward",
} as const;
const CAPITAL = {
  none: "No capital",
  gas_only: "Gas only",
  funds_at_risk: "Funds at risk",
} as const;

function parse(v: string): Date | null {
  const m = /^\d{4}-\d{2}-\d{2}/.exec(v || "");
  if (!m) return null;
  const d = new Date(m[0] + "T00:00:00");
  return Number.isNaN(d.getTime()) ? null : d;
}

function short(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function endsOn(item: Opportunity): Date | null {
  const raw = nextDeadline(item.campaigns) || item.deadline || "";
  return parse(String(raw));
}

function Row({ item }: { item: Opportunity }) {
  const end = endsOn(item);
  const ver = parse(item.verifiedOn);
  const kinds = Array.from(
    new Set(item.campaigns.map((c) => ACTIVITY_LABEL[c.activity])),
  ).join(" · ");
  const sub = [kinds || "Airdrop", item.chain].filter(Boolean).join(" · ");
  return (
    <li className="border-b border-line">
      <Link
        to="/opportunities/$slug"
        params={{ slug: item.slug }}
        className="grid grid-cols-[3.5rem_1fr] items-start gap-3 py-4 font-sans"
      >
        <span className="pt-1 text-[11px] leading-tight font-bold tracking-wide text-accent uppercase">
          <span className="block text-[9px] font-semibold text-muted">
            {end ? "Ends" : "Verified"}
          </span>
          {end ? short(end) : ver ? short(ver) : "—"}
        </span>
        <span className="flex min-w-0 items-start gap-3">
          <OpportunityLogo name={item.name} url={item.logoUrl} size={44} />
          <span className="min-w-0 flex-1">
            <span className="flex items-start justify-between gap-2">
              <span className="min-w-0">
                <span className="block text-base leading-tight font-semibold">
                  {item.name}
                  {item.sponsored ? (
                    <span className="ml-2 text-[10px] font-bold text-muted uppercase">
                      Sponsored
                    </span>
                  ) : null}
                </span>
                <span className="mt-0.5 block truncate text-[11px] tracking-wide text-muted uppercase">
                  {sub}
                </span>
              </span>
              <span className="shrink-0 text-right text-[11px] leading-tight font-semibold text-accent">
                {REWARD[item.rewardStatus]}
                <span className="block font-normal text-muted">
                  {CAPITAL[item.capital]}
                </span>
              </span>
            </span>
            {item.summary ? (
              <span className="mt-1.5 line-clamp-2 block text-sm leading-5 text-muted">
                {item.summary}
              </span>
            ) : null}
            {item.riskNote ? (
              <span className="mt-1.5 inline-block border border-line px-1.5 py-0.5 text-[10px] font-semibold text-muted uppercase">
                Risk noted
              </span>
            ) : null}
          </span>
        </span>
      </Link>
    </li>
  );
}

function Block({ title, items }: { title: string; items: Opportunity[] }) {
  return (
    <section className="mt-8">
      <h2 className="font-sans text-2xl font-medium">{title}</h2>
      <ul className="mt-3 border-t border-ink">
        {items.map((i) => (
          <Row key={i.id} item={i} />
        ))}
      </ul>
    </section>
  );
}

export function OpportunityList({ items }: { items: Opportunity[] }) {
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const shown = needle
    ? items.filter((i) =>
        (i.name + " " + i.chain + " " + i.summary).toLowerCase().includes(needle),
      )
    : items;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const closing = items
    .map((i) => ({ i, d: endsOn(i) }))
    .filter((x) => x.d && x.d.getTime() >= today.getTime())
    .sort((a, b) => a.d!.getTime() - b.d!.getTime())
    .map((x) => x.i);
  const latest = items.reduce(
    (m, i) => (i.verifiedOn > m ? i.verifiedOn : m),
    "",
  );
  const lastDate = parse(latest);
  return (
    <div>
      <p className="mt-6 font-sans text-sm text-muted">
        {items.length} verified
        {lastDate ? " · last checked " + short(lastDate) : ""}
      </p>
      <label className="mt-3 flex min-h-12 items-center gap-3 border border-line bg-card px-3 font-sans">
        <Search className="size-4 shrink-0 text-muted" aria-hidden />
        <span className="sr-only">Search airdrops</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search projects, chains or keywords…"
          className="w-full bg-transparent text-sm outline-none"
        />
      </label>
      {!needle && closing.length >= 3 ? (
        <Block title="Closing soon" items={closing.slice(0, 8)} />
      ) : null}
      {shown.length === 0 ? (
        <p className="mt-8 border-t border-ink pt-6 text-muted">
          {items.length === 0
            ? "No verified opportunities right now. Check back soon."
            : "Nothing matches that search."}
        </p>
      ) : (
        <Block title="All airdrops" items={shown} />
      )}
    </div>
  );
}
