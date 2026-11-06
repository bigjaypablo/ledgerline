import { Link } from "@tanstack/react-router";
import type { OpportunityDetail } from "@/lib/editorial/opportunity-detail";
import { OpportunityLogo } from "../logo";
import { ACTIVITY_LABEL } from "../labels";

export function DetailHeader({ item }: { item: OpportunityDetail }) {
  const kinds = Array.from(new Set(item.campaigns.map((c) => ACTIVITY_LABEL[c.activity]))).join(" · ");
  return (
    <header>
      <Link to="/opportunities" search={{}} className="text-sm font-semibold text-accent">
        ← All airdrops
      </Link>
      <div className="mt-4 flex items-center gap-4">
        <OpportunityLogo name={item.name} url={item.logoUrl} size={64} />
        <div className="min-w-0">
          <p className="text-xs font-bold tracking-widest text-accent uppercase">
            {kinds || "Airdrop"}
            {item.sponsored ? " · Sponsored" : ""}
          </p>
          <h1 className="font-serif text-4xl leading-tight font-semibold">{item.name}</h1>
          {item.chain ? <p className="text-sm text-muted">{item.chain}</p> : null}
        </div>
      </div>
      {item.summary ? <p className="mt-4 max-w-2xl text-lg leading-7">{item.summary}</p> : null}
    </header>
  );
}
