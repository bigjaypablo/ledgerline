import { Link } from "@tanstack/react-router";
import type { Opportunity } from "@/lib/editorial/opportunities";
import { nextDeadline } from "@/lib/editorial/opportunity-types";
import { ACTIVITY_LABEL, CAPITAL_LABEL, REWARD_LABEL } from "./labels";
import { OpportunityLogo } from "./logo";

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted uppercase">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

export function OpportunityCard({ item }: { item: Opportunity }) {
  const kinds = Array.from(new Set(item.campaigns.map((c) => ACTIVITY_LABEL[c.activity]))).join(" · ");
  const n = item.campaigns.length;
  return (
    <article className="border-t border-line pt-4">
      <div className="flex items-center gap-3">
        <OpportunityLogo name={item.name} url={item.logoUrl} size={44} />
        <div className="min-w-0">
          <p className="truncate text-xs font-bold tracking-widest text-accent uppercase">
            {kinds || "Airdrop"}
            {item.sponsored ? " · Sponsored" : ""}
          </p>
          <h3 className="font-serif text-2xl leading-tight font-semibold">
            <Link to="/opportunities/$slug" params={{ slug: item.slug }} className="hover:text-accent">
              {item.name}
            </Link>
          </h3>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted">
        {item.chain}
        {item.chain && n ? " · " : ""}
        {n ? `${n} campaign${n > 1 ? "s" : ""}` : ""}
      </p>
      {item.summary ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{item.summary}</p> : null}
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <Fact label="Reward" value={REWARD_LABEL[item.rewardStatus]} />
        <Fact label="Capital" value={CAPITAL_LABEL[item.capital]} />
        <Fact label="Time" value={item.timeMinutes ? `About ${item.timeMinutes} min` : "Not stated"} />
        <Fact label="Next deadline" value={nextDeadline(item.campaigns) || item.deadline || "None announced"} />
      </dl>
      {item.riskNote ? (
        <p className="mt-3 line-clamp-2 border-l-2 border-accent pl-3 text-sm leading-6">
          <span className="font-semibold">Risk: </span>
          {item.riskNote}
        </p>
      ) : null}
      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <span>Verified {item.verifiedOn}</span>
        <Link to="/opportunities/$slug" params={{ slug: item.slug }} className="inline-flex min-h-11 items-center text-sm font-semibold text-accent">
          Full details →
        </Link>
      </div>
    </article>
  );
}
