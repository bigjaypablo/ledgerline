import { Link } from "@tanstack/react-router";
import { Filter, Search, Settings } from "lucide-react";
import { useMemo, useState } from "react";
import type { ListItem } from "@/lib/editorial/opportunities";
import { projectTasks } from "@/lib/editorial/opportunity-types";
import {
  activeCount, chainsOf, daysAgo, EMPTY, endKey, matches, sortItems,
  type Filters, type Sort,
} from "./filter-state";
import { STATUS_HELP, STATUS_TAG, TASK_LABEL } from "./labels";
import { OpportunityLogo } from "./logo";
import { FilterSheet, SettingsSheet } from "./opportunity-sheets";

const TONE: Record<string, string> = {
  none: "border-line text-muted",
  potential: "border-line text-muted",
  confirmed: "border-accent text-accent",
  snapshot: "border-ink text-ink",
  verification: "border-ink text-ink",
  rewards_available: "border-accent bg-accent text-white",
  distributed: "border-line bg-line text-muted",
};

function Tag({ status }: { status: keyof typeof STATUS_TAG }) {
  const cls = "rounded-full border px-3 py-1 text-xs font-semibold " + TONE[status];
  return <span className={cls}>{STATUS_TAG[status]}</span>;
}

function Card({ item, compact }: { item: ListItem; compact: boolean }) {
  const tasks = projectTasks(item.campaigns);
  const end = endKey(item);
  const fresh = daysAgo(item.createdOn) <= 7;
  const sub = [item.category, chainsOf(item)[0]].filter(Boolean).join(" · ");
  return (
    <li>
      <Link
        to="/opportunities/$slug"
        params={{ slug: item.slug }}
        className="block h-full border border-line bg-card p-4 font-sans"
      >
        <div className="flex items-center gap-3">
          <OpportunityLogo name={item.name} url={item.logoUrl} size={compact ? 40 : 48} />
          <div className="min-w-0 flex-1">
            <p className="text-lg leading-tight font-semibold">
              {item.name}
              {fresh ? <span className="ml-2 text-[10px] font-bold text-accent uppercase">New</span> : null}
              {item.sponsored ? <span className="ml-2 text-[10px] font-bold text-muted uppercase">Sponsored</span> : null}
            </p>
            <p className="truncate text-[11px] tracking-widest text-muted uppercase">{sub || "Airdrop"}</p>
          </div>
          {compact ? <Tag status={item.projectStatus} /> : null}
        </div>
        {!compact && item.summary ? (
          <p className="mt-3 line-clamp-2 text-sm leading-5 text-muted">{item.summary}</p>
        ) : null}
        {!compact && tasks.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {tasks.slice(0, 4).map((t) => (
              <span key={t} className="rounded-full border border-line px-3 py-1 text-xs">{TASK_LABEL[t]}</span>
            ))}
          </div>
        ) : null}
        {!compact ? (
          <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-sm">
            <Tag status={item.projectStatus} />
            <span className="font-semibold">View guide →</span>
          </div>
        ) : null}
        {!compact && end ? <p className="mt-2 text-[11px] text-muted">Next deadline {end}</p> : null}
      </Link>
    </li>
  );
}

function Radar({ items }: { items: ListItem[] }) {
  const picks = items.filter((i) => i.featured || i.sponsored).slice(0, 8);
  if (picks.length < 2) return null;
  return (
    <section className="mt-6">
      <h2 className="text-2xl font-medium">On the radar</h2>
      <ul className="mt-3 flex snap-x gap-3 overflow-x-auto pb-2">
        {picks.map((i) => (
          <li key={i.id} className="w-64 shrink-0 snap-start">
            <Link
              to="/opportunities/$slug"
              params={{ slug: i.slug }}
              className="block h-full border border-line bg-card p-4"
            >
              <div className="flex items-center gap-3">
                <OpportunityLogo name={i.name} url={i.logoUrl} size={40} />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{i.name}</p>
                  <p className="text-[10px] font-bold tracking-widest text-muted uppercase">
                    {i.sponsored ? "Sponsored" : "Featured"}
                  </p>
                </div>
              </div>
              {i.summary ? (
                <p className="mt-3 line-clamp-2 text-sm text-muted">{i.summary}</p>
              ) : null}
              <div className="mt-3">
                <Tag status={i.projectStatus} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Group(p: { title: string; note: string; items: ListItem[]; compact: boolean; fold?: boolean }) {
  if (p.items.length === 0) return null;
  const grid = (
    <ul className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {p.items.map((i) => (
        <Card key={i.id} item={i} compact={p.compact} />
      ))}
    </ul>
  );
  if (p.fold) {
    return (
      <details className="mt-8 border-t border-ink pt-4">
        <summary className="min-h-11 cursor-pointer py-2 text-xl font-medium">
          {p.title} <span className="text-sm font-normal text-muted">({p.items.length})</span>
        </summary>
        <p className="mt-1 text-sm text-muted">{p.note}</p>
        {grid}
      </details>
    );
  }
  return (
    <section className="mt-6">
      <h2 className="text-2xl font-medium">{p.title}</h2>
      <p className="mt-1 text-sm text-muted">{p.note}</p>
      {grid}
    </section>
  );
}

const iconBtn = "relative inline-flex min-h-12 min-w-12 items-center justify-center border border-line bg-card";

export function OpportunityList({ items }: { items: ListItem[] }) {
  const [q, setQ] = useState("");
  const [f, setF] = useState<Filters>(EMPTY);
  const [sort, setSort] = useState<Sort>("updated");
  const [compact, setCompact] = useState(false);
  const [fOpen, setFOpen] = useState(false);
  const [sOpen, setSOpen] = useState(false);
  const needle = q.trim().toLowerCase();

  const shown = useMemo(() => {
    const hit = (i: ListItem) =>
      !needle || (i.name + " " + i.chain + " " + i.summary + " " + i.tags.join(" ")).toLowerCase().includes(needle);
    return sortItems(items.filter((i) => matches(i, f) && hit(i)), sort);
  }, [items, f, needle, sort]);

  const LIVE = ["confirmed", "snapshot", "verification", "rewards_available"];

  const groups = useMemo(() => {
    const live = shown.filter((i) => LIVE.includes(i.projectStatus));
    if (sort === "updated") {
      live.sort((a, b) => {
        const x = endKey(a);
        const y = endKey(b);
        if (x && y) return x < y ? -1 : x > y ? 1 : 0;
        if (x) return -1;
        if (y) return 1;
        return 0;
      });
    }
    return {
      live,
      watch: shown.filter((i) => i.projectStatus === "potential"),
      ended: shown.filter((i) => i.projectStatus === "distributed"),
    };
  }, [shown, sort]);

  const opts = useMemo(() => {
    const uniq = (l: string[]) => Array.from(new Set(l.filter(Boolean))).sort();
    return {
      categories: uniq(items.map((i) => i.category)),
      tags: uniq(items.flatMap((i) => i.tags)),
      chains: uniq(items.flatMap(chainsOf)),
    };
  }, [items]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const i of items) for (const t of projectTasks(i.campaigns)) m.set(t, (m.get(t) ?? 0) + 1);
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [items]);

  const n = activeCount(f);
  const chip = (on: boolean) =>
    "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold " +
    (on ? "border-ink bg-ink text-inverse-fg" : "border-line bg-card");

  return (
    <div className="font-sans">
      <div className="mt-6 flex gap-2">
        <label className="flex min-h-12 flex-1 items-center gap-3 border border-line bg-card px-3">
          <Search className="size-4 shrink-0 text-muted" aria-hidden />
          <span className="sr-only">Search airdrops</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects, tags or chains…" className="w-full bg-transparent text-sm outline-none" />
        </label>
        <button type="button" onClick={() => setFOpen(true)} className={iconBtn} aria-label="Filters">
          <Filter className="size-5" aria-hidden />
          {n > 0 ? <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-accent text-[10px] font-bold text-white">{n}</span> : null}
        </button>
        <button type="button" onClick={() => setSOpen(true)} className={iconBtn} aria-label="Sort and view">
          <Settings className="size-5" aria-hidden />
        </button>
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto">
        <button type="button" className={chip(f.tasks.length === 0)} onClick={() => setF({ ...f, tasks: [] })}>
          All <span className="font-normal opacity-70">{items.length}</span>
        </button>
        {counts.map(([t, c]) => (
          <button key={t} type="button" className={chip(f.tasks.length === 1 && f.tasks[0] === t)} onClick={() => setF({ ...f, tasks: f.tasks[0] === t && f.tasks.length === 1 ? [] : [t] })}>
            {TASK_LABEL[t as keyof typeof TASK_LABEL]} <span className="font-normal opacity-70">{c}</span>
          </button>
        ))}
      </div>
      {n === 0 && !needle ? <Radar items={items} /> : null}
      <p className="mt-3 text-sm text-muted">
        {groups.live.length} confirmed airdrop{groups.live.length === 1 ? "" : "s"}
      </p>
      <details className="mt-2 border border-line bg-card px-3 text-sm">
        <summary className="min-h-11 cursor-pointer py-3 font-semibold">What do the statuses mean?</summary>
        <dl className="pb-3">
          {Object.entries(STATUS_TAG).map(([k, label]) => (
            <div key={k} className="mt-2">
              <dt className="font-semibold">{label}</dt>
              <dd className="text-muted">{STATUS_HELP[k as keyof typeof STATUS_HELP]}</dd>
            </div>
          ))}
        </dl>
      </details>
      {groups.live.length === 0 && groups.watch.length === 0 && groups.ended.length === 0 ? (
        <p className="mt-6 border-t border-ink pt-6 text-muted">
          {items.length === 0 ? "No verified opportunities right now. Check back soon." : "Nothing matches. Try fewer filters."}
        </p>
      ) : (
        <>
          {groups.live.length === 0 ? (
            <p className="mt-6 border-t border-ink pt-6 text-muted">No airdrop is confirmed right now.</p>
          ) : (
            <Group title="Confirmed" note="The project has officially announced a reward or token." items={groups.live} compact={compact} />
          )}
          <Group fold title="Watchlist: no reward confirmed" note="These projects have not announced a reward. Nothing here is a recommendation." items={groups.watch} compact={compact} />
          <Group fold title="Ended" note="Rewards were sent, or the claim period has ended." items={groups.ended} compact={compact} />
        </>
      )}
      <FilterSheet open={fOpen} onOpenChange={setFOpen} f={f} setF={setF} opts={opts} shown={shown.length} />
      <SettingsSheet open={sOpen} onOpenChange={setSOpen} sort={sort} setSort={setSort} compact={compact} setCompact={setCompact} />
    </div>
  );
}
