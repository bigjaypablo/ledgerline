import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import type { Opportunity } from "@/lib/editorial/opportunities";
import { nextDeadline } from "@/lib/editorial/opportunity-types";
import { ACTIVITY_LABEL } from "./labels";
import { OpportunityLogo } from "./logo";

const LEVEL = { confirmed: 3, potential: 2, none: 1 } as const;
const LEVEL_TEXT = {
  confirmed: "Reward confirmed",
  potential: "Reward potential",
  none: "No reward",
} as const;
const CAPITAL = {
  none: "No capital",
  gas_only: "Gas only",
  funds_at_risk: "Funds at risk",
} as const;

function endKey(item: Opportunity): string {
  const raw = nextDeadline(item.campaigns) || item.deadline || "";
  const m = /^\d{4}-\d{2}-\d{2}/.exec(String(raw));
  return m ? m[0] : "";
}

function chains(item: Opportunity): string[] {
  return item.chain
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}

function Bars({ level }: { level: number }) {
  const heights = ["h-2", "h-3", "h-4"];
  return (
    <span className="inline-flex items-end gap-0.5" aria-hidden>
      {heights.map((h, i) => (
        <span
          key={h}
          className={
            "w-1 " + h + (i < level ? " bg-accent" : " bg-line")
          }
        />
      ))}
    </span>
  );
}

function Chip({ text }: { text: string }) {
  return (
    <span className="rounded-full border border-line px-3 py-1 text-xs">
      {text}
    </span>
  );
}

function Card({ item }: { item: Opportunity }) {
  const kinds = Array.from(
    new Set(item.campaigns.map((c) => ACTIVITY_LABEL[c.activity])),
  );
  const sub = kinds.join(" · ") || "Airdrop";
  const tags = [kinds[0], CAPITAL[item.capital], chains(item)[0]].filter(
    Boolean,
  ) as string[];
  const end = endKey(item);
  return (
    <li>
      <Link
        to="/opportunities/$slug"
        params={{ slug: item.slug }}
        className="block h-full border border-line bg-card p-4 font-sans"
      >
        <div className="flex items-center gap-3">
          <OpportunityLogo name={item.name} url={item.logoUrl} size={48} />
          <div className="min-w-0">
            <p className="text-lg leading-tight font-semibold">
              {item.name}
              {item.sponsored ? (
                <span className="ml-2 text-[10px] font-bold text-muted uppercase">
                  Sponsored
                </span>
              ) : null}
            </p>
            <p className="truncate text-[11px] tracking-widest text-muted uppercase">
              {sub}
            </p>
          </div>
        </div>
        {item.summary ? (
          <p className="mt-3 line-clamp-2 text-sm leading-5 text-muted">
            {item.summary}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((t) => (
            <Chip key={t} text={t} />
          ))}
          {item.riskNote ? <Chip text="Risk noted" /> : null}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-sm">
          <span className="inline-flex items-center gap-2 font-medium text-accent">
            <Bars level={LEVEL[item.rewardStatus]} />
            {LEVEL_TEXT[item.rewardStatus]}
          </span>
          <span className="font-semibold">View guide →</span>
        </div>
        {end ? (
          <p className="mt-2 text-[11px] text-muted">Ends {end}</p>
        ) : null}
      </Link>
    </li>
  );
}

const sel = "min-h-11 border border-line bg-card px-3 text-sm";

export function OpportunityList({ items }: { items: Opportunity[] }) {
  const [q, setQ] = useState("");
  const [chain, setChain] = useState("");
  const [sort, setSort] = useState("verified");
  const needle = q.trim().toLowerCase();
  const all = Array.from(new Set(items.flatMap(chains))).sort();
  const shown = items
    .filter((i) => !chain || chains(i).includes(chain))
    .filter(
      (i) =>
        !needle ||
        (i.name + " " + i.chain + " " + i.summary)
          .toLowerCase()
          .includes(needle),
    )
    .sort((a, b) => {
      if (sort === "deadline") {
        const x = endKey(a) || "9999";
        const y = endKey(b) || "9999";
        return x.localeCompare(y);
      }
      return b.verifiedOn.localeCompare(a.verifiedOn);
    });
  return (
    <div className="font-sans">
      <label className="mt-6 flex min-h-12 items-center gap-3 border border-line bg-card px-3">
        <Search className="size-4 shrink-0 text-muted" aria-hidden />
        <span className="sr-only">Search airdrops</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search projects, chains or keywords…"
          className="w-full bg-transparent text-sm outline-none"
        />
      </label>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <select
          className={sel}
          value={chain}
          onChange={(e) => setChain(e.target.value)}
          aria-label="Chain"
        >
          <option value="">All chains</option>
          {all.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className={sel}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort by"
        >
          <option value="verified">Latest verified</option>
          <option value="deadline">Soonest deadline</option>
        </select>
      </div>
      <p className="mt-3 text-sm text-muted">
        {shown.length} airdrop{shown.length === 1 ? "" : "s"}
      </p>
      {shown.length === 0 ? (
        <p className="mt-6 border-t border-ink pt-6 text-muted">
          {items.length === 0
            ? "No verified opportunities right now. Check back soon."
            : "Nothing matches that search."}
        </p>
      ) : (
        <ul className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((i) => (
            <Card key={i.id} item={i} />
          ))}
        </ul>
      )}
    </div>
  );
}
