import type { OpportunityDetail } from "@/lib/editorial/opportunity-detail";
import { nextDeadline, projectStatus } from "@/lib/editorial/opportunity-types";
import { CAPITAL_LABEL, REWARD_LABEL } from "../labels";

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line bg-card p-3">
      <dt className="text-xs text-muted uppercase">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}

export function DetailFacts({ item }: { item: OpportunityDetail }) {
  return (
    <dl className="mt-6 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
      <Fact label="Status" value={REWARD_LABEL[item.campaigns.length ? projectStatus(item.campaigns) : item.rewardStatus]} />
      <Fact label="Capital" value={CAPITAL_LABEL[item.capital]} />
      <Fact label="Time" value={item.timeMinutes ? `About ${item.timeMinutes} min` : "Not stated"} />
      <Fact label="Next deadline" value={nextDeadline(item.campaigns) || item.deadline || "None announced"} />
      {item.raised ? <Fact label="Funding raised" value={item.raised} /> : null}
    </dl>
  );
}
