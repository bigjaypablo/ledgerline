import { Link } from "@tanstack/react-router";
import { OPPORTUNITY_FILTERS } from "./menu-data";

export function MenuOpportunities({ onNavigate }: { onNavigate: () => void }) {
  return (
    <section className="border-t border-line pt-4">
      <Link to="/opportunities" onClick={onNavigate} className="flex min-h-11 items-center justify-between">
        <span className="text-xs font-bold tracking-widest text-accent uppercase">Airdrops</span>
        <span className="bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-accent uppercase">
          Tracker
        </span>
      </Link>
      <div className="ml-1 border-l border-line pl-3">
        {OPPORTUNITY_FILTERS.map((f) => (
          <Link
            key={f.kind}
            to="/opportunities"
            search={{ kind: f.kind }}
            onClick={onNavigate}
            className="flex min-h-10 items-center text-[15px] text-muted hover:text-ink"
          >
            {f.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
