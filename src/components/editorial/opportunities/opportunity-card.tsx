import type { Opportunity } from "@/lib/editorial/opportunities";
import { CAPITAL_LABEL, KIND_LABEL, REWARD_LABEL } from "./labels";

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted uppercase">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

export function OpportunityCard({ item }: { item: Opportunity }) {
  return (
    <article className="border-t border-line pt-4">
      <p className="text-xs font-bold tracking-widest text-accent uppercase">
        {KIND_LABEL[item.kind]}
        {item.chain ? ` · ${item.chain}` : ""}
        {item.sponsored ? " · Sponsored" : ""}
      </p>
      <h3 className="mt-1 font-serif text-2xl font-semibold leading-tight">{item.name}</h3>
      {item.summary ? <p className="mt-2 text-sm leading-6 text-muted">{item.summary}</p> : null}
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <Fact label="Reward" value={REWARD_LABEL[item.rewardStatus]} />
        <Fact
          label="Capital"
          value={`${CAPITAL_LABEL[item.capital]}${item.costNote ? ` (${item.costNote})` : ""}`}
        />
        <Fact label="Time" value={item.timeMinutes ? `About ${item.timeMinutes} min` : "Not stated"} />
        <Fact label="Deadline" value={item.deadline || "None announced"} />
      </dl>
      {item.riskNote ? (
        <p className="mt-3 border-l-2 border-accent pl-3 text-sm leading-6">
          <span className="font-semibold">Risk: </span>
          {item.riskNote}
        </p>
      ) : null}
      <p className="mt-3 text-xs text-muted">
        Verified {item.verifiedOn} ·{" "}
        <a
          href={item.officialUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="underline hover:text-accent"
        >
          Official page
        </a>
      </p>
    </article>
  );
}
