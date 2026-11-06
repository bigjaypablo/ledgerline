import { PublicShell } from "@/components/editorial/shell";
import type { ListItem } from "@/lib/editorial/opportunities";
import { OpportunityList } from "./opportunity-list";
import { OpportunityNotice } from "./opportunity-notice";

export type OpportunitiesData = {
  items: ListItem[];
  kind: string;
  rewardStatus: string;
  capital: string;
};

export function OpportunitiesView({ data }: { data: OpportunitiesData }) {
  return (
    <PublicShell>
      <main className="sheet py-8">
        <p className="text-xs font-bold tracking-widest text-accent uppercase">Airdrops</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold sm:text-5xl">Verified airdrops</h1>
        <p className="mt-3 max-w-2xl text-lg leading-7">
          Testnets, points programs and airdrops we have checked against the project's official page. Anything
          not re-verified within 14 days is removed.
        </p>
        <OpportunityList items={data.items} />
        <OpportunityNotice />
      </main>
    </PublicShell>
  );
}
