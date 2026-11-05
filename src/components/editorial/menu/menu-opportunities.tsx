import { Link } from "@tanstack/react-router";
import { MenuLink } from "./menu-link";
import { MenuSection } from "./menu-section";
import { OPPORTUNITY_FILTERS } from "./menu-data";

export function MenuOpportunities({ onNavigate }: { onNavigate: () => void }) {
  return (
    <MenuSection label="Airdrops" badge="Tracker">
      <MenuLink to="/opportunities" onNavigate={onNavigate}>
        All airdrops
      </MenuLink>
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
    </MenuSection>
  );
}
