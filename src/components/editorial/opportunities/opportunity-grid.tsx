import type { Opportunity } from "@/lib/editorial/opportunities";
import { OpportunityCard } from "./opportunity-card";

export function OpportunityGrid({ items }: { items: Opportunity[] }) {
  if (items.length === 0) {
    return (
      <p className="mt-10 border-t border-ink pt-6 text-muted">
        No verified opportunities right now. Check back soon.
      </p>
    );
  }
  return (
    <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <OpportunityCard key={item.id} item={item} />
      ))}
    </div>
  );
}
