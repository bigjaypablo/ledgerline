import { Link } from "@tanstack/react-router";
import { PublicShell } from "@/components/editorial/shell";
import type { ListItem } from "@/lib/editorial/opportunities";
import { formatDate } from "@/lib/editorial/text";
import { OpportunityList } from "./opportunity-list";
import { OpportunityNotice } from "./opportunity-notice";

export type OpportunitiesData = {
  items: ListItem[];
  kind: string;
  rewardStatus: string;
  capital: string;
};

const LIVE = ["confirmed", "snapshot", "verification", "rewards_available"];

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/15 p-3">
      <dt className="text-[11px] font-bold tracking-widest text-inverse-fg/70 uppercase">{label}</dt>
      <dd className="mt-1 font-serif text-2xl">{value}</dd>
    </div>
  );
}

export function OpportunitiesView({ data }: { data: OpportunitiesData }) {
  const confirmed = data.items.filter((i) => LIVE.includes(i.projectStatus)).length;
  const watching = data.items.filter((i) => i.projectStatus === "potential").length;
  const latest = data.items.map((i) => i.verifiedOn).filter(Boolean).sort().pop() ?? "";
  return (
    <PublicShell>
      <section className="bg-ink text-inverse-fg">
        <div className="sheet py-10">
          <p className="text-xs font-bold tracking-widest text-inverse-fg/70 uppercase">Airdrops</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold sm:text-5xl">Verified airdrops</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-inverse-fg/85">
            Every entry is checked against the project's official page and re-checked every 14 days. If we cannot
            re-verify it, it comes off. Nothing here is a recommendation.
          </p>
          <dl className="mt-6 grid grid-cols-3 gap-2">
            <Stat label="Confirmed" value={String(confirmed)} />
            <Stat label="Watchlist" value={String(watching)} />
            <Stat label="Last verified" value={latest ? formatDate(latest) : "—"} />
          </dl>
          <Link to="/standards" className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4">
            How we verify
          </Link>
        </div>
      </section>
      <main className="sheet py-8">
        <OpportunityList items={data.items} />
        <OpportunityNotice />
      </main>
    </PublicShell>
  );
}
