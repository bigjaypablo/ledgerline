import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { buildSearch, labelFor, type Current } from "./filter-utils";

const FIELDS: Array<keyof Current> = ["kind", "rewardStatus", "capital"];

export function OpportunityChips({ current }: { current: Current }) {
  const active = FIELDS.filter((f) => current[f]);
  if (active.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2" aria-label="Active filters">
      {active.map((f) => (
        <Link
          key={f}
          to="/opportunities"
          search={buildSearch(current, { [f]: "" })}
          className="inline-flex min-h-9 items-center gap-1 bg-ink px-3 text-xs font-semibold text-inverse-fg"
        >
          {labelFor(f, current[f])}
          <X className="size-3" aria-hidden />
          <span className="sr-only">Remove filter</span>
        </Link>
      ))}
      <Link to="/opportunities" search={{}} className="text-xs font-semibold text-accent underline">
        Clear all
      </Link>
    </div>
  );
}
